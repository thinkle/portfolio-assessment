import React, {useEffect, useState} from 'react';
import TreeView from './TreeView.js';
import {Container,Button,Icon,Modal} from './widgets.js';
import {useStudentPortfolio,useCoursework,useStudentWork} from './gapi/hooks.js';
import {getItemById,replaceItemInArray,getProp} from './utils.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';
import ExemplarEditor from './ExemplarEditor.js';

/****

PORTFOLIO

STRAND -> 4 OF 6 TURNED IN - 3 OF 6 ASSESSED

(WHOLE PORTFOLIO | DUE ON OR BEFORE [ DATE SELECTOR ] | OVERDUE)

STRAND - SKILL - POINTS - EVIDENCE - ASSESSMENT
  - ADD EXEMPLAR
  - ADD REFLECTION
  - READ ASSESSMENT
  - ADD ASSESSMENT (TEACHER MODE)


TABLE UNDER THE HOOD...
SKILL -> CLASSROOM ASSIGNMENT -> LINK -> DATE


****/

function ExemplarSelectorCol ({data, onPropChange}) {
    var value = data.exemplar;
    
}

/* Exemplar data is... */
/*TEST DATA:[
  {"courseId":"20912946613",
  "courseWorkId":"37732657941",
  "id":"CgwIgu-cAhCV1qrIjAE",
  "userId":"118286616169423182268",
  "creationTime":"2019-09-12T10:51:36.736Z",
  "updateTime":"2019-09-13T14:58:31.920Z",
  "state":"TURNED_IN",
  "alternateLink":"https://classroom.google.com/c/MjA5MTI5NDY2MTNa/a/Mzc3MzI2NTc5NDFa/submissions/student/NDY2NzI2Nlpa",
  "courseWorkType":"ASSIGNMENT",
  "assignmentSubmission":{
      "attachments":[{"link":{"url":"https://CSS-Intro--hannahsan.repl.co",
                      "title":"repl.it","thumbnailUrl":"https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://CSS-Intro--hannahsan.repl.co&a=AIYkKU8IEk0iQkS_84mO-qZZbLjqlOvvrg"}}
 ]},
  "submissionHistory":[{"stateHistory":{"state":"CREATED","stateTimestamp":"2019-09-12T10:51:36.706Z","actorUserId":"118286616169423182268"}},{"stateHistory":{"state":"TURNED_IN","stateTimestamp":"2019-09-13T14:58:31.920Z","actorUserId":"118286616169423182268"}}]},
*/

/********************************
* What should an exemplar be?   *
* Classroom assignment ...      *
*  -> classroom assignment link *
*  -> permalink                 *
*  -> reflection                *
*  -> assessment                *
/*******************************/

var testExemplar = {
    title : 'CSS Intro',
    classroomLink : "https://classroom.google.com/c/MjA5MTI5NDY2MTNa/a/Mzc3MzI2NTc5NDFa/submissions/student/NDY2NzI2Nlpa",
    permalink : "https://CSS-Intro--hannahsan.repl.co",
    reflection : `<p>Some long reflection in HTML</p>`,
    assessment : {
        comment : `<p>Some lengthy comment about the exemplars.</p>`,
        score : 123, // some score
    },
    skill : 'Eating',
    due : new Date(),
}

function Portfolio (props) {
    const skillHookProps = usePortfolioSkillHook(props);
    console.log('Use with props',props);
    const studentPortfolioProps = useStudentPortfolio(props);
    const coursework = useCoursework(props);
    const studentwork = useStudentWork(props);
    return <PortfolioComponent
             key={skillHookProps.key}
             {...props}
             {...skillHookProps}
             {...studentPortfolioProps}
             coursework={coursework}
             studentwork={studentwork}
           />
}

