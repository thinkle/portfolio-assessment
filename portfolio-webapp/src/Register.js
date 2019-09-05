import React,{useState,useEffect} from 'react';
import Api from './api.js';
const APPNAME = 'Portfolio Assessment Tool';

function RegisterView (props) {

    const[havePermissions,setHavePermissions] = useState(-1);
    const[user,setUser] = useState('???');

    var timeout = 500;
    const maxTimeout = 15000
    
    function checkPermissions (recurse) {
        console.log('Checking if we have permissions...');
        Api.havePermissions()
            .then((connectedToApi)=>{
                setHavePermissions(connectedToApi)
                if (connectedToApi) {
                    props.onConnectedToApi && props.onConnectedToApi()
                    Api.getUser().then(setUser);
                }
                else if (recurse) {
                    window.setTimeout(checkPermissions,timeout)
                    if (timeout < maxTimeout) {
                        timeout *= 1.75
                    }
                    else {
                        timeout = maxTimeout;
                    }
                }
            });
    }


    useEffect(()=>{

        checkPermissions(true);

    },[]);

    return (
        <div className="card">
          <div className="card-header">Connecting to google...</div>
          <div className="card-content">
        {havePermissions==-1 &&
         <React.Fragment>
           <progress className="progress" max="100"/>
           <p>Checking if you have set up access to your google account...</p>
         </React.Fragment>
         ||
         havePermissions==true &&
         <div>Congrats {user}! You've connected to google!</div>
         ||
         <div>Oops. It looks like you haven't set up a connection to google yet.
           Please <a href={Api.getRegisterUrl()} target="_blank">click here to open a new window</a>
           to authorize {APPNAME} to connect to your google account. We will need permission to access your
           google classroom to connect to your classes and assignments and
           access to google sheets and google drive to organize the data
           we collect for assessment purposes.
           <br/>
           <button className="button important" onClick={checkPermissions}>Check Again</button>
         </div>
        }
          </div>
          
        </div>
    )
    
    
}

export default RegisterView;
