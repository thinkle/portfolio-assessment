import React,{useState,useEffect} from 'react';
import CourseworkList from './CourseworkList.js';
import Api from './gapi/gapi.js';
import {Button,Icon} from './widgets.js';
import {classNames,arrayProp,objProp} from './utils.js';
import './AssignmentMapper.sass'

function SkillPicker (props) {
  
    var strands = props.strands||['MO','EX'] // for menu
    var skills = props.skills||[
        {strand:'MO',skill:'Model stuff well'},
        {strand:'EX',skill:'Experiment stuff well'},
    ] // for menu

    const [selectedStrand,setSelectedStrand] = useState(); // for sub-menu
    console.log('SkillPicker has strands:',strands.length,strands)
    console.log('SkillPicker has skills:',skills.length,skills)
    return (
        <ul className='menu'>
          {strands.map((strand)=>(
              <li className={classNames({
                  show:!selectedStrand,
                  hide:selectedStrand,
              })}
                  key={strand}>
                <Button icon={Icon.right} onClick={()=>setSelectedStrand(strand)}>{strand}</Button>
              </li>
          ))}
          {selectedStrand &&
           <li>
             <Button onClick={()=>setSelectedStrand(undefined)} icon={Icon.left}>
               {selectedStrand}
             </Button>
           </li>}
          {skills.filter((sk)=>sk.strand==selectedStrand).map((sk)=>(
              <li>
                <Button onClick={()=>{
                    console.log('Selected ',sk);
                    if (props.onSelected) {
                        props.onSelected(sk);
                    }
                    else {
                        console.log("Weird: you didn't provide something to do with this skill");
                        console.log('No onSelected handler');
                    }
                }}>{sk.skill}</Button></li>
          ))}
        </ul>
    )
    
}

function AssignmentMapper (props) {

    const [coursework,setCoursework] = CourseworkList.useCourseworkState(props.course);

    const [skills,setSkills] = useState([])
    const [strands,setStrands] = useState([])
    const [assignments,setAssignments] = useState({});
    var assignmentsP = objProp(assignments,setAssignments);

    var skillsP = arrayProp(skills,setSkills)
    var strandsP = arrayProp(strands,setStrands)

    const [selectedSkills,setSelectedSkills] = useState([]);
    const [selectedCoursework,setSelectedCoursework] = useState();
    var selectedSkillsP = arrayProp(selectedSkills,setSelectedSkills)
    var selectedCourseworkP = arrayProp(selectedCoursework,setSelectedCoursework);


    function getCourseworkById (cid) {
        for (var cw of coursework) {
            if (cw.id===cid) {
                return cw;
            }
        }
        return {}
    }

    function saveMappings () {
        var mappings = []
        for (var assignmentId in assignments) {
            assignments[assignmentId].forEach(
                (skill)=>{
                    mappings.push({
                        assignmentId:assignmentId,
                        skill});
                });
        }
        Api.set_portfolio_desc({assignments:mappings},props.course).then(console.log('success!'));
    }

    function processPortfolioData (portfolioData) {
        var uniqueSkills = {};
        var uniqueStrands = [];
        var assignmentMap = {}
        if (portfolioData.assignments) {
            portfolioData.assignments.forEach(
                (courseToSkill)=>{
                    if (!assignmentMap[courseToSkill.assignmentId]) {
                        assignmentMap[courseToSkill.assignmentId] = [courseToSkill.skill]
                    }
                    else {
                        assignmentMap[courseToSkill.assignmentId].push(courseToSkill.skill)
                    }
                }
            );
            setAssignments(assignmentMap);
        }
        portfolioData.skills.forEach(
            (skill)=>{
                if (!skill.skill) {return}
                if (uniqueStrands.indexOf(skill.strand)==-1) {
                    uniqueStrands.push(skill.strand)
                }
                var id = skill.strand + skill.skill;
                if (! uniqueSkills[id]) {
                    uniqueSkills[id] = {
                        skill : skill.skill,
                        strand: skill.strand,
                        exemplars: [skill]
                    }
                }
                else {
                    uniqueSkills[id].exemplars.push(skill)
                }
            }
        );
        console.log('Setting unique skills and strands...');
        setStrands(uniqueStrands);
        setSkills(Object.values(uniqueSkills))
    }

    useEffect(()=>{
        async function getPortfolioDesc ()  {
            console.log('Getting portfolio data...');
            var portfolioData = await Api.get_portfolio_desc(props.course);
            console.log('Got portfolio data!');
            processPortfolioData(portfolioData);
            console.log('Done processing portfolioData');
        }
        getPortfolioDesc();
    },[props.course])
    
    return (
        <div className="mapper">
          <h3>{props.course.title} Map Coursework to Skills</h3>
          <div className="card">
            <div className="card-header"><Icon icon={Icon.plus}/> New Mapping</div>
            <div className="card-content">
              <div className="sideBySide">
                {selectedCoursework &&
               <div className="topLeft">Coursework:
                 <div><CourseworkList.CourseworkItem item={selectedCoursework}/>
                   <Button
                     icon={Icon.close}
                     onClick={()=>{setSelectedCoursework()}}
                   />
                 </div>
               </div>
               ||
                 <div className='topLeft'>Pick Assignment
                 <CourseworkList
                   course={props.course} menu={true}
                   coursework={coursework}
                   onSelected={setSelectedCoursework}
                 />
               </div>
              }
              <div className="topMid"><Icon icon={Icon.right}/><Icon icon={Icon.right}/><Icon icon={Icon.right}/></div>
                {selectedSkills.length>0 && <div className="topRight">{selectedSkills.length} skills:
              {selectedSkills.map((skill)=>
                                  <div>
                                    {skill.skill} <span className='tag'>{skill.strand}</span>
                                    ({skill.exemplars.length} exemplars required)
                                    <Icon
                                      icon={Icon.close}
                                      onClick={()=>{selectedSkillsP.remove(skill)}}
                                    />
                                  </div>)}            
                                            </div>}
              <div className={classNames({
                  topRight: selectedSkills.length==0,
                  bottomRight: selectedSkills.length>0
              })}>Pick Skill:
                <SkillPicker
                  onSelected={selectedSkillsP.push}
                  course={props.course}
                  skills={skills}
                  strands={strands}/>
              </div>
            </div>
            </div>
            <div className="card-footer">
              <Button
                className='is-primary card-footer-item'
                icon={Icon.plus}
                onClick={()=>{
                    assignmentsP.extendArrayVal(selectedCoursework.id,selectedSkills.map((skl)=>skl.skill),true) // last flat makes sure vals are unique
                }
                        }
              >Add Mapping</Button>
            </div>
          </div>
          <Button icon={Icon.save}
                  onClick={saveMappings}
          >Save to Google Drive</Button>
          <div className="existing-assignments">
            {Object.keys(assignments).map(
                (assignmentId)=>(
                    <div className='mapping sideBySide'>
                      <CourseworkList.CourseworkItem item={getCourseworkById(assignmentId)}/>
                      <Icon icon={Icon.right}/>
                      <div className="skills">{
                          assignments[assignmentId].map(
                              (skl)=><p>{skl}
                                       <Icon icon={Icon.trash}
                                             onClick={()=>{
                                                 assignmentsP.removeFromArrayVal(assignmentId,skl)
                                             }
                                                     }
                                       />
                                     </p>)}
                      </div>
                    </div>
                )
            )}
          </div>
        </div>
    );

}

export default AssignmentMapper;
