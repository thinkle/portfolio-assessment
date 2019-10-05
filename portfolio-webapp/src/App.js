import React,{useState,useEffect} from 'react';
import Brand from './brand.js';
import './App.sass';
import {Container,Navbar} from './widgets.js';
import TestView from './Tests.js';
import TeacherView from './TeacherView.js';
import Api from './gapi/gapi.js';
import Gapi from './gapi/gapiLoader.js';

function MainView (props) {
    const userTypeProp = 'user-type='+props.user
    const [userType,setUserType] = useState(Api.getLocalCachedProp(userTypeProp));
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
              <div className="card">
                <div className="card-header">Are you a teacher or a student?</div>
                <div className="card-body">
                  <div className="buttons">
                    <button onClick={()=>setAndSaveUserType('teacher')} className="button is-large">Teacher</button>
                    <button onClick={()=>setAndSaveUserType('student')} className="button is-large">Student</button>
                  </div>
                </div>
              </div>
          )}
          {userType=='student' && 'Student View... coming soon'}
          {userType=='teacher' && <TeacherView/>}

        </div>
    );
}

function App() {
    //const [page,setPage] = useState('register')
    const [page,setPage] = useState('test')
    const [user,setUser] = useState()

    function apiReady () {
        Api.getUser().then(
            (user)=>{
                setUser(user);
                setPage('main')
            }
        );
    }
    
    return (
        <div className="App viewport3">
          <div><Gapi onReady={apiReady} onLoggedOut={()=>console.log('logged out?')}/></div>
          {page=='login' && <h1>Log in, would you?</h1>}
          {page=='test'&&<TestView/>}
          {page=='main' && <MainView user={user}/>}
          <div className="bottom">
            <div className="buttons">
              <button className="button" onClick={()=>setPage('test')}>Run Tests</button>
              <button className="button" onClick={()=>setPage('main')}>Main View</button>
            </div>
          </div>
        </div>
    );
}

export default App;
