import React,{useState,useEffect} from 'react';
import {useCoursework,useStudentWork,useStudentPortfolio} from './gapi/hooks.js';
import {Box,CustomSelectableItem,SelectableItem,Container,Icon,Button,Navbar,h} from './widgets.js';
import {SkillPicker,usePortfolioSkillHook} from './AssignmentMapper.js';
import {arrayProp,classNames,getById,getProp} from './utils.js';
import Material from './Material.js';
import SheetWidget from './SheetWidget.js';
import Editor from './RichText.js';
import {classnames, sanitize} from './utils.js';
import MagicLink from './linkMagic.js';
import './ExemplarEditor.scss';



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

function StandAloneExemplarEditor (props) {
    const {strands,skills,assignments} = usePortfolioSkillHook(props);
    const coursework = useCoursework({course:props.course,coursework:props.coursework});
    return <ExemplarEditor
             strands={strands}
             skills={skills}
             assignments={assignments}
             {...props}
             />
}

/* This level lets us choose the work and handle multiple skills */
function ExemplarEditor (props) {

    const {strands,skills,assignments,coursework} = props; // lifted up to Portfolio


    // data we choose
    const [selectedSubmission,setSelectedSubmission] = useState(props.selectedSubmission)
    const [customSubmissionMode,setCustomSubmissionMode] = useState(false);
    const [permalink,setPermalink] = useState(props.permalink);

    // data we fetch
    const studentWork = useStudentWork(
        {course:props.course,
         coursework:selectedSubmission,
         student:props.student,
         studentWork:props.studentWork,
         ...props
        });

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

    const [sidebarMode,setSidebarMode] = useState(false);

    const [selectedSkills,setSelectedSkills] = useState(props.selectedSkills||[])
    
    var courseworkById = {}
    coursework.forEach(
        (cw)=>{
            courseworkById[cw.id] = cw;
        }
    );

    function saveAll (updateCounts) {
        var exemplarsToSave = selectedSkills
            .filter((sk)=>sk) // filter out "empty" skills that we deleted
            .map(
            (sk)=>{
                var copy = {...sk,
                            submissionId : selectedSubmission && selectedSubmission.id,
                            courseworkId : selectedSubmission && selectedSubmission.courseWorkId,
                            permalink : permalink,
                           }
                if (updateCounts) {
                    if (props.mode=='teacher') {
                        if (!copy.assessment) {
                            copy.assessment = {}
                        }
                        copy.assessment.count = copy.revisionCount||1;
                    }
                    if (props.mode=='student') {
                        if (copy.assessment) {
                            copy.revisionCount = copy.assessment.count + 1 || 1;
                        }
                        else {
                            copy.revisionCount = 1
                        }
                    }
                }
                return copy;
            }
        );
        props.onChange(exemplarsToSave);
    }
    function saveDraft () {
        saveAll();
    }
    function updateAndSaveAll () {
        saveAll(true);
    }

    function addSkillBox () {
        var skillCopy = selectedSkills.slice();
        skillCopy.push({skill:undefined, id:undefined})
        setSelectedSkills(skillCopy)
    }

    function updateSkill (exemplar, n) {
        console.log('updateSkill',exemplar,n);
        var skillCopy = selectedSkills.slice();
        skillCopy[n] = exemplar;
        setSelectedSkills(skillCopy);
    }

    function removeSkill (n) {
        console.log('removeSkill',n);
        var skillCopy = selectedSkills.slice();
        skillCopy[n] = undefined;
        setSelectedSkills(skillCopy);
    }

    function showSidebar () {
        return sidebarMode && permalink
    }

    return (
        <div>
          {makeNavbar()}
          <div className={classNames({
            ExemplarEditor:true,
            sidebarMode:sidebarMode
        })}>
          <div className="exemplarInfo">
            {exemplarInfoBox()}
          </div>
          <div className="skills">
            {skillAssessmentBoxes()}
          </div>
          <div className="embeddedWork">
            <SheetWidget url={permalink}/>
          </div>
          </div>
        </div>
    );
    
    function skillAssessmentBoxes () {
        return (<React.Fragment>
                  <h.h4>Skills</h.h4>
                  {selectedSkills.map(
                      // Skills can be empty if they've been deleted ?
                      (skill,n)=>skill && <ExemplarSkillEditor
                                   {...props}
                                   {...skill}
                                   skills={skills}
                                   key={n}
                                   coursework={coursework}
                                   selectedSubmission={selectedSubmission}
                                   setSelectedSubmission={setSelectedSubmission}
                                   studentWork={studentWork}
                                   onChange={
                                       (exemplar)=>updateSkill(exemplar,n)
                                   }
                                   onRemove={
                                       ()=>removeSkill(n)
                                   }
                                   /* onSetSkill={(newSkill)=>{ */
                                   /*     console.log(`skill ${n} selected: ${skill}=>${newSkill}`); */
                                   /*     if (newSkill != skill) { */
                                   /*         var copy = selectedSkills.slice(); */
                                   /*         copy[n] = newSkill && newSkill.skill; */
                                   /*         setSelectedSkills(copy); */
                                   /*     } */
                                   /* }} */
                                     />
                  )}
                  {(selectedSubmission || (customSubmissionMode && permalink)) && <Button icon={Icon.plus} onClick={()=>addSkillBox()}>Add Skill</Button>}
                </React.Fragment>
               )
    }

    function makeSubmissionChooser () {
        if (studentWork && studentWork.length) {
            return (
                <React.Fragment>
                  <Navbar.Item>
                    {customSubmissionMode &&
                     <label>Custom Link: <input className="input" type="text" value={permalink} onChange={(event)=>setPermalink(event.target.value)}/></label>                   ||
                     <SelectableItem
                       initialValue={selectedSubmission}            
                       items={studentWork}
                       title="Choose Classroom Assignment"
                       renderItem={
                           (itm)=><span>
                                    {itm.courseWorkId &&
                                     courseworkById[itm.courseWorkId]
                                     && courseworkById[itm.courseWorkId].title} {assignmentStateToIcon(itm.state)}
                                  </span>}
                       onSelected={setSelectedSubmission}
                     />}
                    <MagicLink href={permalink} target="_blank"><Icon icon={Icon.external}/></MagicLink>
                  </Navbar.Item>
                  <Navbar.Item>
                    {!selectedSubmission &&
                     (customSubmissionMode &&
                      <Button  onClick={()=>setCustomSubmissionMode(false)}>
                        Use Google Classroom Assignment
                      </Button>
                      ||
                      <Button onClick={()=>setCustomSubmissionMode(true)}>Enter Custom Selection</Button>)
                    }
                  </Navbar.Item>
                </React.Fragment>
            );
        }
        else {
            // If there is no student work, we are controlled and handed a submission, so we
            // just display it such as it is.
            return <Navbar.Item>{theTitle()}<MagicLink href={permalink} target="_blank"><Icon icon={Icon.external}/></MagicLink></Navbar.Item>;
        }
    }

    function makeNavbar () {
        return (
            <Navbar className="navbar2">
              <Navbar.Start>
                <Navbar.QuickBrand>
                  {props.mode=='student' && 'Student Mode'}
                  {props.mode=='teacher' && 'Teacher Mode'}
                  {/* selectedSubmission && selectedSubmission.courseWorkId */}
                  {/* selectedSkill && selectedSkill.skill */}
                </Navbar.QuickBrand>                
                <Navbar.Item>
                {permalink
                 &&
                 (sidebarMode && 
                    <Button
                      onClick={()=>setSidebarMode(false)}
                      icon={Icon.up}
                    >
                      <span className="is-small">Hide Embedded View</span>
                    </Button>
                    ||
                    <Button
                      onClick={()=>setSidebarMode(true)}
                      className="is-small"
                      icon={Icon.down}
                    >
                      <span className="is-small">Show work</span>
                    </Button>
                 )}
                </Navbar.Item>               
              </Navbar.Start>
              {/* https://github.com/jgthms/bulma/issues/1604 */}
              <Navbar.Center>
                {makeSubmissionChooser()}
              </Navbar.Center>
              <Navbar.End>
                <Navbar.Item >
                  <Button onClick={saveDraft}>Save Draft</Button>
                </Navbar.Item>
                <Navbar.Item>
                  <Button className="is-primary" icon={Icon.save}
                          onClick={updateAndSaveAll}
                  >Save and
                    {props.mode=='teacher' && 'Give Feedback'
                     || 'Submit for Feedback'}
                  </Button>
                </Navbar.Item>
              </Navbar.End>
            </Navbar>
        )
    }

    function theTitle () {
        return (
            selectedSubmission && assignments[selectedSubmission.courseWorkId] && getProp(getById(coursework,selectedSubmission.courseWorkId),'title')
                || selectedSubmission && 'The Work'
                || permalink && 'Custom Link'
                || 'No work selected yet'
        );
    }

    function exemplarInfoBox () {
        return (selectedSubmission
            &&
                <Box>
                  <h.h5>Assignment Details</h.h5>
                  
                  {selectedSubmission.alternateLink && <div><a href={selectedSubmission.alternateLink} target="_BLANK">Open Classroom Assignment<Icon icon={Icon.external}/></a></div>}
              {selectedSubmission && selectedSubmission.assignmentSubmission && selectedSubmission.assignmentSubmission.attachments
               &&
               <div className="box linkPicker">
                 <h.h6>Attachments:</h.h6>
                 <ul>{selectedSubmission.assignmentSubmission.attachments.map(
                    (attachment)=>(
                     <li>   <label>
                          <input type="checkbox" checked={Material.getLink(attachment)==permalink}
                                 onChange={
                                        (event)=>{
                                            if (Material.getLink(attachment)==permalink) {
                                                console.log('remove permalink...');
                                                setPermalink('')
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
                        </label></li>
                    )
                 )}
                 </ul>
              </div>}
                  <div><label>Enter Link: <input className="input" type="text" value={permalink} onChange={(event)=>setPermalink(event.target.value)}/></label></div>
            </Box>
               );
    }
}

function ExemplarSkillEditor (props) {
    // data we need to choose our exemplar
    // Refactored as we lift state up... 
    const {strands,skills,assignments} = props; // lifted up to Portfolio
    const {coursework,
           selectedSubmission,
           setSelectedSubmission,
           permalink,
           setPermalink,
           studentWork,
           //onSetSkill,
          } = props; // Lifted up to ExemplarEditor

    const [selectedSkill,setSelectedSkill] = useState(typeof props.skill == 'string' && getById(skills,props.skill,'skill') || props.skill);
    // data we enter
    const [score,setScore] = useState(props.assessment && props.assessment.score);
    const [assessment,setAssessment] = useState(props.assessment && props.assessment.comment);
    const [reflection,setReflection] = useState(props.reflection);
    const [revisionCount,setRevisionCount] = useState(props.revisionCount||0)
    const [assessmentCount,setAssessmentCount] = useState(props.assessment && props.assessment.count||0)


    useEffect(
        ()=>{
            if (typeof props.skill == 'string') {
                console.log('skill string... that should change.');
                var skillObj = getById(skills,props.skill,'skill');
                console.log('Setting skill to ',skillObj);
                setSelectedSkill(skillObj);
            }
            else {
                if (props.skill != selectedSkill) {
                    setSelectedSkill(props.skill);
                }
            }
        },
        [skills,props.skill]
    );
    

    // call an "onChange" handler when we change...
    useEffect(
        ()=>{
            if (props.onChange) {
                console.log('change handler in exemplar skill editor triggered',this);
                save();
            }
        },
        [score,assessment,reflection,revisionCount,assessmentCount,selectedSubmission,selectedSkill]
    );

    if (!props.onChange) {
        console.log('No callback for ExemplarEditor???');
    }
    
    function updateCountAndSave () {
        // Update revision / assessment count and save...
        if (props.mode=='teacher') {
            setAssessmentCount(revisionCount||1,save)
            setDoSave(true);
        }
        else if (props.mode=='student') {
            setRevisionCount(assessmentCount+1,save);
            setDoSave(true);
        }
        else {
            console.log('WARNING: NOT IN TEACHER OR STUDENT MODE???')
        }
    }

    const [doSave,setDoSave] = useState(false)

    useEffect(
        ()=>{
            if (doSave) {
                console.log('Do save do!');
                save();
                setDoSave(false);
            }
        },
        [doSave,assessmentCount,revisionCount]
    );
    
    function save () {
        console.log('and save!');
        var exemplar = {
            id : props.id,
            submissionId : selectedSubmission && selectedSubmission.id,
            courseworkId : selectedSubmission && selectedSubmission.courseWorkId,
            skill : selectedSkill && selectedSkill.skill,
            permalink : permalink,
            reflection : reflection,
            assessment : {
                comment : assessment,
                score : score,
                count : assessmentCount,
            },
            revisionCount : revisionCount
        }
        console.log('Exemplar Editor says save: ',exemplar);
        props.onChange(exemplar);
    }

    function getCustomSkillPickerMenu () {
        if (!selectedSubmission || !selectedSubmission.courseWorkId) {
            return undefined
        }
        else {
            var assignmentSkills = (assignments[selectedSubmission.courseWorkId])
            if (assignmentSkills) {
                var customMenuProps = {
                    title : 'Recommended'
                }
                customMenuProps.items = assignmentSkills.map(
                    (sk)=>getById(skills,sk,'skill')
                );
                return customMenuProps;
            }
        }
    }

    return (
        <Box className={classNames({
            skillEditor:true,
            teacher:props.mode=='teacher',
            student:props.mode=='student',
        })}>
          <div className="skillTitle">
                <CustomSelectableItem
                  unselect={()=>setSelectedSkill()}
                  selected={selectedSkill}
                >
                  <div className="side-by-side">
                    <h.h5>
                      {selectedSkill && selectedSkill.skill}
                    </h.h5>
                    <span className='tag'>{selectedSkill && selectedSkill.strand}</span>
                  </div>
                  <div className="side-by-side">
                    <h.h5>Skill:</h.h5>
                    <SkillPicker
                      key={selectedSubmission && selectedSubmission.courseWorkId}
                      customMenu={getCustomSkillPickerMenu()}
                      strands={strands}
                      skills={skills}
                      onSelected={setSelectedSkill}/>
                  </div>
                </CustomSelectableItem>
            <div className="skillDetail">
              <div className="is-small">{selectedSkill.exemplars.length} {selectedSkill.exemplars.length==1 && 'exemplar' || 'exemplars'}, due&nbsp;
                {selectedSkill.exemplars.map((ex,i)=><span>{ex.dueDate && ex.dueDate.toLocaleDateString()}{i<(selectedSkill.exemplars.length-1)&&','}</span>)}
              </div>
            </div>
            <Navbar className="navbar3 skillControl">
              {props.mode=='student' &&
               <Navbar.Item>
                 {assessmentCount < revisionCount &&
                  <div>Revision #{revisionCount} waiting for feedback</div>
                  ||
                  <Button className='is-primary' icon={Icon.save} onClick={updateCountAndSave}>
                    Submit
                    {revisionCount>=1 && <span>&nbsp;New Revision</span>}
                  </Button>
                 }
               </Navbar.Item>
              }
              <Navbar.Item>
                <span className="tag">rev{revisionCount}</span>
                {assessment && assessment.count > 0 && <span className="tag">assessment #{assessment.count}</span>}
              </Navbar.Item>
              {props.mode=='teacher' &&
               <Navbar.Item>
                 {assessmentCount > 0 && assessmentCount >= revisionCount && <span>Assessment Round #{assessmentCount}</span>
                  ||
                  <Button className='is-primary' icon={Icon.save} onClick={updateCountAndSave}>
                    {revisionCount>1 && <span>New Revision </span>}
                    Feedback
                  </Button>
                 }
               </Navbar.Item>
              }
              <Navbar.End>
                <Navbar.Item>
                  {props.onRemove && <Button onClick={props.onRemove} icon={Icon.delete}>Remove Skill</Button>}
                </Navbar.Item>
              </Navbar.End>
            </Navbar>
          </div>
          {skillInfoBox()}
          {makeMarkupBox()}
        </Box>
    );

    function skillInfoBox () {
        return (
            selectedSkill && 
                <React.Fragment>
                  {/* <div className="skillTitle"> */}
                  {/*   <h.h6>{selectedSkill.skill} <span className='tag'>{selectedSkill.strand}</span></h.h6> */}
                  {/* </div> */}
                  <div className='box skillDescripton description' dangerouslySetInnerHTML={sanitize(selectedSkill.descriptor)}/>
                </React.Fragment>
        )
    }

    function makeMarkupBox () {
        return <React.Fragment>                 
            {selectedSkill && 
             <div className={classNames({
                 reflection:true,
                 box:true,
                 empty:!reflection
             })}>
              <h.h6>Reflection:</h.h6>
             {props.mode=='student' && 
              <Editor editorHtml={reflection}
                      onChange={setReflection}
                      placeholder={`Type your reflection on ${selectedSkill.skill||'?'} here...`}
              /> ||
              (reflection && <div className='description' dangerouslySetInnerHTML={sanitize(reflection)}/> || <div className="is-small">No reflection</div>)
             }
            </div>
            }
            {selectedSkill &&
            <div className="box assessment">
              <h.h6>Assessment:</h.h6>
              {props.mode=='teacher' &&
               <div>
                 <label className="is-bold">Grade: <GradeBox onChange={setScore} value={score}/></label>
                 <Editor editorHtml={assessment}
                         onChange={setAssessment}
                         placeholder={`Type your comments of ${selectedSkill.skill ||'?'} here...`}
                 />
               </div>
               ||
               // Student mode
               <div>
                 <strong>Grade: {score||'Not yet graded'}</strong>
                 <p className='comment'
                    dangerouslySetInnerHTML={sanitize(assessment||'No teacher feedback yet')}
                 />
               </div>
              }
            </div>}           
               </React.Fragment> 
    }

}

export default ExemplarEditor;
