var gapi;

const PREF_FILENAME = 'portconf.json'

function getApi () {
    gapi = window.gapi;
}

function Prefs (pref_file=PREF_FILENAME, main=true) {
    getApi();


    function drive () {
        return gapi.client.drive;
    } 

    function getAccessToken () {
        return gapi.auth.getToken().access_token;
    }
    var propFileId;
    var propContents;

    return {
        getId : function () {
            return propFileId;
        },
        setId : function (id) {
            propFileId = id;
        },
        createPropFile : function (initialData) {
            console.log('Create prop file...');
            return new Promise ((resolve,reject)=>{
                // ht: https://gist.github.com/tanaikech/bd53b366aedef70e35a35f449c51eced
                var metadata = {
                    name : pref_file,
                    appProperties : {
                        role : main && 'propertiesFile' || 'sharedPropertyFile',
                    }
                }
                var file = new Blob([JSON.stringify( initialData || {} )]);
                
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
            propContents = data;
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
        getFile : async function (id) {
            if (propContents) {
                return propContents;
            }
            console.log('Get file: %s',id);
            var resp = await fetch(
                    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
                    {
                        method : 'GET',
                        headers : new Headers({'Authorization':'Bearer '+getAccessToken()}),
                    });
            var jsonData = await resp.json();
            console.log('getFile %s got JSON response!',
                        id,
                        resp,jsonData);
            propContents = jsonData;
            return jsonData;
        },
        getPropFile : function () {
            return new Promise((resolve,reject)=>{
                if (propFileId) {
                    resolve(propFileId);
                }
                drive().files.list(
                    {
                        spaces : 'drive',
                        q : `appProperties has {key="role" and value="propertiesFile"}`
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
            return this.setProps({key:val},{updateMode:false});
        },

        setProps : function (newProps) {
            console.log('setProps',newProps);
            return new Promise((resolve,reject)=>{
                this.getProps().then(
                    (allProps)=>{
                        var dataToPush = {...allProps, ...newProps}
                        this.getPropFile().then(
                            (id)=>{
                                this.updateFile(id,dataToPush)
                                    .then(resolve)
                                    .catch(reject);
                            }
                        );
                    }
                );
            });
        },
        shareProps : async function  (propList, newProps, filename='share.json') {
            var props = await this.getProps();
            var propsToShare = {}
            for (var prop of propList) {
                propsToShare[prop] = props[prop]
            }
            if (newProps) {
                propsToShare = {...propsToShare,...newProps}
            }
            var sharedPrefs = Prefs(filename,main=false)
            var result = await sharedPrefs.createPropFile(propsToShare);
            //await sharedPrefs.updateFile(propId,propsToShare);
            this.setProp(`shared-file-${filename}`,result.id)
            return result.id;
        }
    }
}

export default Prefs;
