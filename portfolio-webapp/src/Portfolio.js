import React, {useEffect, useState} from 'react';
import TreeView from './TreeView.js';
import {Container,Button} from './widgets.js';

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
    assessmentComment : `<p>Some lengthy comment about the exemplars.</p>`,
    score : 123, // some score
    skill : 'Eating',
    due : new Date(),
}

function Portfolio (props) {


    return (
        <Container>
            {filters()}
          <TreeView
            data={[
                {data:{strand:'EX'},
                 children : [
                     {data:{strand:'EX',skill:'Eating'},
                      children:[
                          {data:{strand:'EX',skill:'Eating',
                                 classroom:'adsfa90s81234',
                                 points:100,
                                 exemplar:testExemplar,
                                 url:'http://slashdot.org'}},
                          {data:{strand:'EX',skill:'Eating',
                                 classroom:'ddadsfa90s81234',
                                 points:100,
                                 exemplar:testExemplar,
                                 url:'http://slashdot.org'}},
                      ]
                     },
                     {data:{strand:'EX',skill:'Drinking'},
                      children:[
                          {data:{strand:'EX',skill:'Drinking',
                                 points:100,
                                 exemplar:testExemplar,
                                 url:'http://slashdot.org'}},
                          {data:{strand:'EX',skill:'Eating',
                                 points:100,
                                 exemplar:undefined,
                                 url:'http://slashdot.org'}},
                      ]
                     }

                 ]}
            ]}
            onDataChange={()=>{}}
            headers={[
                'Strand','Skill','Points','Exemplar','Assessment'
            ]}
            widths = {[
                'auto','auto','auto','auto','auto'
            ]}
            cols={5}
            getRenderers={(params)=>{
                if (params.level==0) {
                    return [TreeView.HeaderCol('strand',{colSpan:2}),
                            TreeView.SumCol('Points'),
                            TreeView.BlankCol(),
                            TreeView.BlankCol()]
                }
                else if (params.level==1) {
                    return [TreeView.TextCol('strand'),
                            TreeView.TextCol('skill'),
                            TreeView.SumCol('points'),
                            TreeView.BlankCol(),
                            TreeView.BlankCol()]
                }
                else {
                    return [TreeView.TextCol('strand'),
                            TreeView.TextCol('skill'),
                            TreeView.NumCol('points'),
                            TreeView.TextCol('exemplar'),
                            TreeView.TextCol('assessment'),
                           ];
                }
            }}
          />
        </Container>
    )

    function filters () {
        return (<div>Filters will go here</div>);
    }


    
}

export default Portfolio;
