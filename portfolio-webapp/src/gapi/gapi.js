import { inspect } from 'util'; // or directly
import Prefs from './Prefs.js';
import PortfolioDesc from './PortfolioDesc.js';
import Classroom from './classroom.js';
import StudentPortfolio from './StudentPortfolio.js';

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
            if (!auth2) {
                console.log('Tried to call Api before auth2');
                reject('Auth2 not loaded yet');
            }
            var authInst = auth2.getAuthInstance()
            if (authInst.isSignedIn.get()) {
                resolve(authInst.currentUser.get().getBasicProfile().getEmail());
            }
            else {
                reject('not signed in');
            }
        });
    },


    // To do...
    get_aspen_assignments_url : function (courseId) {
        return PortfolioDesc(courseId).get_aspen_assignments_url()
    },

    get_portfolio_desc : function (courseId) {
        return PortfolioDesc(courseId).get_portfolio_desc();
    },

    get_sheet_url : function (courseId) {
        return PortfolioDesc(courseId).get_portfolio_url()
    },

    set_aspen_assignments : function (aspenList, courseId) {
        return PortfolioDesc(courseId).set_aspen_assignments(aspenList);
    },

    set_portfolio_desc : function (portfolio, courseId) {
        return PortfolioDesc(courseId).set_portfolio_desc(portfolio)        
    },

    // set_skills_list (skillsList, courseId) {
    //     return Api.pushArrayInPieces(
    //             'set_skills_list',
    //             'append_to_skills_list',
    //             skillsList,
    //             courseId)
    // },

    // set_descriptors (descriptors, courseId) {
    //     return Api.pushArrayInPieces(
    //         'set_descriptors',
    //         'append_to_descriptors',
    //         descriptors,
    //         courseId,
    //     );
    // },

    getProp (prop) {
        return this.getPrefs().getProp(prop);
    },

    setProp (prop, val) {
        return this.getPrefs().setProp(prop,val);
    },

    getLocalCachedProp (prop) {
        try {
            return JSON.parse(window.localStorage.getItem(prop))
        }
        catch (err) {
            console.log('Bad prop stored in %s',prop);
            console.log('BAD VALUE WAS: %s',window.localStorage.getItem(prop));
            return undefined;
        }
    },

    cacheResult (cacheName, result) {
        window.localStorage.setItem(cacheName,JSON.stringify(result))
    },

    

}

Api.Classroom = Classroom
Api.StudentPortfolio = StudentPortfolio;

export default Api;
