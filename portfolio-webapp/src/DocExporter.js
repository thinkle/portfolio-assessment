import React,{useState} from 'react';
import ReactDOMServer from 'react-dom/server';
import DocumentManager from './gapi/DocumentManager.js';
import DocWriter from './gapi/docWriter.js';
import {ProgressOverlay,Buttons,Button,Modal,Icon} from './widgets.js';

function DocExporter (props) {

    const [showRendered,setShowRendered] = useState(false)
    const [link,setLink] = useState()
    const [status,setStatus] = useState()

    async function doExport () {
        setStatus('Writing portfolio...')
        var body = ReactDOMServer.renderToString(
            <html>
              <head>
                <title>{props.docTitle}</title>
              </head>
              <body>                                                     
                {props.children}
              </body>
            </html>);
        
        setStatus('Looking to see if a document exists already...');
        var dm = DocumentManager();
        var existingId = await dm.getSheetId(props.course.id,
                                             props.docProp,
                                             props.student && props.student.userId);
        var result;
        if (existingId) {
            setStatus('Found document. Updating document with new portfolio.');
            try {
                result = await DocWriter.updateFile(existingId,
                                                    {description:props.docDescription,
                                                     body:body}
                                                   )
            }
            catch (err) {
                console.log('ERROR: ',err);
                setStatus('Error!');
                window.setTimeout(()=>setStatus(),1000)
                return;
            }
        }
        else {
            setStatus('Exporting portfolio to docs...')
            try {
                result = await  DocWriter.createFile(
                    {title:props.docTitle,
                     description:'A sample portfolio',
                     body:body}
                );
                setStatus('Saving file info for future reference...')
                await dm.addMetadataToFile(
                    result.id,
                    props.course,
                    props.docProp,
                    props.student
                );
            }
            catch (err) {
                console.log('ERROR: ',err);
                setStatus('Error!');
                window.setTimeout(()=>setStatus(),1000)
                return;
            }
        }
        setStatus()        
        setLink(result.url)
    }
    
    
    return <ProgressOverlay active={status}>
               <Buttons>
                 <Button className="is-secondary is-light" onClick={()=>setShowRendered(!showRendered)}>Preview</Button>
                 <Button className="is-info is-light" onClick={doExport}>{props.buttonText||"Export to Doc"}</Button>
                 {link && <Button href={link} target="_BLANK" icon={Icon.external}>See Export</Button>}
                 <Modal className='full' active={showRendered} onClose={()=>setShowRendered(false)}>
                   <div style={{margin:'auto',
                                width:'468pt'}}>
                     {props.children}
                   </div>
                 </Modal>
               </Buttons>
               <p>{status}</p>
             </ProgressOverlay>

}
export default DocExporter;
