import React,{useState} from 'react';
import './App.sass';
import TestView from './Tests.js';

function MainView () {
    const [userType,setUserType] = useState(undefined);
    return (
        <div className="section">
          <p>Are you a teacher or a student?</p>
          {!userType && (
              <div className="buttons">
                <button onClick={()=>setUserType('teacher')} className="button is-large">Teacher</button>
                <button onClick={()=>setUserType('student')} className="button is-large">Student</button>
              </div>
          )}
          {userType=='student' && 'Student View... coming soon'}
          {userType=='teacher' && 'Teacher View... coming soon'}
          {userType && <a className="button delete is-medium" onClick={()=>setUserType(undefined)}></a>}
        </div>
    );
}

function App() {
    const [page,setPage] = useState('main')
    return (
        <div className="App">
          <div className="navbar">
            <div className="container buttons">
              <button className="button" onClick={()=>setPage('test')}>Run Tests</button>
            </div>
          </div>
          <div className="section">
            {page=='test'&&<TestView/>}
            {page=='main' && <MainView/>}
          </div>
        </div>
    );
}

export default App;
