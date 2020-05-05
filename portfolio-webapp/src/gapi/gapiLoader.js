import React,{useEffect,useState} from 'react';
import Brand from '../brand.js';
import {Navbar,Button,Loader,Error} from '../widgets.js';

import Spy from './spy.js';

// LOCAL MODE 
//import apiInfo from './secrets.js'; // comment out before committing
//const localMode = true; // comment out before committing
//// REMOTE MODE
var apiInfo // comment to work local
const localMode = false; // comment to work local


const GOOGLESCOPES = {
}

function addScope (parent, child, suffixes=['readonly']) {
    const baseObj = {}
    if (child) {
        baseObj.all = `https://www.googleapis.com/auth/${parent}.${child}`
    }
    else {
        baseObj.all = `https://www.googleapis.com/auth/${parent}`
    }
    suffixes.forEach(
        (suffix)=>{
            baseObj[suffix] = baseObj.all+`.${suffix}`;
        }
    );
    if (!child) {
        if (!GOOGLESCOPES[parent]) {
            GOOGLESCOPES[parent] = baseObj;
            return;
        }
        else {
            GOOGLESCOPES[parent] = {...GOOGLESCOPES[parent], ...baseObj}
            return;
        }
    }
    // Assume child...
    if (!GOOGLESCOPES[parent]) {
        GOOGLESCOPES[parent] = {}        
    }

    if (child.indexOf('.')!=-1) {
        var layers = child.split('.')
        var myparent = GOOGLESCOPES[parent];
        
        layers.slice(0,-1).forEach(
            (child)=>{
                if (!myparent[child]) {
                    myparent[child] = {}
                }
                myparent = myparent[child]
            }
        );
        myparent[layers[layers.length-1]] = baseObj;
    }
    else {
        GOOGLESCOPES[parent][child] = baseObj;
    }
}

// classroom scopes...
['courses','rosters','coursework.students','coursework.me','guardianlinks.students','announcements'].forEach(
    (scope)=>addScope('classroom',scope)
);
['appfolder','file','install','scripts'].forEach(
    (scope)=>addScope('drive',scope,[])
);
['apps','metadata','activity'].forEach(
    (scope)=>addScope('drive',scope) // includes readonly
);
addScope('drive',null,['readonly']); // top-level permissions
addScope('drive','appdata',[]); // top-level permissions
addScope('spreadsheets',null,['readonly']); // top-level sheets permissions


const SCOPES = [GOOGLESCOPES.classroom.courses.readonly];
SCOPES.push(GOOGLESCOPES.classroom.coursework.students.readonly);
SCOPES.push(GOOGLESCOPES.classroom.coursework.me.all);
SCOPES.push(GOOGLESCOPES.classroom.rosters.readonly);
SCOPES.push(GOOGLESCOPES.drive.file.all);
SCOPES.push(GOOGLESCOPES.spreadsheets.all);
SCOPES.push(GOOGLESCOPES.drive.appdata.all)
SCOPES.push(GOOGLESCOPES.drive.readonly);
SCOPES.push('https://www.googleapis.com/auth/classroom.profile.emails'); // get emails with profiles!

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/classroom/v1/rest",
                        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                        "https://sheets.googleapis.com/$discovery/rest?version=v4"
                       ]

const awaitGapi = (spy)=> new Promise((resolve,reject)=>{

    const maxAttempts = 10;
    const attempts = []
    
    function checkForGapi () {
        attempts.push(new Date())
        if (window.gapi) {
            if (spy) {
                window.origGapi = window.gapi;
                window.gapi = Spy(window.gapi,'gapi');
            }
            resolve(window.gapi);
        }
        else {
            if (attempts.length > maxAttempts) {
                reject({
                    message:'Waited too long...',
                    attempts}
                      )
            }
            else {
                setTimeout(checkForGapi,1000)
            }
        }
    }

    checkForGapi()
});

