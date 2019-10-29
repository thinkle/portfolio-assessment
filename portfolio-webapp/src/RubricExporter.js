import React,{useState} from 'react';
import ReactDOMServer from 'react-dom/server';
import {useStudentPortfolio,useCoursework,useStudentWork} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';
import {h,Button,Buttons,Modal,Icon,ProgressOverlay} from './widgets.js';
import {sanitize,getItemById,getProp} from './utils.js';
import DocExporter from './DocExporter.js';
import Brand from './brand.js'

import G from './GoogleDoc.js';

function RenderedRubric (props) {
    const cw = props.selectedCoursework
    const skills = props.selectedSkills;
    const allSkills = props.skills;

    function getSkillBox (skill) {
        const skillInfo = getItemById(allSkills,skill,'skill');
        if (!skillInfo) {
            return
        }
        return <div>
                 <G.s2>{skill} <G.small.span>{skillInfo.strand}</G.small.span></G.s2>
                 <div dangerouslySetInnerHTML={sanitize(skillInfo.descriptor)}/>
               </div>
    }
    
    return <G.baseStyle>
             <G.tbl>
               <tbody>
               <tr>
                 <G.cell colSpan={2}>
                   <G.s3>{getProp(props.student,'profile.name.fullName')}, {getProp(props.course,'name')}</G.s3>
                   <G.s1>{cw.title} Rubric</G.s1>
                   {props.permalink && <a href={props.permalink}>Link to Work</a>}
                 </G.cell>
               </tr>
                 {skills.map(
                     (skill)=>(
                         <tr>
                           <G.cellLeft>
                             {getSkillBox(skill.skill)}
                           </G.cellLeft>
                           <G.cellRight>
                             <G.s4>Reflection</G.s4>
                             <div dangerouslySetInnerHTML={sanitize(skill.reflection||'-')}/>
                             {skill.assessment &&
                              (<>
                                 <G.s4>Assessment</G.s4>
                                 <G.s5>Score {skill.assessment.score || 'Ungraded'}</G.s5>
                                 <G.s5>Comment</G.s5>
                                 <div dangerouslySetInnerHTML={sanitize(skill.assessment.comment||'-')}/>
                               </>)}
                           </G.cellRight>
                         </tr>
                     )
                 )}
               </tbody>
             </G.tbl>
           </G.baseStyle>
}

function RubricExporter (props) {
    return <DocExporter
             {...props}
             docTitle={`${getProp(props.student,'profile.name.fullName')} ${props.selectedCoursework.title} Rubric`}
             docProp={`rubric-${props.selectedCoursework.id}`}
             docDescription='Rubric'
             exportText='Save Rubric as Google Doc'
           >
             <RenderedRubric {...props}/>
           </DocExporter>
}

export default RubricExporter;
