import React,{useState,useEffect,useRef} from 'react';
import Exporters from './Exporters';
import {Modal,Icon,Buttons,Container,Card,h,Button,Progress} from './widgets.js';
import DocumentManager from './gapi/DocumentManager.js';
import Sheets from './gapi/SheetBasics.js';
import SheetManager from './gapi/SheetManager.js';

function AssignmentExporter (props) {

    const [busy,setBusy] = useState();
    const [message,_setMessage] = useState();
    const [url,setUrl] = useState();

    function setMessage (message) {
        console.log('AssignmentExporter: '+message)
        _setMessage(message);
    }

    async function doExport () {
        setBusy(true);
        setMessage('Starting export...');
        setMessage('Starting export... pushing each skill');
        var flatSkills = [];
        for (var skill of props.skills) {
            for (var ex of skill.exemplars) {
                flatSkills.push(ex)
            }
        }
        Exporters.Aspen.skillsToAspenAssignments(flatSkills);

        var exports = []
        var students = [...props.students]
        //var students = students.slice(0,3);
        var portfoliosWeAreFetching = students.slice();
        props.portfolioManager.getMany(
            students,props.course,  // FIXME - cut down to avoid API overwhelming while we test
            (portfolio,student) => {
                setMessage(`EXP: Done fetching portfolio for ${student.profile.name.fullName}, got ${portfolio.length} assignments`);
                portfoliosWeAreFetching.splice(portfoliosWeAreFetching.indexOf(student),1); // remove
                var studentGrades = Exporters.Aspen.studentPortfolioToAspenGrades(student,portfolio)
                if (!studentGrades) {
                    console.log('WHAT???');
                }
                for (var i of studentGrades) {
                    exports.push(i);
                }
                if (portfoliosWeAreFetching.length==0) {
                    setMessage('Done fetching portfolios! Now let\'s send the data to a Google Sheet');
                    sendToSheets(exports).then(
                        (url)=>{
                            setMessage('Done!');
                            setUrl(url);
                        });
                    console.log('Got all kinds of exports! ',exports);
                }
                else {
                    console.log('So far we have',exports);
                }
            }
        );
    }

    async function sendToSheets (exports) {
        var ssData = [{rowData:Sheets.jsonToRowData(exports),
                 title:'Grades'}]
        var dm = DocumentManager();
        setMessage('Checking for existing spreadsheet');
        var existingId = await dm.getSheetId(props.course.id,'assessments-export');
        if (existingId) {
            setMessage('Updating existing spreadsheet');
            var result = await SheetManager(existingId).updateData(ssData);
        }
        else {
            setMessage('No sheet exists. Creating and organizing new spreadsheet...');
            var result = await dm.createSheetForProp(props.course,'assessments-export',
                                                     `${props.course.name} Grade Exports`,
                                                     ssData)
        }
        setMessage('Getting URL to share...');
        var url = await dm.getSheetUrl(props.course.id,'assessments-export')
        setBusy(false);
        return url;
    }
    
    return (<Modal.ModalCard active={props.active} title={`Export for ${props.course.name}`}
                             onClose={props.onClose}>
              
                         <div>
            <div>Export grades for {props.students.length} students into a spreadsheet
            for further tweaking and/or export into Aspen?</div>
                <div>{busy && <Progress/>}</div>
                {message && <div>{message}</div>}
                {url && <a target="_BLANK" href={url}>Click here to see export</a>}
              </div>
                         <div>
                           <Buttons>
                             <Button icon={Icon.close} onClick={props.onClose}>Close</Button>
                             <Button icon={Icon.export} onClick={()=>{doExport()}}>Export Grades</Button>
                           </Buttons>
                         </div>
            </Modal.ModalCard>
            );
}

export default AssignmentExporter;
