import React,{useEffect,useState} from 'react';
import Brand from '../brand.js';
import {Navbar,Button} from '../widgets.js';
// LOCAL MODE 
//import apiInfo from './secrets.js'; // comment out before committing
//const localMode = true; // comment out before committing
//// REMOTE MODE
var apiInfo // comment to work local
const localMode = false; // comment to work local



/* Note: to use this, you need to include the following <script> tag in your index.html

    <script src="https://apis.google.com/js/client.js"></script>

*/

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
        console.log('Got nested child... ',child);
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

console.log("APIs look like: %s",JSON.stringify(GOOGLESCOPES));

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
console.log('scopes are ',SCOPES);
function Gapi (props) {
    const [authorized,setAuthorized] = useState(false);
    const [signedIn,setSignedIn] = useState(false);

    var gapi = window.gapi;
    console.log('Got gapi? %s',gapi);
    
    const [courses,setCourses] = useState([]);
    function initClient () {
        console.log('initClient!');
        gapi.client.init({
            apiKey : apiInfo.API_KEY,
            clientId : apiInfo.CLIENT_ID,
            discoveryDocs : DISCOVERY_DOCS,
            scope : SCOPES.join(' '),
        })
            .then(()=>{
                console.log('client initialized!');
                gapi.auth2.getAuthInstance().isSignedIn.listen(
                    (isSignedIn)=>{
                        console.log('is signed in? %s',isSignedIn);
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
                console.log('initial sign-in state? %s',state);
                setAuthorized(state);
                if (state) {
                    props.onReady && props.onReady();
                }
            })
            .catch((err)=>{
                console.log('client init failed :(');
                console.log(err);
            });
    }

    function handleAuthClick (event) {
        console.log('authClick!');
        gapi.auth2.getAuthInstance().signIn();
    }

    function handleSignoutClick (event) {
        console.log('signOutclick!');
        gapi.auth2.getAuthInstance().signOut();
    }

    
    useEffect( ()=>{
        if (localMode) {handleClientLoad();}
        else {
            fetch('https://portfolio-assessment.netlify.com/.netlify/functions/apiInfo/')
                .then((resp)=>{
                    resp.json()
                        .then((data)=>{
                            console.log('Got our API Info!');
                            apiInfo = data;
                            console.log('handleClientLoad()!');
                            handleClientLoad();
                        });
                })
                .catch((err)=>console.log('oops?'));
        }
    },[]);


    function handleClientLoad () {
        console.log('load auth2!');
        gapi.load('client:auth2',initClient)
    }

    return (
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
                {authorized &&
                 <Button onClick={handleSignoutClick}>Sign Out</Button>
                 ||
                 <Button className='button' onClick={handleAuthClick}>Sign In</Button>
                }
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
