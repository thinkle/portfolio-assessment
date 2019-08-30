import React from 'react';
import logo from './logo.svg';
import './App.css';
import ClassList from './ClassList.js';

function App() {
    //var appLink = 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbwU-L5LTC68yB4IE0Dm0a6SzaZUi9l04w0DL-RN3n0OfN2iCZM/exec'
    var appLink = 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbw37U73iU1Ei_sOsX77GbyW7RvueieogCKHevPUVIQ/dev'
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a 
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React - Hello world :)
    </a>
        <p>Test API</p>
        <a target='blank' href={appLink+"?function=get_teacher_classes&arg=thinkle@innovationcharter.org&callback=?"}>Get teacher classes</a>
        <ClassList></ClassList>
      </header>
    </div>
  );
}

export default App;
