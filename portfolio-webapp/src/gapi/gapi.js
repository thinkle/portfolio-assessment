import { inspect } from 'util'; // or directly
import Prefs from './Prefs.js';

var gapi = window.gapi;
var auth2 = gapi.auth2;

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

var prefs;

var Api = {
    
    getPrefs () {
        if (!prefs) {
            prefs = Prefs();
        }
        return prefs
    },

    //converted
    getUser () {
        console.log('getUser...');
        return new Promise ((resolve,reject)=>{
            var authInst = auth2.getAuthInstance()
            if (authInst.isSignedIn.get()) {
                resolve(authInst.currentUser.get().getBasicProfile().getEmail());
            }
            else {
                reject('not signed in');
            }
        });
    },

    get_teacher_classes : function (user) {
        return new Promise((resolve,reject)=>{
            var cr = gapi.client.classroom;
            cr.courses.list({
                pageSize:25,
                courseStates:['ACTIVE'],
                teacherId:user,
            }).then((resp)=>{
                resolve(resp.result.courses);
            })
        });
    },


    // To do...

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

    getProp (prop) {
        return this.getPrefs().getProp(prop);
    },

    setProp (prop, val) {
        return this.getPrefs().setProp(prop,val);
    },

    getLocalCachedProp (prop) {
        return JSON.parse(window.localStorage.getItem(prop))
    },

    cacheResult (cacheName, result) {
        window.localStorage.setItem(cacheName,JSON.stringify(result))
    },

}


export default Api;
