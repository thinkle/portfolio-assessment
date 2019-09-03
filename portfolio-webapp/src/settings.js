// Our system for caching settings etc.
import Api from './api.js';

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
            this.data = {...this.data, ...newData}
            this.state.savedLocal = false;
            this.state.savedRemote = false;
            this.saveLocal()
            return this.saveRemote()
        },
        saveRemote : function () {
            return new Promise((resolve,reject)=>{

            var payload = JSON.stringify(this.data)
            this.state.savedRemote = false;
            Api.setProp(name,payload)
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
                        this.data=JSON.parse(val);
                        this.state.savedRemote = true;
                        console.log('Done with promise...');
                        resolve(this)
                    })
                    .catch((err)=>reject(err));
            });
        },
        loadFromLocal : function () {
            this.data = JSON.parse(window.localStorage.getItem(name))
        },
        save : function () {
            this.saveLocal();
            return this.saveRemote();
        },
        load : function () {
            this.loadFromLocal();
            return this.loadFromRemote();
        }
    
    }
}

export default Setting;