function LazyPortfolioComponent (props) {
    const studentPortfolioProps = useStudentPortfolio({...props,dontFetch:true});

    useEffect( ()=>{
        if (props.fetchNow) {
            studentPortfolioProps.fetch();
        }
    },
               [props.fetchNow]);

    return (props.fetchNow && <PortfolioComponent {...props}
                               {...studentPortfolioProps}
                              /> || <div>{props.student && props.student.userId}</div>);
}

function PortfolioComponent (props) {

    // needs props:
    // course =
    // student =

    const {skills, strands, assignments,
           busy, portfolio, setPortfolio, savePortfolio, saved, updateExemplars,
           coursework, studentwork
          } = props; // state lifted...

    const [filters,setFilters] = useState({});
    const [dataCount,setDataCount] = useState(1);
    const [treeData,setTreeData] = useState([]);
    const [showExemplar,setShowExemplar] = useState(false);
    const [exemplarEditorProps,setExemplarEditorProps] = useState({});

    useEffect(
        ()=>{
            setTreeData(buildTreeDataStructure())
            setDataCount(dataCount + 1);
        },
        [portfolio, skills, strands, coursework, studentwork, filters]
    );

    function buildTreeDataStructure () {
        var tree = [];
        strands.forEach((strand)=>{
            tree.push( {
                data : {strand:strand},
                children : skills.filter((skill)=>skill.strand==strand).map(
                    (skill)=>({
                        data : skill,
                                // points:skill.exemplars && skill.exemplars.reduce((ex,i)=>i+ex.points),
                                // nexemplars:skill.exemplars && skill.exemplars.length
                               //},
                        children : portfolio.filter(
                            (exemplar)=>exemplar.skill == skill.skill
                        ).map((exemplar)=>{
                            exemplar.coursework = getItemById(coursework,exemplar.courseworkId);
                            exemplar.submission = getItemById(studentwork,exemplar.submissionId);
                            var node = {data:exemplar}
                            return node
                        }
                             )
                    })
                )
            })
        });
        tree = filterTreeStructure(tree);
        return tree;
    }

    const filterNames = [
        ['Has student exemplar','hasWork'],
        ['Empty','isEmpty'],
        ['Needs exemplar','needsWork'],
        ['Is Complete','complete'],
        ['Needs assessment','needsAssessment'],
        ['Needs reflection','needsReflection'],
    ]
    
    function filterTreeStructure (tree) {
        if (!filters || Object.keys(filters).length==0) {
            return tree;
        }
        else {
            if (filters.hasWork) {
                keepOnlyWithWork();
            }
            if (filters.needsAssessment) {
                filterBasedOnWork((skill)=>(exemplar)=>{
                    console.log('Filter on skill',skill);
                    console.log('Looking at exemplar',exemplar);
                    const val = (!(exemplar.assessment&&exemplar.assessment.score))
                    console.log('Got value: ',val)
                    return val;
                })
                keepOnlyWithWork();
            }
            if (filters.needsReflection) {
                filterBasedOnWork(
                    (skill)=>(exemplar)=>!exemplar.reflection
                );
                keepOnlyWithWork();
            }
            if (filters.isEmpty) {
                
            }
            if (filters.needsWork) {
                filterSkill((skill,work)=>{
                    const exemplarsNeeded = skill.exemplars.length;
                    const exemplars = work.length;
                    const result = (exemplarsNeeded > exemplars)
                    return result;
                })
            }
            if (filters.complete) {
                filterSkill((skill,work)=>{
                    const exemplarsNeeded = skill.exemplars.length;
                    const exemplars = work.length;
                    const result = (exemplarsNeeded <= exemplars)
                    return result;
                })
            }

        }
        return tree;

        function keepOnlyWithWork () {
            for (var strand of tree) {
                strand.children = strand.children.filter(
                    (skill)=>skill.children.length > 0
                    // children of skills ARE exemplars - so none = no exemplars
                );
            }
            tree = tree.filter((strand)=>strand.children.length>0)
        }

        function filterSkill (skillFilter) {
            const skillRowFilter = (row)=>skillFilter(row.data,row.children);
            for (var strand of tree) {
                strand.children = strand.children.filter(skillRowFilter)
            }
            tree = tree.filter((strand)=>strand.children.length>0)
        }

        function filterBasedOnWork (workFilterMaker) {
            for (var strand of tree) {
                for (var skill of strand.children) {
                    const workFilter = workFilterMaker(skill.data);
                    const childFilter = (row) => workFilter(row.data);
                    skill.children = skill.children.filter(childFilter);
                }
            }
        }

    }

    function saveExemplars (exemplars) {
        updateExemplars(exemplars)
        buildTreeDataStructure()
        setDataCount(dataCount+1);
        setShowExemplar(false);
    }

    var treeState = TreeView.NapTime(1); // state manager for toggled state of tree

    return (
        <Container>
          <h3>{props.student.profile.name.fullName} Portfolio</h3>
          {busy && <span>Fetching student portfolio data...</span>}
          {!saved && <Button icon={Icon.save} onClick={()=>savePortfolio()}>Save Changes to Google</Button>}
          {filterView()}
          {true && 
           <TreeView
             getShowChildrenState={treeState.getShowChildrenState}
             onSetShowChildren={treeState.onSetShowChildren}
             noDelete={true}
             key={dataCount}
             data={treeData}
             headers={[
                 'Strand','Skill','Points','Exemplars','Due','Assessment'
             ]}
             widths = {[
                 '6em','15em','12em','15em','8em','15em'
             ]}
            cols={5}
            getRenderers={(params)=>{
                if (params.level==0) {
                    return [TreeView.HeaderCol('strand',{colSpan:2}),
                            StrandPointsTotalCol,
                            StrandExemplarCountCol,
                            TreeView.BlankCol(),
                            TreeView.BlankCol(),
                            TreeView.BlankCol()]
                }
                else if (params.level==1) {
                    return [TreeView.TextCol('strand'),
                            TreeView.PopupCol('descriptor',{labelField:'skill',snippetMode:false}),
                            PointsTotalCol,
                            ExemplarCountCol,
                            DueDateCol,
                            TreeView.ButtonCol({icon:Icon.plus,content:'Add exemplar',generateOnClick:makeExemplarCallback}),
                           ]
                }
                else {
                    return [StatusCol,
                            TreeView.LinkCol('permalink',{linkField:'coursework.title'}),
                            TreeView.PopupCol('reflection',{label:'Reflection',tagMode:true,snippetMode:true}),
                            TreeView.PopupCol('assessment.comment',{labelField:'assessment.score',tagMode:true,snippetMode:true}),
                            TreeView.BlankCol(),
                            TreeView.ButtonCol({icon:Icon.edit,content:'Edit Exemplar',generateOnClick:editExemplarCallback})
                           ];
                }
            }}
          />}
          <Modal className='full' active={showExemplar} onClose={()=>setShowExemplar(false)}>
            <ExemplarEditor
              {...props}
              {...exemplarEditorProps}
              strands={strands}
              skills={skills}
              assignments={assignments}
              coursework={coursework}
              key={getExemplarKey()}
              onChange={(exemplars)=>saveExemplars(exemplars)}
              mode={props.teacherMode&&'teacher'||'student'}
            />
          </Modal>

          
        </Container>
    )
    function getExemplarKey () {
        if (!exemplarEditorProps) {
            return 0
        }
        else {
            const pp = exemplarEditorProps
            if (pp.selectedSkills) {
                return pp.selectedSkills.map(
                (p)=>`${p.id||''}${p.skill}-${getProp(p,'selectedSubmission.id')}-${getProp(p,'reflection.length')}-${getProp(p,'assessment.comment.length')}-${getProp(p,'assessment.score')}-${getProp(p,'permalink')}`
            ).join('.')
            }
            else {
                return Object.values(pp).join('.');
            }
        }
    }

    function editExemplarCallback ({data, children}) {
        return function () {
            var props = {
                selectedSubmission : data.submission,
                selectedCoursework : data.coursework,
                selectedSkills : [skillFromData(data)],
            };

            function skillFromData (data) {
                return {
                    skill:data.skill,
                    id : data.id,
                    reflection : data.reflection,
                    assessment : data.assessment,
                    permalink : data.permalink,
                    revisionCount : data.revisionCount,
                }
            }

            // Grab any other skills associated with this submission...
            treeData.forEach(
                (strand) => {
                    strand.children.forEach(
                        (skill) => {
                            skill.children.forEach((exemplar)=>{
                                if (exemplar.data.submission == data.submission && exemplar.data != data) {
                                    props.selectedSkills.push(skillFromData(exemplar.data));
                                }
                            })
                        }
                    );
                }
            );

            
            setExemplarEditorProps(props);
            setShowExemplar(true);
        }
    }

    function makeExemplarCallback ({data, children, rowId}) {
        return function () {
            console.log('We got a click!');
            console.log('Make a new exemplar!');
            console.log('Course: ',props.course)
            console.log('Student: ',props.student)
            console.log('Skill:',data.skill);
            console.log('Strand:',data.strand);
            console.log('Adding after row',rowId);
            treeState.onSetShowChildren(true,rowId);
            setExemplarEditorProps({
                selectedSkills : [{skill:data.skill}]
            });
            setShowExemplar(true);
        }
        
    }



    function filterView () {
        return (<div>
                  {filterNames.map(
                      ([name,prop])=>(
                          <span><input type="checkbox"
                                 checked={!!filters[prop]}
                                 onChange={(event)=>setFilters({...filters,[prop]:event.target.checked})}
                                /> {name}</span>
                      )
                  )}
                </div>);
    }


    
}

