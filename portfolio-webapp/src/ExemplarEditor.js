import React,{useState,useEffect} from 'react';
import {useCoursework,useStudentWork,useStudentPortfolio} from './gapi/hooks.js';
import {CustomSelectableItem,SelectableItem,Container,Icon,Button} from './widgets.js';
import ThreePanel from './widgets/threePanelLayout.js';
import {SkillPicker,usePortfolioSkillHook} from './AssignmentMapper.js';
import {arrayProp,classNames,getById} from './utils.js';
import Material from './Material.js';
import SheetWidget from './SheetWidget.js';
import Editor from './RichText.js';



/********************************
* What should an exemplar be?   *
* Classroom assignment ...      *
*  -> classroom assignment link *
*  -> permalink                 *
*  -> reflection                *
*  -> assessment                *
/*******************************/
function assignmentStateToIcon (state) {
    if (state=='TURNED_IN') {
        return <Icon icon={Icon.teacher}/>
    }
    if (state=='RETURNED') {
        return <Icon icon={Icon.clipboard}/>
    }
    if (state=='NEW') {
        return <Icon icon={Icon.folderOpen}/>
    }
    if (state=='RECLAIMED_BY_STUDENT') {
        return <Icon icon={Icon.undo}/>
    }
    if (state=='CREATED') {
        return <Icon icon={Icon.work}/>
    }
}


function GradeBox (props) {
    /* To do: make fancy */
    return (<input type="text" onChange={(event)=>props.onChange(event.target.value)} value={props.value}/>)
}


