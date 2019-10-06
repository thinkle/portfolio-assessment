import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {Route,BrowserRouter,Switch} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    (<BrowserRouter>
       <Switch>
         <Route exact path="/" render={()=><App/>}/>
         <Route exact path="/teacher/" render={()=><App/>}/>
         <Route path="/teacher/:courseId/assignment/:cwid/:sid/"
                render={({match})=><App courseId={match.params.courseId}
                                        task={match.params.task}
                                        studentId={match.params.sid}
                                        courseworkId={match.params.cwid}/>}/>
         <Route path="/teacher/:courseId/assignment/:cwid/"
                render={({match})=><App
                                     courseId={match.params.courseId}
                                     courseworkId={match.params.cwid}
                                     task={match.params.task}/>}
           
         />
         <Route path="/teacher/:courseId/:task/" render={({match})=><App courseId={match.params.courseId} task={match.params.task}/>}/>
         <Route path="/teacher/:courseId" render={({match})=><App courseId={match.params.courseId}/>}/>
         <Route exact path="/test/" render={()=><App mode='test'/>}/>
       </Switch>
     </BrowserRouter>),
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