function StrandExemplarCountCol ({data,children}) {
    var exemplars = 0;
    var work = 0;
    children.forEach(
        (skill)=>{
            exemplars += skill.data.exemplars.length
            work += skill.children.length;
        }
    );
    return <b>{work||0} of {exemplars||0}</b>
}

function StrandPointsTotalCol ({data,children}) {
    var tot = 0;
    children.forEach(
        (skill)=>{
            skill.data.exemplars.forEach(
                (ex)=>tot+=ex.points
            )
        });
    return <b>{tot}</b>
}

function ExemplarCountCol ({data,children}) {
    return data.exemplars && <span>{children&&children.length||0} of {data.exemplars.length}</span>
}
function DueDateCol ({data,children}) {
    return data.exemplars &&
        <span>
          {data.exemplars
           .map(
               (child)=>child.dueDate && child.dueDate.toLocaleDateString([],{day:'numeric',month:'short'})||''
           )
           .filter((item,idx,array)=>array.indexOf(item)===idx) // keep unique
           .map((date)=><span><span>{date.replace(' ','\u00A0')}</span> </span>) // put in a span
          }
        </span>
}

function PointsTotalCol ({data}) {
    if (data.exemplars) {
        var tot = 0;
        data.exemplars.forEach((ex)=>tot+=ex.points);
        return data.exemplars && <span>{tot}</span>
    }
    else {
        return '-'
    }
}

function StatusCol ({data}) {
    var revCount = data.revisionCount || 0;
    var assCount = data.assessment && data.assessment.count || 0;    
    if (assCount >= revCount) {
        return <span><Icon icon={Icon.teacher}/><span className='tag'>{assCount}</span></span>
    }
    else if (revCount == 0) {
        return <span><Icon icon={Icon.bang}/><span className='tag'>Not in</span></span>
    }
    else {
        return <span><Icon icon={Icon.check}/><span className='tag'>{revCount}</span></span>
    }
}

Portfolio.Bare = PortfolioComponent;
Portfolio.Lazy = LazyPortfolioComponent;
export default Portfolio;

