var gapi;

const PREF_FILENAME = 'portconf.json'

function getApi () {
    gapi = window.gapi;
}

function Prefs () {
    getApi();

    function drive () {
        return gapi.client.drive;
    } 

    function getAccessToken () {
        return gapi.auth.getToken().access_token;
    }
    var propFileId;

    return {
        createPropFile : function () {
            console.log('Create prop file...');
            return new Promise ((resolve,reject)=>{
                // ht: https://gist.github.com/tanaikech/bd53b366aedef70e35a35f449c51eced
                var metadata = {
                        name : PREF_FILENAME,
                    //parents : ['appDataFolder'],
                }
                var file = new Blob([JSON.stringify( {
                    hello : 'world'
                })],{type:'application/json'})
                
                var form = new FormData();
                form.append('metadata',new Blob([JSON.stringify(metadata)],{type:'application/json'}))
                form.append('file',file);
                fetch(
                    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{
                        method : 'POST',
                        headers : new Headers({'Authorization':'Bearer '+getAccessToken()}),
                        body : form
                    })
                    .then(
                        (resp)=>resp.json()
                    )
                    .then(
                        (val)=>{
                            propFileId = val;
                            resolve(val);
                        }
                    );
            }); // end promise
        },
        updateFile : function (id, data) {
            return new Promise((resolve,reject)=>{
                var file = JSON.stringify(data)
                var form = new FormData();
                form.append('file',file);
                fetch(
                    `https://www.googleapis.com/upload/drive/v2/files/${id}/?uploadType=media`,{
                        method : 'PUT',
                        headers : new Headers({'Authorization':'Bearer '+getAccessToken()}),
                        body : file
                    })
                    .then(
                        (resp)=>resp.json()
                    )
                    .then(
                        (val)=>{
                            console.log('PUT worked ',val)
                            console.log('Pushed data: %s',file);
                            resolve(val);
                        }
                    )
                    .catch(reject);
            });
        },
        getFile : function (id) {
            console.log('Get file: %s',id);
            return new Promise((resolve,reject)=>{
                fetch(
                    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
                    {
                        method : 'GET',
                        headers : new Headers({'Authorization':'Bearer '+getAccessToken()}),
                    }).then(
                        (resp)=>{
                            resp.json().then(
                                (jsonData)=>{
                                    console.log('getFile %s got JSON response!',
                                                id,
                                                resp,jsonData);
                                    resolve(jsonData);
                                }
                            )
                                .catch((err)=>reject(err))
                        }
                    )
                    .catch((err)=>{
                        console.log('file %s Error with data? %s',id,err);
                        reject(err);
                    });
            }); // end promise
        },
        getPropFile : function () {
            console.log('get props file...')
            return new Promise((resolve,reject)=>{
                if (propFileId) {
                    resolve(propFileId);
                }
                drive().files.list(
                    {
                        //spaces : 'appDataFolder',
                        spaces : 'drive',
                        q : `name='${PREF_FILENAME}'`
                    })
                    .then(
                        (resp)=>{
                            var searchResult = resp.result
                            if (searchResult.files && searchResult.files.length >= 1) {
                                if (searchResult.files.length > 1) {
                                    console.log('WARNING: There seem to be extra config files. We will use the first one.');
                                }
                                propFileId = searchResult.files[0].id;
                                resolve(propFileId);
                            }
                            else {
                                console.log('Creating prop file from scratch, none found');
                                this.createPropFile()
                                    .then(resolve)
                                    .catch(reject);
                            }
                        }
                    )
                    .catch(reject);
            });    
        },
        getProps : function () {
            return new Promise((resolve,reject)=>{
                this.getPropFile().then(
                    (id)=>{
                        this.getFile(propFileId)
                            .then((result)=>{
                                resolve(result)
                            })
                            .catch(reject);
                    });
            });
        },
        getProp : function (key) {
            
            return new Promise ((resolve,reject)=>{
                this.getProps()
                    .then(
                        (props)=>{
                            resolve(props[key])
                        }
                    )
                    .catch(reject)
            });
        },
        setProp : function (key, val) {
            console.log('setProp',key,val);
            return new Promise((resolve,reject)=>{
                this.getProps().then(
                    (allProps)=>{
                        allProps[key] = val;
                        this.getPropFile().then(
                            (id)=>{
                                this.updateFile(id,allProps)
                                    .then(resolve)
                                    .catch(reject);
                            }
                        );
                    }
                );
            });
        },
    }
}

export default Prefs;
