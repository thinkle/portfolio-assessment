import React,{useState} from 'react';
import './App.sass';
import TestView from './Tests.js';
import TeacherView from './TeacherView.js';
import RegisterView from './Register.js';

function MainView () {
    
    const [userType,setUserType] = useState(undefined);
    return (
        
        <div className="section">
          <nav className="navbar">
            <div className="navbar-brand">
              <span className="navbar-item">Portfolio Tool &nbsp;
                {userType=='teacher' && 'Teacher Mode' || 'Student Mode'}
              </span>
            </div>
            {userType && <div className="navbar-item navbar-end"><a className="button delete is-medium is-danger" onClick={()=>setUserType(undefined)}></a></div>}
          </nav>
          {!userType && (
              <div className="card">
                <div className="card-header">Are you a teacher or a student?</div>
                <div className="card-body">
                  <div className="buttons">
                    <button onClick={()=>setUserType('teacher')} className="button is-large">Teacher</button>
                    <button onClick={()=>setUserType('student')} className="button is-large">Student</button>
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
    const [page,setPage] = useState('register')
    return (
        <div className="App">
          <div className="navbar">
            <div className="container buttons">
              <button className="button" onClick={()=>setPage('test')}>Run Tests</button>
            </div>
          </div>
          <div className="section">
            {page=='register' && <RegisterView onConnectedToApi={()=>setPage('main')}/>}
            {page=='test'&&<TestView/>}
            {page=='main' && <MainView/>}
          </div>
        </div>
    );
}

export default App;
