import React,{useState,useEffect} from 'react';
import './App.sass';
import TestView from './Tests.js';
import TeacherView from './TeacherView.js';
import RegisterView from './Register.js';
import Api from './api.js';

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
        
        <div className="container">
          <nav className="navbar">
            <div className="navbar-brand">
              <div className="navbar-item">Portfolio Tool</div>
            </div>
            <div className="navbar-item is-secondary">Logged in as {Api.user}</div>
            <div className="navbar-item navbar-end tag">
              {userType=='teacher' && 'Teacher Mode' || 
               userType=='student' && 'Student Mode'}
              {userType!=undefined &&
               <a className="button delete is-small is-dark" onClick={()=>setUserType(undefined)}></a>
              }
            </div>
          </nav>
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
    return (
        <div className="App">
          <div className="wrapper">
            {page=='register' && <RegisterView onConnectedToApi={()=>setPage('main')}/>}
            {page=='test'&&<TestView/>}
            {page=='main' && <MainView user={Api.user}/>}
          </div>
          <div className="footer">
            <div className="buttons">
              <button className="button" onClick={()=>setPage('test')}>Run Tests</button>
            </div>
          </div>
        </div>
    );
}

export default App;
