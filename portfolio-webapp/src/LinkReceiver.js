import Brand from './brand.js';
import React,{useState,useEffect} from 'react';
import {Container,Card,Progress,h,Button} from './widgets.js';
import {Redirect} from 'react-router';
import Prefs from './gapi/Prefs.js';
import {inspect} from 'util';
import Gapi from './gapi/gapiLoader.js';
import Api from './gapi/gapi.js';

function LinkReceiver (props) {
    
    const [doneParsing,setDoneParsing] = useState();
    const [data,setData] = useState();
    const [message,setMessage] = useState('Congrats! You received a link. Let me just grab that configuration file...');
    const [error,setError] = useState();
    const [loggedIn,setLoggedIn] = useState();
    const [doRedirect,setDoRedirect] = useState();
    useEffect(
        ()=>{
            
            async function getPrefs() {
                var prefReader = Prefs('shared-file',false);
                prefReader.setId(props.sharefile);
                setMessage(`Fetching file with ID ${props.sharefile}`);
                try {
                    var results = await prefReader.getProps()
                    if (results.error) {
                        console.log('Looks like an error: ',results);
                        throw results.error;
                    }
                }
                catch (err) {
                    setMessage('Darn! Ran into error reading file. Please contact whoever sent you the file and have them try again.');
                    setError(err);
                    return;
                }
                setMessage('Got results! Now we have to apply some settings...');
                setData(results);
                await Api.setProps(results);
                setMessage('Done setting properties!')
                setMessage('Ok -- now off you go!');
                setDoneParsing(true)
            }

            if (loggedIn) {
                getPrefs()
            }
            else {
                setMessage(message+'... we need you to log in before we can get the portfolio data that is shared with you!');
            }
        },[props.sharefile,loggedIn]
    );
    
    function onApiLoaded () {
        Api.getUser().then(
            ()=>{setLoggedIn(true)}
        );
    }

    return <div>Are we there yet... {doneParsing&&"Yessir"||"Nosir"}
             {props.sharefile && !doRedirect && 
              <div key={JSON.stringify(doRedirect)+JSON.stringify(doneParsing)}>
                   <Container>
                     <div className="spacer" style={{height:'5em'}}/>
                     <Card>
                       <h.h3>{Brand.name}: Opening Link</h.h3>
                       <div>
                         <div><Gapi onReady={onApiLoaded} onLoggedOut={()=>console.log('logged out?')}/></div>
                         <p>{message}</p>
                         {error && <div>
                                     Error below:
                                     <br/>
                                     <br/><pre>{inspect(error)}</pre>
                                   </div>}
                         {!doneParsing && <Progress/>}
                         {doneParsing && <Button onClick={()=>setDoRedirect(true)}>Ok, take me to my portfolio!</Button>}
                         {data && <div>
                                    {doneParsing && 'Applied settings:' || 'Applying settings...'}
                                           <div><pre>{inspect(data)}</pre></div>
                              </div>}
                       </div>
                     </Card>
                   </Container>
                   
              </div> || <Redirect to={props.redirect&&'/'+props.redirect.replace('%2F','/')||'/'}/>
                }
           </div>
        
}

export default LinkReceiver;
