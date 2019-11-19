import React, {useEffect, useState} from 'react';
import TreeView from './TreeView.js';
import {Container,Button,Icon,Modal,Navbar,Menu,Viewport} from './widgets.js';
import {useStudentPortfolio,useCoursework,useStudentWork} from './gapi/hooks.js';
import {getItemById,replaceItemInArray,getProp,classNames} from './utils.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';
import ExemplarEditor from './ExemplarEditor.js';
import PortfolioExporter from './PortfolioExporter.js';
import SavePortfolioButtons from './SavePortfolioButtons.js';
import {inspect} from 'util';

const C = TreeView.Cell;

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
    console.log('Rerender PortfolioComponent',props);
    const {skills, strands, assignments,
           urls, busy, error, portfolio, setPortfolio, savePortfolio, saveOverPortfolio, saved, updateExemplars,
           coursework, studentwork, 
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
        //['Empty','isEmpty'],
        ['Is assessed','isAssessed'],
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
                    const notAssessed = (!(exemplar.assessment&&(exemplar.assessment.score||exemplar.assessment.count)))
                    return (notAssessed || exemplar.assessment.count < exemplar.revisionCount);
                })
                keepOnlyWithWork();
            }
            if (filters.isAssessed) {
                filterBasedOnWork((skill)=>(exemplar)=>{
                    return exemplar.assessment && (exemplar.assessment.count >= exemplar.revisionCount ||
                                                   exemplar.assessment.score && !exemplar.revisionCount)
                });
                keepOnlyWithWork();
            }
            if (filters.needsReflection) {
                filterBasedOnWork(
                    (skill)=>(exemplar)=>!exemplar.reflection
                );
                keepOnlyWithWork();
            }
            // if (filters.isEmpty) {
                
            // }
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
        savePortfolio();
    }

    var treeState = TreeView.NapTime(2); // state manager for toggled state of tree

    return (
        <Viewport>
          <Navbar>
            <Navbar.Start>
              <Navbar.QuickBrand>
                {props.student.profile.name.fullName} Portfolio
              </Navbar.QuickBrand>
              <Navbar.Item>
                {filterView()}                   
              </Navbar.Item>
              <Navbar.Item>
                {assessmentInfo()}                   
              </Navbar.Item>
              <Navbar.Item>
                <PortfolioExporter {...props}
                />
              </Navbar.Item>
            </Navbar.Start>
            <Navbar.End>                         
              {/* {error && */}
              {/*  <React.Fragment> */}
              {/*    <Navbar.Item> */}
              {/*      <Button className="is-danger" */}
              {/*              icon={Icon.save} */}
              {/*              onClick={()=>saveOverPortfolio()}> */}
              {/*        Force Save (save over any other changes) */}
              {/*      </Button> */}
              {/*    </Navbar.Item> */}
              {/*  </React.Fragment>} */}
              <SavePortfolioButtons
                busy={busy}
                urls={urls}
                saved={saved}
                error={error}
                savePortfolio={savePortfolio}
                saveOverPortfolio={saveOverPortfolio}
              />
            </Navbar.End>
          </Navbar>
          {true && 
           <TreeView
             className="portfolio-tree-view"
             getShowChildrenState={treeState.getShowChildrenState}
             onSetShowChildren={treeState.onSetShowChildren}
             noDelete={true}
             key={dataCount}
             data={treeData}
             headers={[
                 'Strand',
                 'Skill',
                 'Points',
                 'Exemplars',
                 'Due'
             ]}
             cols={6}
             /* widths = {[ */
             /*     '6em','15em','12em','15em','8em','15em' */
             /* ]} */
            getRenderers={(params)=>{
                if (params.level==0) {
                    return [TreeView.HeaderCol({field:'strand',colSpan:2}),
                            StrandPointsTotalCol,
                            StrandExemplarCountCol,
                            ]
                }
                else if (params.level==1) {
                    return [TreeView.TagCol({field:'strand'}),
                            TreeView.PopupCol({field:'descriptor',labelField:'skill',snippetMode:false,className:'break-after'}),
                            PointsTotalCol,
                            ExemplarCountCol,
                            DueDateCol,
                            TreeView.ButtonCol({icon:Icon.plus,content:'Add exemplar',generateOnClick:makeExemplarCallback}),
                           ]
                }
                else {
                    return [StatusCol,
                            TreeView.ButtonCol({getText:(data)=>getProp(data,'coursework.title')||getProp(data,'permalink'),className:'break-after',linkStyle:true,
                                                generateOnClick:editExemplarCallback}),
                            TreeView.PopupCol({field:'reflection',label:'Reflection',tagMode:true,snippetMode:true,className:'break-after'}),
                            TreeView.PopupCol({field:'assessment.comment',labelField:'assessment.score',tagMode:true,snippetMode:true,className:'break-after'}),
                            TreeView.BlankCol({className:'break-after'}),
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

          
        </Viewport>
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
                permalink : data.permalink,
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
                                if (data.submission && (exemplar.data.submission == data.submission && exemplar.data != data)
                                    ||
                                    data.permalink && (exemplar.data.permalink == data.permalink && exemplar.data != data)
                                   ) {
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

        function assessmentInfo () {
            var needAssessment = portfolio.filter(
                (exemplar)=>exemplar.revisionCount&&
                    (!exemplar.assessment
                     ||
                     !exemplar.assessment.score
                     ||
                     (getProp(exemplar,'revisionCount')>getProp(exemplar,'assessment.count'))
                    )).length
            var turnedIn = portfolio.filter((exemplar)=>getProp(exemplar,'revisionCount')).length;
            var graded = portfolio.filter(
                (exemplar)=>getProp(exemplar,'assessment.count')&&
                    (!exemplar.revisionCount || exemplar.assessment.count>=exemplar.revisionCount)
            ).length;
            return <span>
                     <a onClick={()=>setFilters({hasWork:true})}>{turnedIn} in</a>,
                     <a onClick={()=>setFilters({needsAssessment:true})}>{needAssessment}
                       {needAssessment==1 && ' needs ' || ' need '}
                       grades</a>,
                     <a onClick={()=>setFilters({isAssessed:true})}>{graded} graded</a>
                   </span>;
        }
        


        function filterView () {
            return <Menu
                     title="Filter"
                     items={filterNames}
                     className={classNames({
                         filter : true,
                         active : Object.values(filters).indexOf(true)>-1,
                     })}
                     renderItem={
                         ([name,prop])=>(
                             <label className={classNames({control:true,active:!!filters[prop]})}>
                               <input type="checkbox"
                                      className='checkbox'
                                      checked={!!filters[prop]}
                                      onChange={(event)=>setFilters({...filters,[prop]:event.target.checked})}
                               />
                               {name}
                             </label>
                         )
                     }
                     />
        // return (<div className="is-grouped field">
        //           {filterNames.map(
        //               ([name,prop])=>(
        //                   <label className='control label'><input type="checkbox"
        //                          className='checkbox'
        //                          checked={!!filters[prop]}
        //                          onChange={(event)=>setFilters({...filters,[prop]:event.target.checked})}
        //                         /> {name}</label>
        //               )
        //           )}
        //         </div>);
    }


    
    }

function StrandExemplarCountCol (props) {
    const {data,children} = props;
    var exemplars = 0;
    var work = 0;
    children.forEach(
        (skill)=>{
            exemplars += skill.data.exemplars.length
            work += skill.children.length;
        }
    );
    return <C {...props}><b>{work||0} of {exemplars||0}</b></C>
}

function StrandPointsTotalCol (props) {
    const {data,children} = props;
    var tot = 0;
    children.forEach(
        (skill)=>{
            skill.data.exemplars.forEach(
                (ex)=>tot+=ex.points
            )
        });
    return <C {...props}><b>{tot}</b></C>
}

function ExemplarCountCol (props) {
    return props.data.exemplars && <C {...props}>{props.children&&props.children.length||0} of {props.data.exemplars.length}</C>
}
function DueDateCol (props) {
    return props.data.exemplars &&
        <C {...props}>
          {props.data.exemplars
           .map(
               (child)=>child.dueDate && child.dueDate.toLocaleDateString([],{day:'numeric',month:'short'})||''
           )
           .filter((item,idx,array)=>array.indexOf(item)===idx) // keep unique
           .map((date)=><span><span>{date.replace(' ','\u00A0')}</span> </span>) // put in a span
          }
        </C>
}

function PointsTotalCol (props) {
    if (props.data.exemplars) {
        var tot = 0;
        props.data.exemplars.forEach((ex)=>tot+=ex.points);
        return <C {...props}>{tot}</C>
    }
    else {
        return <C {...props}>'-'</C>
    }
}

function StatusCol (props) {
    var revCount = props.data.revisionCount || 0;
    var assCount = props.data.assessment && props.data.assessment.count || 0;    
    if (assCount >= revCount) {
        return <C {...props}><Icon icon={Icon.teacher}/><span className='tag'>{assCount}</span></C>
    }
    else if (revCount == 0) {
        return <C {...props}><Icon icon={Icon.bang}/><span className='tag'>Not in</span></C>
    }
    else {
        return <C {...props}><Icon icon={Icon.check}/><span className='tag'>{revCount}</span></C>
    }
}

Portfolio.Bare = PortfolioComponent;
Portfolio.Lazy = LazyPortfolioComponent;
export default Portfolio;

