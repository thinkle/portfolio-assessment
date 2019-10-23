import React,{useState} from 'react';
import ReactDOMServer from 'react-dom/server';
import {useStudentPortfolio,useCoursework,useStudentWork} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';
import {h,Button} from './widgets.js';
import {sanitize} from './utils.js';
import DocWriter from './gapi/docWriter.js';
// Export portfolio as something pretty


function RenderedPortfolio (props) {
    //101 + 236
    //541.5 + 173.2
    const head = {
        fontWeight:900,
        fontFamily: 'Raleway',
    }
    const s = {
        header : {backgroundColor:'#000063',color:'white'},
        s1 : {fontSize:'36pt',...head,color:'#ff9800'},
        s2 : {fontSize:'22pt',...head,color:'#311b92'},
        s3 : {fontSize:'18pt',...head,color:'#6746c3'},
        s4 : {fontSize:'14pt',...head,color:'#c66900'},
        s5 : {fontSize:'11pt',...head,color:'#c66900'},
        s6 : {fontSize:'10pt',...head,color:'#6746c3'},
        oddRow : {backgroundColor: '#eaeaea',color:'black'},
        evenRow : {backgroundColor: '#ffffff',color:'#222'},
        left : {width: '265pt'},
        right : {width: '1451pt'},
        lsmall : {width: '167pt'},
        rsmall : {width: '284pt'},
        extraSpacer : {
            paddingTop : '10pt',
        },
        cell : {
            padding : '10pt',
            border : '1px solid #fcfcfc',
        },
        minimal: {
            border : '0px solid #fff',
            padding : '9pt'
        },
        tableStyle : {
            borderCollapse:  true,
            width: '1715pt',
        },
        baseStyle : {
            fontSize : '10pt',
            fontFamily : 'Cantarell',
        },
    }

    return <div style={s.baseStyle}>
             <table className="export" style={s.tableStyle} >
               {props.strands
                .map((strand)=>
                     <>
                       <tr className="thead" style={{...s.s1,...s.header}}>
                         <th colspan="2" style={s.cell}>
                           {strand}
                         </th>
                       </tr>
                       {props.skills.filter((sk)=>sk.strand==strand).map(
                           (skill,i)=>(
                               <>
                                 <tr style={(i % 2) && s.oddRow || s.evenRow}>
                                   <td style={s.cell} colSpan={2}>
                                     <span style={s.s2}>{skill.skill}</span>
                                   </td>
                                 </tr>
                                 <tr style={(i % 2) && s.oddRow || s.evenRow}>
                                   <td style={{...s.cell,...s.left}}>
                                     <p style={{fontSize:'4pt',...s.extraSpacer}}>&nbsp;</p>
                                     <div dangerouslySetInnerHTML={sanitize(skill.descriptor)}/>
                                   </td>
                                   <td style={{...s.cell,...s.right}}>
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
             </table>
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
                  {props.ex.assessment.score && <h6 style={s.s6}>{props.ex.assessment.score}</h6>}
                  <div dangerouslySetInnerHTML={sanitize(props.ex.assessment.comment)}/>
                </td>
              </tr>
             }
           </table>
}


function PortfolioExporter (props) {


    const [showRendered,setShowRendered] = useState(false)
    const [link,setLink] = useState()


    function doExport () {
        var body = ReactDOMServer.renderToString(<html>
                                                   <head>
                                                     <title>Portfolio</title>
                                                   </head>
                                                   <body
                                                     // 1/2 inch margins
                                                     style={{
                                                         maxWidth:'540pt',
                                                         padding:'36pt 36pt 36pt 36pt',
                                                     }}
                                                   >
                                                     <RenderedPortfolio {...props}/>
                                                   </body>
                                                </html>);
        
        DocWriter.updateFile('1TH8QBKLtjPm9ARizhOF5q17MqweAtDyvO6PtP5yfYWQ',
                             {description:'A smple portfolio',
                              body:body}).then((id)=>setLink(id))
        // DocWriter.createFile({title:'Test Portfolio Export',
         //                       description:'A sample portfolio',
         //                       body:body}).then(
         //                           (id)=>setLink(id)
         //                       );
    }
    
    
    return <div>
             <Button onClick={doExport}>Export!</Button>
             {link && <div>Exported to {JSON.stringify(link)}</div>}
             <h.h3 onClick={()=>setShowRendered(!showRendered)}>Preview</h.h3>
             {showRendered && 
              <RenderedPortfolio {...props}/>
             }
        </div>
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
