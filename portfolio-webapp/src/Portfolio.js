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

function ExemplarSelector () {
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
                                 exemplar:'name-o-exemplar',
                                 url:'http://slashdot.org'}},
                          {data:{strand:'EX',skill:'Eating',
                                 classroom:'ddadsfa90s81234',
                                 exemplar:'name-o-exemplar-2',
                                 url:'http://slashdot.org'}},
                      ]
                     },
                     {data:{strand:'EX',skill:'Drinking'},
                      children:[
                          {data:{strand:'EX',skill:'Drinking',
                                 classroom:'adsfa90s81234',
                                 exemplar:'drink-exemplar',
                                 url:'http://slashdot.org'}},
                          {data:{strand:'EX',skill:'Eating',
                                 classroom:'ddadsfa90s81234',
                                 exemplar:'drink-exemplar-2',
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
