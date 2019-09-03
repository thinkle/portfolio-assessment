import fetchJsonp from 'fetch-jsonp';
import { inspect } from 'util' // or directly

function sanitize (arg) {
    if (typeof arg == 'string') {return arg}
    if (typeof arg == 'object') {return JSON.stringify(arg)}
    if (arg===undefined) {
        return arg;
    }
    console.log('Unknown arg type: %s %s',arg,typeof arg)
    return arg;
}

var Api = {
    //url : 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbwU-L5LTC68yB4IE0Dm0a6SzaZUi9l04w0DL-RN3n0OfN2iCZM/exec',
    url : 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbw37U73iU1Ei_sOsX77GbyW7RvueieogCKHevPUVIQ/dev',

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

    getProp (prop) {
        return new Promise((resolve,reject)=>{
            this.runFunction('get_user_prop',prop)
                .then((result)=>resolve(JSON.parse(result)))
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
        return new Promise((resolve,reject)=>{
            this.runFunction('set_user_prop',prop,payload)
                .then((result)=>{
                    console.log('Got result! %s',inspect(result));
                    resolve(result);
                })
                .catch((err)=>reject(err));
        });
    },

    runFunction (funcName, arg, arg2, arg3, arg4) {
        const url = this.getUrl(funcName,arg, arg2, arg3, arg4);
        console.log('runFunction calling URL: %s',url);
        return new Promise((resolve,reject)=>{
            fetchJsonp(url)
                .then(function (response) {
                    return response.json()
                }).
                then((json)=>{
                    if (json.result) {
                        resolve(json.result);
                    }
                    else {
                        console.log(`runFunction ${funcName}(${arg}) returned unexpected result with no result: ${json}`);
                        console.log(`URL was: ${url}`);
                        reject(json)
                    }
                })
                .catch((err)=>{
                    console.log(`runFunction ${funcName}(${arg}) failed with ${err}`);
                    console.log(`URL was: ${url}`);
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
                    console.log('Got data from %s: %s',id,JSON.stringify(json));
                    if (json.result) {
                        resolve(json.result)
                    }
                    else {
                        reject({
                            url : url,
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
        console.log('Fetching %s',this.url);
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
            .then((r)=>console.log('Got result: %s',JSON.stringify(r)))
            .catch((e)=>console.log('Error? %s %s',e,JSON.stringify(e)))
    }
    
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
