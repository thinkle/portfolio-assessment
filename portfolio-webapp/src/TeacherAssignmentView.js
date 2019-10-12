import React,{useState,useEffect,useRef} from 'react';
import {useStudents,useStudentWork,useCoursework,useStudentPortfolioManager} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';
import {getProp,classNames,getById} from './utils.js';
import {Viewport,Card,Container,Navbar,Button,Icon,Modal,Loader,h} from './widgets.js';
import {SelectableItem,Menu,Dropdown} from './widgets/Menu.js';
import ExemplarEditor from './ExemplarEditor.js';
import history from './history.js';
import {inspect} from 'util';
import StudentPicker from './StudentPicker.js';

function TeacherAssignmentView (props) {

    const students = props.students
    const skillHookProps = props.skillHookProps
    const allStudentWork = props.allStudentWork
    const coursework = props.coursework
    const portfolioManager = props.portfolioManager
    
    const [currentPortfolio,setCurrentPortfolio] = useState([]);
    const [selectedStudent,setSelectedStudent] = useState();
    const [selectedCoursework,setSelectedCoursework] = useState();
    const [exemplarEditorProps,setEEProps] = useState({});
    const [exemplarRenderCount,setERC] = useState(1);
    const [initialStateReady,setInitialStateReady] = useState(false);
    // const [showExporter,setShowExporter] = useState(false);
    // const [showCreator,setShowCreator] = useState(false);
    
    useEffect( ()=>{
        // Manage props from URL...
        if (!initialStateReady) {
            if (coursework && coursework.length && students && students.length) {
                console.log('Ready to set coursework and student!')
                if (props.studentId) {
                    setSelectedStudent(getById(students,props.studentId,'userId'));
                }
                if (props.courseworkId) {
                    doChangeCoursework(getById(coursework,props.courseworkId));
                }
                setInitialStateReady(true);
            }
        }
        
    },[coursework, students]);

    useEffect( ()=>{
        if (selectedStudent) {
            console.log('tav: update currentPortfolio');
            portfolioManager.getPortfolio(selectedStudent,props.course,setCurrentPortfolio)
        }
    },[selectedStudent]
             );

    function updateUrl ({student,coursework}) {
        if ((student||selectedStudent) && (coursework||selectedCoursework)) {
            history.push(`/teacher/${props.course.id}/assignment/${coursework&&coursework.id||selectedCoursework.id}/${student&&student.userId||selectedStudent.userId}/`);
        }
        else if (selectedCoursework||coursework) {
            history.push(`/teacher/${props.course.id}/assignment/${coursework&&coursework.id||selectedCoursework.id}/`);
        }
    }

    function doChangeStudent (student) {
        setSelectedStudent(student);
        updateUrl({student});
    }
    function doChangeCoursework (coursework) {
        setSelectedCoursework(coursework);
        updateUrl({coursework});
    }


    function getExemplarKey () {
        return getProp(selectedStudent,'userId')+'-'+getProp(selectedCoursework,'id')+currentPortfolio.length // hacky -- but we should jump to 0 and then up when we fetch...
    }

    function exportAspenAssignments () {
        // map skills
        
        // map grades for each student
    }
    
    useEffect( ()=>{
        console.log('recalc our exemplarEditorProps...');
        var submission;
        if (selectedCoursework && selectedStudent) {
            console.log('TAV: Filter submissions for ',selectedStudent,selectedCoursework);
            var submissions = allStudentWork.filter(
                (submission) => {
                    if (submission.courseWorkId==selectedCoursework.id) {
                        if (submission.userId == selectedStudent.userId) {
                            return true;
                        }
                        if (submission.submissionHistory) {
                            for (var i=0; i<submission.submissionHistory.length; i++) {
                                if (getProp(submission.submissionHistory[i],'stateHistory.actorUserId') == selectedStudent.userId) {
                                    return true
                                }
                            }
                        }
                    }
                });
            if (submissions.length) {
                submission = submissions[0]
            }
        }
        var eepProps = {
            selectedCoursework : selectedCoursework,
            selectedSubmission : submission,
            selectedSkills : currentPortfolio.filter((item)=>selectedCoursework && item.courseworkId==selectedCoursework.id),
        };
        if (selectedCoursework && skillHookProps.assignments && skillHookProps.assignments[selectedCoursework.id]) {
            console.log('TAV: Assignment has skills mapped, let\'s check on them...');
            var skillsToAdd = skillHookProps.assignments[selectedCoursework.id].slice();
            // Remove ones the student already has...
            eepProps.selectedSkills.forEach(
                (skill)=>{
                    var idx = skillsToAdd.indexOf(skill.skill);
                    if (idx > -1) {
                        skillsToAdd.splice(idx,1);
                    }
                });
            skillsToAdd.forEach((sk)=>eepProps.selectedSkills.push({skill:sk}));
        }
        // Now set it...
        setEEProps(eepProps)
        setERC(exemplarRenderCount+1);
    },
               [currentPortfolio,selectedCoursework]
             )

    function saveExemplars (exemplars) {
        setCurrentPortfolio(portfolioManager.updateExemplarsForStudent(exemplars,selectedStudent));
    }

    return (
        <Viewport.Two>
          <Navbar className="navbar1">
            <Navbar.Item>
              <SelectableItem
                initialValue={selectedCoursework}            
                items={coursework}
                title="Choose Assignment"
                renderItem={(itm)=><span>{itm.title}</span>}
                onSelected={setSelectedCoursework}
                key={`${getProp(selectedCoursework,'id')}-${getProp(coursework,'length')}`}
              />
            </Navbar.Item>
            <Navbar.Item>
              <StudentPicker
                   students={students}
                selected={selectedStudent}
                onSelected={doChangeStudent}
              />
            </Navbar.Item>
            <Navbar.End>
              {/* <Navbar.Item className="buttons"> */}
              {/*   <Button onClick={setShowCreator}>Create All Portfolio</Button> */}
              {/*   <Button onClick={setShowExporter}>Export Grades</Button> */}
              {/* </Navbar.Item> */}
              <Navbar.Item>
            {selectedStudent &&
             <React.Fragment>
               {/* portfolioManager.getId(selectedStudent) */}                                      
               {portfolioManager.errorState.map[portfolioManager.getId(selectedStudent)] &&
                <span className="error">Error: {JSON.stringify(
                    portfolioManager.getError(selectedStudent)
                )}</span>}
               <span>{portfolioManager.savedState.map[portfolioManager.getId(selectedStudent)]
                             && 'SAVED!' ||
                             'NOT SAVED'}
               </span>
               <span>
                 {portfolioManager.busyState.map[portfolioManager.getId(selectedStudent)] &&
                  <progress max="100" className="progress">Loading</progress> || 
                  <Button icon={Icon.save}
                          disabled={!!portfolioManager.savedState.map[portfolioManager.getId(selectedStudent)]}
                          onClick={
                              ()=>{portfolioManager.savePortfolio(selectedStudent)}
                          }
                  >Save to Google</Button>

                 }
               </span>
             </React.Fragment>}
              </Navbar.Item>
             


            </Navbar.End>
          </Navbar>
          <div>
            <ExemplarEditor
              {...props}
              {...skillHookProps}
              {...exemplarEditorProps}
              coursework={coursework}
              mode={'teacher'}
              key={exemplarRenderCount}
              onChange={saveExemplars}
            /></div>
        </Viewport.Two>
    );


}


export default TeacherAssignmentView;
