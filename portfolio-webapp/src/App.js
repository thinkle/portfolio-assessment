import React,{useState,useEffect} from 'react';
import Brand from './brand.js';
import './App.sass';
import {Container,Navbar,Card,Progress,h,Loader,Buttons,Button} from './widgets.js';
import TestView from './Tests.js';
import TeacherView from './TeacherView.js';
import StudentView from './StudentView.js';
import Api from './gapi/gapi.js';
import Gapi from './gapi/gapiLoader.js';
import history from './history.js';
//import gapi from './gapi/__mocks__/gapi.js';

function MainView (props) {
    console.log('Rerender MainView',props)
    const userTypeProp = 'user-type='+props.user
    const [user,setUser] = useState('');
    const [userType,setUserType] = useState(props.userType||Api.getLocalCachedProp(userTypeProp));

    function doSetUserType (type) {
        setUserType(type);
        if (type=='teacher') {
            history.push('/teacher/');
        }
        else if (type=='student') {
            history.push('/student/');
        }
    }
    
    useEffect(
        ()=>{
            console.log('Get user...');
            Api.getUser().then(
                (result)=>{
                    console.log('Api.getUser ==> %s',result);
                    setUser(result);
                    console.log('Done setting user');
                })
        },[]);

    var settingFromGoogle = false;

    useEffect(()=>{
        console.log('grab setting');
        Api.getProp(userTypeProp).then((val)=>{
            console.log('fetched prop from google');
            setUserType(val)
        });
    },[]);

    function setAndSaveUserType (val) {
        Api.setProp(userTypeProp,val);
        setUserType(val);
    }

    return (
        
        <div className="fullHeight">
          <div className="modeBox">
                  {userType=='teacher' && 'Teacher Mode' || 
                   userType=='student' && 'Student Mode'}
                  {userType!=undefined &&
                   <a className="button delete is-small is-dark" onClick={()=>setUserType(undefined)}></a>
                  }
          </div>
          {!userType && (
              <Container>
                <Card>
                  <div>Are you a teacher or a student?</div>
                  <Buttons>
                    <Button onClick={()=>setAndSaveUserType('teacher')} className="button is-large">Teacher</Button>
                    <Button onClick={()=>setAndSaveUserType('student')} className="button is-large">Student</Button>
                  </Buttons>
                </Card>
              </Container>
          )}
          {!user && 'No user? Please log in ^^^'}
          {userType=='teacher' && user && <TeacherView user={user} {...props}/>}
          {userType=='student' && user && <StudentView user={user} {...props}/>}

        </div>
    );
}

function App(props) {
    //const [page,setPage] = useState('register')

    // useEffect( () => {
    //     if (props.mode=='test') {
    //         console.log('Test mode! Fake GAPI');
    //         console.log('Set up our mock!');
    //         window.gapi = gapi;
    //     }
    // });
    console.log('Rerender App',props)
    const [apiReady,setApiReady] = useState();
    const [loggedIn,setLoggedIn] = useState(false);
    
    function onApiLoaded () {
        setApiReady(true)
        Api.getUser().then(
            ()=>{
                setLoggedIn(true);
            }
        );
    }
    
    return (
        <React.Fragment>
        <div className="App viewport3 shrinky">
          {!loggedIn && <div>Placeholder</div>}
          <div>
            <Gapi onReady={onApiLoaded} onLoggedOut={()=>console.log('logged out?')}/>
          </div>
          {!apiReady && <Loader>One moment while we connect you with Google Apps...</Loader>}
          {apiReady && !loggedIn && 
           <Container>
             <Card>
               <div>
                 <p>Welcome to a tool for keeping a portfolio of your work.</p>
                 <p>This tool is still in beta, so I&rsquo;ll be improving it throughout the semester.</p>
                 <p>The first time you log in, you
                   will have to click through a somewhat scary warning from google which is telling
                   you you don&rsquo;t have to trust me. That's because they don't know I'm your teacher
                   and your tech director &mdash; they figure I'm just some random programmer who
                   might as well be out to hack you.</p>
                 <p>Don't worry, I'm not out to hack you. If I did, I'd be the one who had to fix
                   your stuff anyway. Also, I already have access to everyone&rsquo;s google
                   drive files anyway, so hacking you with this program would really be a stupid
                   use of my time :)</p>
               </div>
             </Card>
           </Container>}
          {props.mode=='test'&& apiReady && <TestView {...props}/>}
          {props.mode!='test'&& apiReady && <MainView  {...props}/>}
        </div>
    </React.Fragment>
    );
}

export default App;
