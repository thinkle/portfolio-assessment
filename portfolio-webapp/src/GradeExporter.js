import React,{useState,useEffect,useRef} from 'react';
import Exporters from './Exporters';
import {Modal,Icon,Buttons,Container,Card,h,Button,Progress} from './widgets.js';
import DocumentManager from './gapi/DocumentManager.js';
import Sheets from './gapi/SheetBasics.js';
import SheetManager from './gapi/SheetManager.js';
import StudentPicker from './StudentPicker.js';
import {arrayProp,classNames} from './utils.js';

function GradeExporter (props) {

    const [busy,setBusy] = useState();
    const [message,_setMessage] = useState();
    const [url,setUrl] = useState();

    const [selectedStudents,setSelectedStudents] = useState([]);
    const selectedStudentAP = arrayProp(selectedStudents,setSelectedStudents);
    const [showSelectStudents,setShowSelectStudents] = useState(false)

    function setMessage (message) {
        console.log('GradeExporter: '+message)
        _setMessage(message);
    }

    function exportSelected () {
        doExport(selectedStudents)
    }

    function exportAll () {
        doExport(props.students);
    }

    async function doExport (theStudents) {
        setBusy(true);
        setMessage('Starting export...');
        setMessage('Starting export... pushing each skill');
        var flatSkills = [];
        for (var skill of props.skills) {
            for (var ex of skill.exemplars) {
                flatSkills.push(ex)
            }
        }
        const aspen = Exporters.Aspen()
        aspen.skillsToAspenAssignments(flatSkills);

        var exports = []
        //var students = [...props.students]
        //if (testMode) {students = students.slice(0,3);}
        var portfoliosWeAreFetching = theStudents.slice();
        props.portfolioManager.getMany(
            theStudents,props.course,  // FIXME - cut down to avoid API overwhelming while we test
            (portfolio,student) => {
                setMessage(`EXP: Done fetching portfolio for ${student.profile.name.fullName}, got ${portfolio.length} assignments`);
                portfoliosWeAreFetching.splice(portfoliosWeAreFetching.indexOf(student),1); // remove
                var studentGrades = aspen.studentPortfolioToAspenGrades(student,portfolio)
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
    
    return (<Modal.ModalCard
              active={props.active}
              title={`Export for ${props.course.name}`}
              onClose={props.onClose}
            >
              <div>
                <div>Export grades for {props.students.length} students into a spreadsheet
                  for further tweaking and/or export into Aspen?
                </div>
                <div>
                  {busy && <Progress/>}
                </div>
                {message && <div>{message}</div>}
                {url && <a target="_BLANK" href={url}>Click here to see export</a>}
                <div className={classNames({
                    fadeIn : true,
                    active : showSelectStudents,
                })}
                >
                   <StudentPicker.Multi
                     students={props.students}
                     selected={selectedStudents}
                     onAdd={(student)=>{selectedStudentAP.push(student)}                       
                       /* onst newArray = selectedStudents.slice(); */
                     /*     newArray.push(student); */
                     /*     setSelectedStudents(newArray); */
                     /* } */}
                     onRemove={(student)=>selectedStudentAP.remove(student)}
                   />
                 </div>
              </div>
              <div>
                <Buttons>
                  <Button icon={Icon.close} onClick={props.onClose}>Close</Button>
                  <Button.Toggle
                    icon={Icon.student}
                    active={showSelectStudents}
                    onClick={()=>{setShowSelectStudents(!showSelectStudents)}}>
                    Select Students
                  </Button.Toggle>
                  {selectedStudents.length>0 &&
                   <Button icon={Icon.export} onClick={()=>{setShowSelectStudents(false);exportSelected()}}>
                     Export for {selectedStudents.length} selected
                     Students</Button>
                  }
            <Button icon={Icon.export} onClick={()=>{exportAll()}}>Export All Grades</Button>
              </Buttons>
            </div>
            </Modal.ModalCard>
            );
}

export default GradeExporter;