function ExemplarEditor (props) {
    // data we need to choose our exemplar
    const coursework = useCoursework({course:props.course,coursework:props.coursework})
    const {strands,skills,assignments} = usePortfolioSkillHook(props);
    
    // data we choose
    const [selectedSubmission,setSelectedSubmission] = useState(props.selectedSubmission)
    const [selectedSkill,setSelectedSkill] = useState();

    // data we enter
    const [permalink,setPermalink] = useState(props.permalink);
    const [score,setScore] = useState(props.assessment && props.assessment.score);
    const [assessment,setAssessment] = useState(props.assessment && props.assessment.comment);
    const [reflection,setReflection] = useState(props.reflection);

    useEffect(
        ()=>{
            console.log('useEffect selectedSkill/Skill hook?',selectedSkill,typeof selectedSkill);
            if (!selectedSkill && props.skill) {
                console.log('skill string... that should change.');
                var skillObj = getById(skills,props.skill,'skill');
                console.log('Setting skill to ',skillObj);
                setSelectedSkill(skillObj);
            }
        },
        [selectedSkill,skills,props.skill]
    );
    
    useEffect(
        ()=>{
            if (selectedSubmission && selectedSubmission.assignmentSubmission) {
                console.log('check for link...');
                var attachments = selectedSubmission.assignmentSubmission.attachments;
                if (attachments && attachments.length > 0) {
                    var url = Material.getLink(attachments[0]);
                    if (url) {
                        console.log('set permalink');
                        setPermalink(url);
                    }
                }
            }
        },
        [selectedSubmission]
    );

    const studentWork = useStudentWork(
        {course:props.course,
         coursework:selectedSubmission,
         student:props.student,
         studentWork:props.studentWork
        });

    const [allTheWork,setAllTheWork] = useState([]);

    if (!props.onChange) {
        console.log('No callback for ExemplarEditor???');
    }
    
    function save () {
        var exemplar = {
            id : props.id,
            submissionId : selectedSubmission && selectedSubmission.id,
            courseworkId : selectedSubmission && selectedSubmission.courseWorkId,
            skill : selectedSkill.skill,
            permalink : permalink,
            reflection : reflection,
            assessment : {
                comment : assessment,
                score : score,
            }
        }
        console.log('Exemplar Editor says save: ',exemplar);
        props.onChange(exemplar);
    }


    var courseworkById = {}
    coursework.forEach(
        (cw)=>{
            courseworkById[cw.id] = cw;
        }
    );

    return (
        <ThreePanel>
          <ThreePanel.Top>
            <div>
              <h1>
                {selectedSubmission && selectedSubmission.courseWorkId}
                {selectedSkill && selectedSkill.skill}
              </h1>
              {studentWork && studentWork.length || 'No student work?'}
              Choose Exemplar:
              <SelectableItem
                initialValue={selectedSubmission}
                items={studentWork}
                title="Choose Assignment"
                renderItem={(itm)=><div>{itm.courseWorkId &&
                                         courseworkById[itm.courseWorkId]
                                         && courseworkById[itm.courseWorkId].title} {assignmentStateToIcon(itm.state)}</div>}
                onSelected={setSelectedSubmission}
              />
            </div>
            <div>
              <CustomSelectableItem
                unselect={()=>setSelectedSkill()}
                selected={selectedSkill}
              >
                <div>
                 {selectedSkill && (
                     <div>                  
                       <h3>Skill:</h3>
                       <div>
                         {selectedSkill.skill}
                         <span className='tag'>{selectedSkill.strand}</span>
                       </div>
                     </div>)
                 }
                </div>
                <div>
                  Choose Skill:
                  <SkillPicker strands={strands} skills={skills} onSelected={setSelectedSkill}/>
                </div>
              </CustomSelectableItem>
            </div>
            <div>
              <Button icon={Icon.save} onClick={save}>Save Exemplar</Button>
            </div>
          </ThreePanel.Top>
          <ThreePanel.Sidebar>
            {selectedSubmission &&
             <div>
               <h3>Exemplar work:</h3>
               <a href={selectedSubmission.alternateLink} target="_BLANK">Classroom Assignment Link</a>
               <p>{assignments[selectedSubmission.courseWorkId] && assignments[selectedSubmission.courseWorkId].title}</p>
               <p>Link to work (choose only one link):
                 {selectedSubmission && selectedSubmission.assignmentSubmission && selectedSubmission.assignmentSubmission.attachments
                  && 
                  selectedSubmission.assignmentSubmission.attachments.map(
                      (attachment)=>(
                          <label>
                            <input type="checkbox" checked={Material.getLink(attachment)==permalink}
                                   onClick={
                                       ()=>{
                                           if (Material.getLink(attachment)==permalink) {
                                               console.log('remove permalink...');
                                               setPermalink()
                                           }
                                           else {
                                               setPermalink(Material.getLink(attachment));
                                           }
                                       }
                                   }
                            />
                            <div className={classNames({
                                selected:(Material.getLink(attachment)==permalink)
                            })}>
                              <Material material={attachment}/>
                            </div>
                          </label>
                      )
                  )}
               </p>
               {/* <p>{JSON.stringify(selectedSubmission)}</p> */}
             </div>}
            {selectedSkill && (
                <div>                  
                  <h3>Skill:</h3>
                  <div>{selectedSkill.skill} <span className='tag'>{selectedSkill.strand}</span>
                    {selectedSkill.exemplars.length} {selectedSkill.exemplars.length==1 && 'exemplar' || 'exemplars'}, due&nbsp;
                    {selectedSkill.exemplars.map((ex,i)=><span>{ex.dueDate && ex.dueDate.toLocaleDateString()}{i<(selectedSkill.exemplars.length-1)&&','}</span>)}
                    <div className='description' dangerouslySetInnerHTML={{__html:selectedSkill.descriptor}}/>
                  </div>
                </div>)
            }
            {selectedSkill && 
            <div>
              Reflection:
              <Editor editorHtml={reflection}
                      onChange={setReflection}
                      placeholder={`Type your reflection on ${selectedSkill.skill||'?'} here...`}
              />
            </div>}
            {selectedSkill &&
            <div>
              Assessment:
              <GradeBox onChange={setScore} value={score}/>
              <Editor editorHtml={assessment}
                      onChange={setAssessment}
                      placeholder={`Type your comments of ${selectedSkill.skill ||'?'} here...`}
              />
            </div>}            
          </ThreePanel.Sidebar>
          <ThreePanel.Body>
            <SheetWidget url={permalink}/>
          </ThreePanel.Body>
        </ThreePanel>
    );
}

export default ExemplarEditor;