function Gapi (props) {
    const [authorized,setAuthorized] = useState(false);
    const [signedIn,setSignedIn] = useState(false);
    const [gapi,setGapi] = useState(window.gapi);
    const [gapiLoaded,setGapiLoaded] = useState();
    const [insertedGapiScript,setInsertedGapiScript] = useState(false);
    const [courses,setCourses] = useState([]);
    const [errorInfo,setErrorInfo] = useState();

    function initClient () {
        if (gapi) {
            gapi.client.init({
            apiKey : apiInfo.API_KEY,
            clientId : apiInfo.CLIENT_ID,
            discoveryDocs : DISCOVERY_DOCS,
            scope : SCOPES.join(' '),
        })
            .then(()=>{
                if (props.onApiLoaded) {
                    props.onApiLoaded(true);
                }
                if (!gapi.auth2.getAuthInstance()) {
                    setErrorInfo({
                        name:'Auth Instance not loaded',
                        error:'Unable to load auth instance. Perhaps you have not properly set up API keys etc.'});
                    return;
                }
                setGapiLoaded(true);
                gapi.auth2.getAuthInstance().isSignedIn.listen(
                    (isSignedIn)=>{
                        setAuthorized(isSignedIn)
                        if (isSignedIn) {
                            props.onReady && props.onReady();
                        }
                        else {
                            props.onLoggedOut && props.onLoggedOut();
                        }
                    }
                )
                var state = gapi.auth2.getAuthInstance().isSignedIn.get();
                setAuthorized(state);
                if (state) {
                    props.onReady && props.onReady();
                }
            })
            .catch((err)=>{
                console.log(err);
            });
        }
        else {
            console.log('No gapi :(');
        }
    }

    function handleAuthClick (event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    function handleSignoutClick (event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    
    useEffect( ()=>{
        if (!gapi && !window.gapi && !insertedGapiScript) {
            const script = document.createElement('script');
            script.src = ''
            script.setAttribute('src','https://apis.google.com/js/client.js');
            script.setAttribute('crossorigin','');
            script.async = true;
            document.body.appendChild(script);
            setInsertedGapiScript(true);
            awaitGapi(props.spy).then((mygapi)=>{
                setGapi(mygapi)
            })
            return;
        }
        if (window.gapi && !gapi) {
            setGapi(window.gapi);
        }
        
        if (localMode) {handleClientLoad();}
        else {
            fetch('https://portfolio-assessment.netlify.app/.netlify/functions/apiInfo/')
                .then((resp)=>{
                    resp.json()
                        .then((data)=>{
                            apiInfo = data;
                            handleClientLoad();
                        });
                })
                .catch((err)=>setErrorInfo({
                    name : 'Error loading API keys',
                    error:err
                }))
        }
    },[gapi]);


    function handleClientLoad () {
        gapi && gapi.load('client:auth2',initClient,setErrorInfo)
    }

    return (
        errorInfo && <Error {...errorInfo}/>
        ||
            <Navbar>
            <Navbar.Start>
              <Navbar.Item>
                {apiInfo=={} && 'No API info yet'
                 || <span>
                      Signed {authorized && 'in' || 'out'}
                    </span>
                }
              </Navbar.Item>
              
              <Navbar.Item>
                {!gapiLoaded && <Loader>Loading google API...</Loader> ||
                 (authorized &&
                 <Button onClick={handleSignoutClick}>Sign Out</Button>
                 ||
                 <Button className='button' onClick={handleAuthClick}>Sign In</Button>
                 )}
              </Navbar.Item>
            </Navbar.Start>
              <Navbar.End>
                <Navbar.QuickBrand>{Brand.shortname} Google Classroom Sign-In</Navbar.QuickBrand>
              </Navbar.End>
              {/* <Navbar.End> */}
              {/*   <Navbar.Item> */}
              {/*     <Button onClick={initClient}>Init Client again?</Button> */}
              {/*   </Navbar.Item> */}
              {/* </Navbar.End> */}
            </Navbar>
    )

}

export default Gapi;
