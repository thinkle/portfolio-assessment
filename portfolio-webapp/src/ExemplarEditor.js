import React,{useState,useEffect} from 'react';
import {useCoursework,useStudentWork} from './gapi/hooks.js';
import {SelectableItem,Container,Icon} from './widgets.js';
import ThreePanel from './widgets/threePanelLayout.js';
import {SkillPicker,usePortfolioSkillHook} from './AssignmentMapper.js';
import {arrayProp,classNames} from './utils.js';
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
    return (<input type="text" defaultValue={props.value}/>)
}


function ExemplarEditor (props) {
    const coursework = useCoursework({course:props.course,coursework:props.coursework})
    const {strands,skills,assignments} = usePortfolioSkillHook(props);
    const [selectedCoursework,setSelectedCoursework] = useState(props.exemplar && props.exemplar.coursework)
    const [selectedSkill,setSelectedSkill] = useState();
    const [permalink,setPermalink] = useState();

    useEffect(
        ()=>{
            if (selectedCoursework && selectedCoursework.assignmentSubmission) {
                console.log('check for link...');
                var attachments = selectedCoursework.assignmentSubmission.attachments;
                if (attachments && attachments.length > 0) {
                    var url = Material.getLink(attachments[0]);
                    if (url) {
                        console.log('set permalink');
                        setPermalink(url);
                    }
                }
            }
        },
        [selectedCoursework]
    );

    const studentWork = useStudentWork(
        {course:props.course,
         coursework:selectedCoursework,
         student:props.student,
         studentWork:props.studentWork
        });
    const [allTheWork,setAllTheWork] = useState([]);
    if (!props.onChange) {
        console.log('No callback for ExemplarEditor???');
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
              {studentWork && studentWork.length || 'No student work?'}
              Choose Exemplar:
              <SelectableItem
                items={studentWork}
                title="Choose Assignment"
                renderItem={(itm)=><div>{itm.courseWorkId && courseworkById[itm.courseWorkId].title} {assignmentStateToIcon(itm.state)}</div>}
                onSelected={setSelectedCoursework}
              />
            </div>
            <div>
              Choose Skill:
              <SkillPicker strands={strands} skills={skills} onSelected={setSelectedSkill}/>
            </div>
          </ThreePanel.Top>
          <ThreePanel.Sidebar>
            {selectedCoursework &&
             <div>
               <h3>Exemplar work:</h3>
               <a href={selectedCoursework.alternateLink} target="_BLANK">Classroom Assignment Link</a>
               <p>{assignments[selectedCoursework.courseWorkId] && assignments[selectedCoursework.courseWorkId].title}</p>
               <p>Link to work (choose only one link):
                 {selectedCoursework && selectedCoursework.assignmentSubmission && selectedCoursework.assignmentSubmission.attachments
                  && 
                  selectedCoursework.assignmentSubmission.attachments.map(
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
               {/* <p>{JSON.stringify(selectedCoursework)}</p> */}
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
              <Editor placeholder={`Type your reflection on ${selectedSkill.skill||'?'} here...`}/>
            </div>}
            {selectedSkill &&
            <div>
              Assessment:
              <GradeBox/>
              <Editor placeholder={`Type your comments of ${selectedSkill.skill ||'?'} here...`}/>
            </div>}
            
          </ThreePanel.Sidebar>
          <ThreePanel.Body>
            <SheetWidget url={permalink}/>
          </ThreePanel.Body>
        </ThreePanel>
    );
}

export default ExemplarEditor;
