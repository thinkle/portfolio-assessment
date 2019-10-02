import fetchJsonp from 'fetch-jsonp';
import { inspect } from 'util'; // or directly
import {useState} from 'react';

function sanitize (arg) {
    if (typeof arg == 'string') {
        console.log(`String arg ${arg}`)
        return encodeURIComponent(arg)
    }
    if (typeof arg == 'object') {
        console.log(`object arg ${JSON.stringify(arg)}`);
        return encodeURIComponent(JSON.stringify(arg));
    }
    if (arg===undefined) {
        return arg;
    }
    console.log('Unknown arg type: %s %s',arg,typeof arg)
    return encodeURIComponent(arg);
}

var Api = {
    // production
    //url : 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbwU-L5LTC68yB4IE0Dm0a6SzaZUi9l04w0DL-RN3n0OfN2iCZM/exec',
    //dev
    url : 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbw37U73iU1Ei_sOsX77GbyW7RvueieogCKHevPUVIQ/dev',
    user : undefined,

    getUser () {
        console.log('getUser...');
        return new Promise ((resolve,reject)=>{
            if (this.user) {
                console.log('Using cached user %s',this.user);
                resolve(this.user)
            }
            else {
                console.log('Fetching user from google...');
                return this.runFunction('get_user');
            }
        });
    },

    getRegisterUrl () {
        return `${this.url}?register=true`
    },

    havePermissions () {
        return new Promise ((resolve,reject)=>{
            this.runFunction('get_user') // try basic call to the API
                .then((user)=>{
                    this.user = user;
                    resolve(true)
                })
                .catch((err)=>{
                    resolve(false)
                });
        });
    },

    getUrl (funcName, arg, arg2, arg3, arg4) {
        arg=sanitize(arg);
        arg2=sanitize(arg2);
        arg3=sanitize(arg3);
        arg4=sanitize(arg4);
        if (arg4 !== undefined) {
            return `${this.url}?function=${funcName}&arg=${arg}&arg2=${arg2}&arg3=${arg3}&arg4=${arg4}`;
        }
        if (arg3 !== undefined) {
            return `${this.url}?function=${funcName}&arg=${arg}&arg2=${arg2}&arg3=${arg3}`;
        }
        if (arg2 !== undefined) {
            return `${this.url}?function=${funcName}&arg=${arg}&arg2=${arg2}`;
        }
        return `${this.url}?function=${funcName}&arg=${arg}`;
    },

    getLocalCachedProp (prop) {
        return JSON.parse(window.localStorage.getItem(prop))
    },

    cacheResult (cacheName, result) {
        window.localStorage.setItem(cacheName,JSON.stringify(result))
    },

    getProp (prop) {
        return new Promise((resolve,reject)=>{
            this.runFunction('get_user_prop',prop)
                .then((result)=>{
                    try {
                        var parsed = JSON.parse(result)
                    }
                    catch (err) {
                        console.log('Error parsing property value: %s',result);
                        console.log('Treat as non-JSON?');
                        resolve(result);
                    }
                    resolve(parsed)
                }
                )
                .catch((err)=>reject(err));
        });
    },

    setProp (prop, val) {
        try {
            var payload  = JSON.stringify(val);
        }
        catch (err) {
            console.log(`Unable to stringify ${inspect(val)}`);
            throw err;
        }
        // push to localStorage?
        window.localStorage.setItem(prop,payload); // double up :)
        return new Promise((resolve,reject)=>{
            this.runFunction('set_user_prop',prop,payload)
                .then((result)=>{
                    console.log('Got result! %s',inspect(result));
                    resolve(result);
                })
                .catch((err)=>reject(err));
        });
    },

    pushArrayInPieces ( // FINISH ME -- GENERIC version of toGoogle from PortfolioBuilder.js
        initialFuncName,
        appendFuncName,
        arrayArg,
        arg2,arg3,arg4
    ) {
        return new Promise((resolve,reject)=>{
            // attempt the whole thing at once if we can :)
            var url = this.getUrl(initialFuncName,arrayArg,arg2,arg3,arg4);
            if (url.length < 2000) {
                return this.runFunction(initialFuncName,arrayArg,arg2,arg3,arg4)
                    .then(resolve)
                    .catch(reject);
            }
            else {
                console.log('Uh oh, URL would be %s characters long',url.length);
                const averageRowLength = JSON.stringify(arrayArg[0]).length
                // How many rows can we do at a time?
                var rowsAtATime = Math.floor(500 / averageRowLength);
                var idx = rowsAtATime;
                if (rowsAtATime==0) {
                    console.log('Uh oh: we think even one row might be too much?');
                    console.log('Attempting to run %s (%s)',initialFuncName,appendFuncName);
                    console.log('Trying this one row at a time');
                    rowsAtATime=1;
                }
                // FINISH...
                const maxRetries = 3;
                var retries = 0;

                Api.runFunction(initialFuncName,
                                arrayArg.slice(0,rowsAtATime),
                                arg2,
                                arg3,
                                arg4)
                    .then(keepAdding)
                    .catch((err)=>{
                        console.log('First addition failed with %s',initialFuncName)
                        console.log('Abandoning ship');
                        reject(err);
                        throw err;
                    });

                function keepAdding () {
                    if (idx < arrayArg.length) {
                        console.log('Pushing next chunk to %s',appendFuncName);
                        var nextArray = arrayArg.slice(idx,idx+rowsAtATime);
                        idx += rowsAtATime;
                        Api.runFunction(
                            appendFuncName,
                            nextArray,arg2,arg3,arg4)
                            .then(keepAdding)
                            .catch((err)=>{
                                console.log('Failed at idx %s',idx);
                                console.log('Retry?');
                                retries += 1;
                                idx -= rowsAtATime;
                                if (rowsAtATime > 2) {
                                    rowsAtATime = Math.floor(rowsAtATime/2); // try half as many rows
                                }
                                if (retries < maxRetries) {
                                    keepAdding();
                                }
                                else {
                                    console.log('Too many retries: giving up :(');
                                    reject(err)
                                    throw err;
                                }
                            });
                    }
                    else {
                        resolve();
                    }
                }
            
            
            }
        });
    },

    runFunction (funcName, arg, arg2, arg3, arg4) {
        const url = this.getUrl(funcName,arg, arg2, arg3, arg4);
        console.log('runFunction calling URL: %s (encoded: %s)',url,encodeURI(url));
        return new Promise((resolve,reject)=>{
            fetchJsonp(url)
                .then(function (response) {
                    return response.json()
                }).
                then((json)=>{
                    if (json.result===undefined) {
                        console.log(`runFunction ${funcName}(${arg}) returned empty result: ${json}`);
                    }
                    resolve(json.result);
                })
                .catch((err)=>{
                    console.log(`runFunction ${funcName}(${arg}) failed with ${err}`);
                    console.log(`URL was: ${encodeURI(url)} \nUnencoded ${url}`);
                    reject(err)
                })
        });
    },

    getSheet (id,tab) {
        return new Promise( (resolve,reject)=> {
            const url = this.getUrl('get_sheet',id,tab)
            fetchJsonp(url)
                .then((response)=>response.json())
                .then((json)=>{
                    console.log('Got data from %s:',id,json);
                    if (json.result) {
                        resolve(json.result)
                    }
                    else {
                        reject({
                            url : url,
                            response:json,
                            error:`Response has no result: ${JSON.stringify(json)}`
                        })
                    }
                })
                .catch((err)=>reject({err:err,url:url}));
        });
    },

    testLongGet () {
        
        const url = this.getUrl('test_fun',getLongParam());
        fetchJsonp(url)
            .then((response)=>console.log('got response!'))
            .catch((err)=>console.log('Error: %s',err))


        function getLongParam () { // somewhere between 5k and 6k we fail :(
            var param = 'long';
            while (param.length < 5000) {
                param = `${param}i`
            }
            console.log('Long param of length: %s',param.length);
            return param; // very long -- 2^256...
        }
        
    },


    testPost () { // fails
        console.log('Fetching %s',encodeURI(this.url));
        fetch(`${this.url}`,
              {
                  method : 'POST',
                  mode:'cors',
                  headers: {
                      //'Accept':'application/json',
                      'Content-Type':'text/plain',
                  },
                  credentials : 'omit',
                  redirect : 'follow',
                  body : JSON.stringify({
                      test:'me',
                      some:'data',
                  })
              })
            .then((r)=>console.log('Got result: ',r))
            .catch((e)=>console.log('Error? ',e,e));
    },


    get_teacher_classes : function (user) {
        return Api.runFunction('get_teacher_classes',user);
    },

    get_aspen_assignments_url : function (courseId) {
        return Api.runFunction('get_aspen_assignments_url',courseId);
    },

    get_portfolio_desc : function (courseId) {
        return Api.runFunction('get_portfolio_desc',courseId);
    },

    get_sheet_url : function (courseId) {
        return Api.runFunction('get_sheet_url',courseId);
    },

    set_aspen_assignments : function (aspenList, courseId) {
        return this.pushArrayInPieces(
            'set_aspen_assignments',
            'append_to_aspen_assignments',
            aspenList,courseId)
    },

    set_portfolio_desc (portfolioDesc, courseId) {
        var doneCount = 0;
        return new Promise((resolve,reject)=>{
            this.set_skills_list(portfolioDesc.skills,courseId).then(amIDone).catch(reject)
            this.set_portfolio_desc(portfolioDesc.descriptors,courseId).then(amIDone).catch(reject)

            function amIDone (arg) {
                doneCount += 1;
                if (doneCount==2) {
                    resolve(arg);
                }
                else {
                    console.log('Waiting on other process...');
                }
            }
        });
    },

    set_skills_list (skillsList, courseId) {
        return Api.pushArrayInPieces(
                'set_skills_list',
                'append_to_skills_list',
                skillsList,
                courseId)
    },

    set_descriptors (descriptors, courseId) {
        return Api.pushArrayInPieces(
            'set_descriptors',
            'append_to_descriptors',
            descriptors,
            courseId,
        );
    },
    
    
}


function GoogleSheet ({id, tabNames}) {
    return {
        id : id,
        tabNames : tabNames,
        lastModified : undefined,
        refreshFromGoogle () {
            
        },
        // loadFromLocal,
        // saveToLocal,
        // saveToGoogle,
    }
}

function GoogleProp (key) {
}

export default Api;
