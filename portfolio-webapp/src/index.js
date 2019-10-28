import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import LinkReceiver from './LinkReceiver.js';
import {Route,BrowserRouter,Switch} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    (<BrowserRouter>
       <Switch>
         <Route exact path="/" render={()=><App/>}/>
         <Route exact path="/index.html" render={()=><App/>}/>
         <Route exact path="/teacher/" render={()=><App userType='teacher'/>}/>
         <Route exact path="/student/" render={()=><App userType='student'/>}/>
         <Route path="/share/:file/:redirect/" render={({match})=><LinkReceiver sharefile={match.params.file} redirect={match.params.redirect}/>}/>
         <Route path="/student/:courseId/:task/:param"
                render={({match})=><App
                                     userType='student'
                                     courseId={match.params.courseId}
                                     task={match.params.task}
                                     taskParam={match.params.param}/>}/>
         <Route path="/student/:courseId/:task" render={({match})=><App
                                                                     userType='student'
                                                                     courseId={match.params.courseId}
                                                                     task={match.params.task}/>}/>

         <Route path="/student/:courseId" render={({match})=><App 
                                                               userType='student'
                                                               courseId={match.params.courseId}/>}/>
         
         <Route path="/teacher/:courseId/assignment/:cwid/:sid/"
                render={({match})=><App courseId={match.params.courseId}
                                        userType='teacher'
                                        task='assignment'
                                        studentId={match.params.sid}
                                        courseworkId={match.params.cwid}/>}/>
         <Route path="/teacher/:courseId/assignment/:cwid/"
                render={({match})=><App
                                     userType='teacher'
                                     courseId={match.params.courseId}
                                     courseworkId={match.params.cwid}
                                     task='assignment'/>}
           
         />
         <Route path="/teacher/:courseId/:task/:param" render={({match})=><App userType='teacher' courseId={match.params.courseId} task={match.params.task} taskParam={match.params.param}/>}/>
         <Route path="/teacher/:courseId/:task/" render={({match})=><App userType='teacher' courseId={match.params.courseId} task={match.params.task}/>}/>
         <Route path="/teacher/:courseId" render={({match})=><App userType='teacher' courseId={match.params.courseId}/>}/>

         <Route exact path="/test/" render={()=><App mode='test'/>}/>
       </Switch>
     </BrowserRouter>),
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
