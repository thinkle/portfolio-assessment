import React,{useState,useEffect} from 'react';
import {Progress,Container,Button,Icon,Panel,Card,h} from './widgets.js';
import Prefs from './gapi/Prefs.js';
import DocumentManager from './gapi/DocumentManager.js';
import SheetManager from './gapi/SheetManager.js';
import Api from './gapi/gapi.js';

// A simple UI for changing settings that probably shouldn't be changed but might just need to be...
function SettingsUI (props) {
    
    const prefs = Prefs();
    const [prefProps,setPrefProps] = useState([])
    const [update,setUpdater] = useState(0)

    function forceUpdate () {
        setUpdater(update+1);
    }
    
    useEffect( ()=>{
        console.log('Get updated prefs...');
        async function getPrefs () {
            setPrefProps(await prefs.getProps());
        }
        getPrefs();
    }
    ,[update])

    return (
        <Container>
    <Card>
      <h.h2>Settings</h.h2>
      <Panel>
        {Object.keys(prefProps).map(
            (prefKey)=>
                <Pref key={`${prefKey}-${prefProps[prefKey]}`} onUpdate={forceUpdate}  keyname={prefKey} value={prefProps[prefKey]}/>
        )}
      </Panel>
    </Card></Container>
    )
}

function Pref (props) {

    let input = React.createRef();

    const [modified,setModified] = useState(false);
    const [updating,setUpdating] = useState(false);
    const [showDoubleClickMessage,setShowDoubleClickMessage] = useState(false);

    function turnOnShowDoubleClickMessage () {setShowDoubleClickMessage(true)}
    function turnOffShowDoubleClickMessage () {setShowDoubleClickMessage(false)}
    
    function makeLabel (key, val) {
        var url = ''
        if (key.toLowerCase().indexOf('url') >-1) {
            url = val;
        }
        if (key.toLowerCase().indexOf('id') > -1
            || key.toLowerCase().indexOf('portfolio') > -1
            || key.toLowerCase().indexOf('export') > -1
            || key.toLowerCase().indexOf('rubric') > -1) {
            if (key.toLowerCase().indexOf('folder') > -1) {
                url = 'https://drive.google.com/drive/folders/'+val;
            }
            else {
                url = 'https://drive.google.com/file/d/'+val;
            }
        }
        
        if (url) {
            return <a href={url} target='_blank'>{key}</a>
        }
        else {
            return key;
        }
    }

    function reset () {
        input.current.value = props.value
        setModified(false)
    }

    function deletePref () {
        console.log('Delete',props.keyname);
        setUpdating(true);
        setShowDoubleClickMessage(false)
        Api.getPrefs().deleteProps([props.keyname]).then(
            ()=>{
                props.onUpdate()
            }
        );
    }

    function updatePref () {
        console.log(input);
        const val = input.current.value;
        console.log('Set %s: ',props.keyname,val);
        setUpdating(true)
        Api.setProp(props.keyname,val).then(
            (result)=>{
                console.log('Got: ',result);
                props.onUpdate()
            }
        );
                
    }

    function checkChange () {
        if (input.current.value != props.value && !modified) {
            setModified(true)
        }
    }

    return <div className='pref field'>
             <label className='label'>
               {makeLabel(props.keyname,props.value)}
             </label>
             {!updating &&
              <div className='field has-addons'>
                <div className='control has-addons'>
                  <input onChange={checkChange} ref={input} className='input' type='text' defaultValue={props.value}/>
                </div>
                <div className='control'>
                  <Button onClick={turnOnShowDoubleClickMessage} onDoubleClick={deletePref} icon={Icon.trash}/>
                  {showDoubleClickMessage &&
                   <p className='popover'>Do you really want to delete? Double click the delete button
                   <Button className='close' icon={Icon.close} onClick={turnOffShowDoubleClickMessage}/>
                   </p>}
             </div>
               {modified &&
                <>
                  <div className='control'>
                    <Button onClick={reset} icon={Icon.undo}/>
                  </div>
                  <div className='control'>
                    <Button onClick={updatePref} icon={Icon.check}/>
                  </div>
                </>
               }
              </div>}
             {updating && <Progress>Setting Value...</Progress>}
           </div>
}

export default SettingsUI;
