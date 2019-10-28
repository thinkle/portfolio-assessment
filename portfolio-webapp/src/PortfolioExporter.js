import React,{useState} from 'react';
import ReactDOMServer from 'react-dom/server';
import {useStudentPortfolio,useCoursework,useStudentWork} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';
import {h,Button,Buttons,Modal,Icon,ProgressOverlay} from './widgets.js';
import {sanitize} from './utils.js';
import DocExporter from './DocExporter.js'
import Brand from './brand.js'


import GD from './GoogleDoc.js';
// Export portfolio as something pretty

function RenderedPortfolio (props) {
    const head = {
        fontFamily: 'Raleway',
    }
    
    const TWIDTH = 468
    const pad = '10pt'
    const borderColor = '#e09f3e'
    
    const s = {
        header : {backgroundColor:'#002290',color:'#fff3b0'},
        s1 : {fontSize:'36pt',...head,color:'#6e0e0a'},
        s2 : {fontSize:'22pt',...head,color:'#335c67'},
        s3 : {fontSize:'18pt',...head,color:'#335c67'},
        s4 : {fontSize:'14pt',...head,color:'#335c67'},
        s5 : {fontSize:'11pt',...head,color:'#335c67'},
        s6 : {fontSize:'10pt',...head,color:'#335c67'},
        oddRow : {backgroundColor: '#fff8d1',color:'#222'},
        evenRow : {backgroundColor: '#fff8d1',color:'#222'},
        grade : {color: '#6e0e0a'},
        // Note: google tables are a maximum of 468pt (6.5") wide on import
        // seems to be an insurpassable barrier in their import for unexplained reasons
        left : {width: `${TWIDTH * 0.37}pt`},
        right : {width: `${TWIDTH * 0.63}pt`},
        lsmall : {width: `${TWIDTH * 0.63 * 0.37}pt`},
        rsmall : {width: `${TWIDTH * 0.63 * 0.63}pt`},
        small : {fontSize: '8pt', color: '#3F717F'},
        extraSpacerTop : {
            // google docs requires a paragraph before a table -- this
            // spacer makes the paragraph line up with the table
            paddingTop : pad, 
        },
        extraSpacerSides : {
            marginLeft : pad,
            marginRight: pad
        },
        cell : {
            padding : pad,
            //border : `1px solid ${borderColor}`,
        },
        bbottom : {
            borderBottom : `1px solid ${borderColor}`
        },
        bleft : {
            borderLeft : `1px solid ${borderColor}`
        },
        bright : {
            borderRight : `1px solid ${borderColor}`
        },
        cellTight : {
            //border: `1px solid ${borderColor}`
        },
        minimal: {
            border : '0px solid #fff',
            padding : '9pt'
        },
        tableStyle : {
            borderCollapse:  true,
            //width: '540pt',
        },
        baseStyle : {
            fontSize : '10pt',
            fontFamily : 'Basic',
            color: '#101d21'
        },
    }

    return <div style={s.baseStyle}>
             <GD.s3.div>{props.student.profile.name.fullName}</GD.s3.div>
             <GD.s2.div>{props.course.name} Portfolio</GD.s2.div>
             <GD.s4.div>as of {new Date().toLocaleDateString()}</GD.s4.div>
             <GD.small.div>
               This portfolio was created with the <a href={Brand.url}>{Brand.name}</a>. To update reflections and assessments, please use the tool.
               This document may be overwritten by future exports.
             </GD.small.div>
             <GD.tbl>
               <tbody>
               {props.strands
                .map((strand)=>
                     <>
                       <GD.theader>
                         <GD.cell colSpan="2">
                           {strand}
                         </GD.cell>
                       </GD.theader>
                       {props.skills.filter((sk)=>sk.strand==strand).map(
                           (skill,i)=>(
                               <>
                                 <tr style={(i % 2) && s.oddRow || s.evenRow}>
                                   <td style={{...s.cellTight,...s.bleft,...s.bright}} colSpan={2}>
                                     <p style={s.extraSpacerSides}><span style={s.s2}>{skill.skill}</span></p>
                                   </td>
                                 </tr>
                                 <tr>
                                   <td style={{...s.cell,...s.left,...s.bleft,...s.bbottom}}>
                                     <p style={{fontSize:'4pt',...s.extraSpacer}}>&nbsp;</p>
                                     <div dangerouslySetInnerHTML={sanitize(skill.descriptor)}/>
                                   </td>
                                   <td style={{...s.cell,...s.right,...s.bright,...s.bbottom}}>
                                     <p style={{fontSize:'4pt'}}>&nbsp;</p>
                                     {props.portfolio
                                         .filter((ex)=>ex.skill==skill.skill).length > 0 && 
                                      <>{props.portfolio
                                         .filter((ex)=>ex.skill==skill.skill)
                                         .map(
                                             (ex,i)=>
                                                 <Exemplar count={i+1} s={s} coursework={props.coursework} ex={ex}/>
                                         )}</>}
                                   </td>
                               </tr>
                               </>
                             )
                       )}
                     </>
                    )}
               </tbody>
             </GD.tbl>
           </div>

}

function Exemplar (props) {
    const s = props.s
    const courseworkItems = props.coursework.filter((cw)=>cw.id==props.ex.courseworkId);
    var coursework;
    if (courseworkItems) {
        coursework = courseworkItems[0];
    }
    if (courseworkItems.length > 1) {
        throw 'more than 1 courseworkItems???'
    }
    var title = 'Exemplar'
    
    if (coursework) {
        title = coursework.title;
    }

    return <table>
             <tr>
               <td style={{...s.minimal,...s.lsmall}}><h5 style={s.s5}>Exemplar {props.count}</h5></td>
               <td style={{...s.minimal,...s.rsmall}}><h5 style={s.s5}>{title} {props.ex.permalink && <a href={props.ex.permalink}>(Link)</a>}</h5></td>
             </tr>
             {props.ex.reflection && 
              <tr>
                <td style={{...s.minimal,...s.s6,...s.lsmall}}>Reflection</td>
                <td style={{...s.minimal,...s.rsmall}} dangerouslySetInnerHTML={sanitize(props.ex.reflection)}/>
              </tr>
             }
             {props.ex.assessment &&
              <tr>
                <td style={{...s.minimal,...s.s6,...s.lsmall}}>Assessment</td>
                <td style={{...s.minimal,...s.rsmall}}>
                  {props.ex.assessment.score && <h6 style={{...s.s6,...s.grade}}>{props.ex.assessment.score}</h6>}
                  <div dangerouslySetInnerHTML={sanitize(props.ex.assessment.comment)}/>
                </td>
              </tr>
             }
           </table>
}

function PortfolioExporter (props) {
    return <DocExporter
             {...props}
             docTitle='Portfolio'
             docProp='full-portfolio-export'
             docDescription='Assessment Portfoio'
             exportText='Export Portfolio to Google Docs'
           >
             <RenderedPortfolio {...props}/>
           </DocExporter>
}

function StandalonePortfolioExporter (props) {
    const skillHookProps = usePortfolioSkillHook(props);
    console.log('Use with props',props);
    const studentPortfolioProps = useStudentPortfolio(props);
    const coursework = useCoursework(props);
    const studentwork = useStudentWork(props);
    return <PortfolioExporter
             key={skillHookProps.key}
             {...props}
             {...skillHookProps}
             {...studentPortfolioProps}
             coursework={coursework}
             studentwork={studentwork}
           />
}


PortfolioExporter.Standalone = StandalonePortfolioExporter
export default PortfolioExporter;
