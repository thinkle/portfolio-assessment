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

    // needs props:
    // course =
    // student =

    const {skills, strands, assignments} = usePortfolioSkillHook(props);
    const {busy, portfolio, setPortfolio, savePortfolio, saved} = useStudentPortfolio(props);
    const coursework = useCoursework(props);
    const studentwork = useStudentWork(props);

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
        return tree;
    }

    useEffect(
        ()=>{
            console.log('build data...');
            setTreeData(buildTreeDataStructure())
            setDataCount(dataCount + 1);
        },
        [portfolio, skills, strands, coursework, studentwork]
    );
    const [dataCount,setDataCount] = useState(1);
    const [treeData,setTreeData] = useState([]);
    const [showExemplar,setShowExemplar] = useState(false);
    const [exemplarEditorProps,setExemplarEditorProps] = useState({});

    function saveExemplar (exemplar) {
        var newPortfolio = [...portfolio];
        // deep copy portfolio...
        // and insert exemplar into it...
        if (exemplar.id) {
            replaceItemInArray(newPortfolio,exemplar,'id')
        }
        else {
            newPortfolio.push(exemplar);
        }
        console.log('Built new portfolio structure: ',newPortfolio);
        setPortfolio(newPortfolio);
        buildTreeDataStructure()
        setDataCount(dataCount+1);
        setShowExemplar(false);
    }

    var treeState = TreeView.NapTime(1); // state manager for toggled state of tree

    return (
        <Container>
          <h3>{props.student.profile.name.fullName} Portfolio</h3>
          {busy && <span>Fetching student portfolio data...</span>}
          <b onClick={()=>{setTreeData(buildTreeDataStructure());setDataCount(dataCount+1)}}>REBUILD</b>
          {!saved && <Button icon={Icon.save} onClick={()=>savePortfolio()}>Save Changes to Google</Button>}
          {filters()}
          {true && 
           <TreeView
             getShowChildrenState={treeState.getShowChildrenState}
             onSetShowChildren={treeState.onSetShowChildren}
             noDelete={true}
             key={dataCount}
            data={treeData}
            onDataChange={()=>{console.log('tree data changed');}}
            headers={[
                'Strand','Skill','Points','Exemplar','Assessment'
            ]}
            widths = {[
                '6em','15em','12em','15em','15em'
            ]}
            cols={5}
            getRenderers={(params)=>{
                if (params.level==0) {
                    return [TreeView.HeaderCol('strand',{colSpan:2}),
                            /*TreeView.SumCol('points'),*/
                            TreeView.BlankCol(),
                            TreeView.BlankCol(),
                            TreeView.BlankCol()]
                }
                else if (params.level==1) {
                    return [TreeView.TextCol('strand'),
                            TreeView.TextCol('skill'),
                            PointsTotalCol,
                            ExemplarCountCol,
                            TreeView.ButtonCol({icon:Icon.plus,content:'Add exemplar',generateOnClick:makeExemplarCallback}),
                           ]
                }
                else {
                    return [TreeView.BlankCol(),
                            TreeView.TextCol('coursework.title'),
                            TreeView.LinkCol('permalink',{linkText:'Link to work'}),
                            TreeView.TextCol('assessment.score'),
                            TreeView.ButtonCol({icon:Icon.edit,content:'Edit Exemplar',generateOnClick:editExemplarCallback})
                           ];
                }
            }}
          />}
          <Modal active={showExemplar} onClose={()=>setShowExemplar(false)}>
            <ExemplarEditor
              {...props}
              {...exemplarEditorProps}
              key={getExemplarKey()}
              onChange={(exemplar)=>saveExemplar(exemplar)}
            />
          </Modal>

          
        </Container>
    )
    function getExemplarKey () {
        if (!exemplarEditorProps) {
            return 0
        }
        else {
            const p = exemplarEditorProps
            return `${p.id||''}${p.skill}-${getProp(p,'selectedSubmission.id')}-${getProp(p,'reflection.length')}-${getProp(p,'assessment.comment.length')}-${getProp(p,'assessment.score')}-${getProp(p,'permalink')}`
        }
    }

    function editExemplarCallback ({data, children}) {
        return function () {
            setExemplarEditorProps({
                skill:data.skill,
                id : data.id,
                selectedSubmission : data.submission,
                selectedCoursework : data.coursework,
                reflection : data.reflection,
                assessment : data.assessment,
                permalink : data.permalink
            });
            setShowExemplar(true);
        }
    }

    function makeExemplarCallback ({data, children, rowId}) {
        console.log('Making callback with',data,children,rowId);
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
                skill:data.skill,
            });
            setShowExemplar(true);
        }
        
    }



    function filters () {
        return (<div>Filters will go here</div>);
    }


    
}

function ExemplarCountCol ({data,children}) {
    return data.exemplars && <span>{children&&children.length||0} of {data.exemplars.length}</span>
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


export default Portfolio;
