// Our system for caching settings etc.
import Api from './api.js';

// Meh -- this is not working so well and it seems like an extra layer of abstraction we may not need to add.
// I'm going to try to add localStorage support to the existing Api.js code and then cut this out.

function isObject (value) {
    /* https://webbjocke.com/javascript-check-data-types/ */
    return value && typeof value === 'object' && value.constructor === Object;
}

function loadSettingsFromRemote (settings) {
    var byName = {}
    settings.forEach(
        (s)=>byName[s.name]=s
    );
    Api.getProps(settings.map((s)=>s.name))
        .then(
            (results)=>{
                for (var key in results) {
                    if (byName[key]) {
                        byName[key].data = results[key]
                        byName[key].state.savedLocal = true;
                    }
                    else {
                        console.log(`Strange: we got a result for ${key} but we didn't ask for it`);
                    }
                }
            });
}

function Setting ({name, data={}}) {

    return {
        name : name,
        data : data,
        state : {
            savedLocal : false,
            savedRemote : false,
        },
        update : function (newData) {
            if (isObject(newData)) {
                this.data = {...this.data, ...newData}
            }
            else {
                this.data = newData;
            }
            this.state.savedLocal = false;
            this.state.savedRemote = false;
            this.saveLocal()
            return this.saveRemote()
        },
        saveRemote : function () {
            return new Promise((resolve,reject)=>{

            //var payload = JSON.stringify(this.data)
            this.state.savedRemote = false;
            Api.setProp(name,this.data)
                    .then((result)=>{
                        this.state.savedRemote = true;
                        resolve(this);
                    })
                    .catch((err)=>reject(err));
            });
        },
        saveLocal : function () {
            window.localStorage.setItem(name,JSON.stringify(this.data))
            this.state.savedLocal = true;
        },
        loadFromRemote : function () {
            return new Promise((resolve,reject)=>{
                Api.getProp(name)
                    .then((val)=>{
                        this.data=val;
                        this.state.savedRemote = true;
                        console.log('Loaded remote setting: %s',JSON.stringify(val));
                        resolve(this)
                    })
                    .catch((err)=>reject(err));
            });
        },
        loadFromLocal : function () {
            try {
                this.data = JSON.parse(window.localStorage.getItem(name))
                console.log('Loaded local setting: %s',JSON.stringify(this.data))                
            }
            catch (err) {
                console.log('Error parsing local data: %s',window.localStorage.getItem(name));
                console.log('Ignoring value: %s',window.localStorage.getItem(name));
                this.data = undefined;
            }

            this.savedLocal = true;
        },
        save : function () {
            this.saveLocal();
            return this.saveRemote();
        },
        maybeUpdate : function (data) {
            if (data != this.data) {
                console.log('push update')
                this.update(data);
            }
            console.log('no change, no update');
        },
        load : function (changedCallback) {
            this.loadFromLocal();
            changedCallback(this.data)
            return this.loadFromRemote().then(()=>changedCallback(this.data));
        }
    }
}

export default Setting;
