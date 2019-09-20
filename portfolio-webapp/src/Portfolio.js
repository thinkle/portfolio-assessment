import React, {useEffect, useState} from 'react';
import TreeView from './TreeView.js';
import {Container,Button,Icon} from './widgets.js';
import {useStudentPortfolio} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';

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
                        )
                    })
                )
            });
        });
        return tree;
    }



    useEffect(
        ()=>{
            console.log('build data...');
            setTreeData(buildTreeDataStructure())
            setDataCount(dataCount + 1);
        },
        [portfolio, skills, strands]
    );
    const [dataCount,setDataCount] = useState(1);
    const [treeData,setTreeData] = useState([]);

    return (
        <Container>
          <h3>{props.student.profile.name.fullName} Portfolio</h3>
          {filters()}
          {true && 
          <TreeView
            noDelete={true}
            key={dataCount}
            data={treeData}
            /* data={[ */
            /*     {data:{strand:'EX'}, */
            /*      children : [ */
            /*          {data:{strand:'EX',skill:'Eating'}, */
            /*           children:[ */
            /*               {data:{strand:'EX',skill:'Eating', */
            /*                      classroom:'adsfa90s81234', */
            /*                      points:100, */
            /*                      exemplar:testExemplar, */
            /*                      url:'http://slashdot.org'}}, */
            /*               {data:{strand:'EX',skill:'Eating', */
            /*                      classroom:'ddadsfa90s81234', */
            /*                      points:100, */
            /*                      exemplar:testExemplar, */
            /*                      url:'http://slashdot.org'}}, */
            /*           ] */
            /*          }, */
            /*          {data:{strand:'EX',skill:'Drinking'}, */
            /*           children:[ */
            /*               {data:{strand:'EX',skill:'Drinking', */
            /*                      points:100, */
            /*                      exemplar:testExemplar, */
            /*                      url:'http://slashdot.org'}}, */
            /*               {data:{strand:'EX',skill:'Eating', */
            /*                      points:100, */
            /*                      exemplar:undefined, */
            /*                      url:'http://slashdot.org'}}, */
            /*           ] */
            /*          } */

            /*      ]} */
            /* ]} */
            onDataChange={()=>{console.log('tree data changed');}}
            headers={[
                'Strand','Skill','Points','Exemplar','Assessment'
            ]}
            widths = {[
                '3em','15em','12em','15em','15em'
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
                    return [TreeView.TextCol('strand'),
                            TreeView.TextCol('skill'),
                            TreeView.NumCol('points'),
                            TreeView.TextCol('exemplar'),
                            TreeView.TextCol('assessment'),
                            TreeView.ButtonCol({content:'See exemplar'}),
                           ];
                }
            }}
          />}
        </Container>
    )


    function makeExemplarCallback ({data, children}) {
        console.log('makeExemplarCallback...');
        return function () {
            console.log('We got a click!');
            console.log('Make a new exemplar!');
            console.log('Course: ',props.course)
            console.log('Student: ',props.student)
            console.log('Skill:',data.skill);
            console.log('Strand:',data.strand);
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
