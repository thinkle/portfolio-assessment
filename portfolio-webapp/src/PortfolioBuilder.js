import React, {useEffect,useState} from 'react';
import {InputWithEnter} from './widgets.js';
import { inspect } from 'util' // or directly
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExport,faRedo,faSave,faAngleDown,
         faAngleUp,faPenSquare,faWindowClose,
         faCheck,faPlus } from '@fortawesome/free-solid-svg-icons'
import {AnimateOnChange,AnimateGroup,animations} from 'react-animation';
//import Api from './api.js';
import Api from './gapi/gapi.js';
import TreeView from './TreeView.js';
import {classNames} from './utils.js';
import Shortener from './shortener.js';
import {Modal,Button,Icon} from './widgets.js';

var BE_FUSSY = false;

var FA = FontAwesomeIcon

const DESCRIPTOR_TEMPLATE = `
<ul>
  <li>Add descriptors here.</li>
  <li>You can copy paste rich text too :)</li>
</ul>
`

function PortfolioModel (course) {

    function sanitizeKey (k) {
        k = k.replace('%','Perc'); // remove problem characters from keys...
        return k
    }

    var metadata = {
        sheetid : '1eQ06dgoeRDNdV8Zn7d2BaD0Pj1IbUPxX_FfBSbYqmwQ', // hardcoded for now :)
    };
    var metadata = {
        courseId : course.id
    }

    function propagateChanges (treeData) {
        treeData.forEach(
            (strand)=>{
                if (!strand.children) {
                    console.log(`Strange: ${strand.data.strand} has no children?`,strand);
                    return
                }
                strand.children.forEach(
                    (skill)=>{
                        if (!skill.children) {
                            console.log(`Strange: ${skill.data.skill} has no children?`,skill);
                            return
                        }

                        skill.children.forEach(
                            (exemplar)=>{
                                exemplar.data.skill = skill.data.skill;
                                exemplar.data.strand = strand.data.strand;
                            }
                        )
                    }
                );
            }
        );
    }

    function fromFlatList (fl, descriptors=[]) {       
        var id = 0;
        
        function nextId () {
            id += 1;
            return id;
        }
        

        // Get descriptors ready as a dictonary...
        var descriptorMap = {}
        descriptors.forEach(
            (row)=>{
                descriptorMap[row.item] = row.descriptor;
            }
        );

        var strands = {}
        var byStrandBySkill = {}
        fl.forEach( (item) => {
            var itemObj = {data:item, id:id}
            id+=1;
            // Add top level strand
            if (!strands[item.strand]) {
                //console.log('First item of strand %s',item.strand);
                strands[item.strand] = {
                    data :{strand:item.strand},
                    children : [],
                    id : nextId(),
                }
                byStrandBySkill[item.strand] = {
                }
            }
            // Add skill to strand if there are none
            if (!byStrandBySkill[item.strand][item.skill]) {
                byStrandBySkill[item.strand][item.skill] = {
                    data : {strand:item.strand,skill:item.skill||`${item.strand} skill`,
                            descriptor:descriptorMap[item.skill]||DESCRIPTOR_TEMPLATE},
                    children : [],
                    id : nextId(),
                }
                strands[item.strand].children.push(byStrandBySkill[item.strand][item.skill]);
            }
            byStrandBySkill[item.strand][item.skill].children.push(itemObj);
        });

        strands = Object.values(strands);

        // Now let's go through and add some handy metadata...
        strands.forEach(
            (strandObj) => {
                strandObj.data.nchildren = strandObj.children.length;
                strandObj.children.forEach((skillObj)=>{
                    skillObj.data.nchildren = skillObj.children.length;
                })

            }
        );
        return strands
    }

    function toFlatList (byStrand) {
        var leafs = []
        var descriptors = []
        var skills = [];
        // We basically just keep the leafs...

        var antiDupShortener = Shortener({maxLength:100000}); // enforce unique skill names

        byStrand.forEach(
            (strand)=>{
                strand.children && strand.children.forEach(
                    (skill)=>{
                        var theSkill = antiDupShortener.shorten(skill.data.skill||'');
                        if (theSkill != skill.data.skill) {
                            console.log('Modified DUPLICATE SKILL %s => %s',skill.data.skill,theSkill);
                            skill.data.skill = theSkill;
                        }
                        skill.children && skill.children.forEach(
                            (exemplar)=>{
                                exemplar.data = {...exemplar.data, skill:theSkill}
                                leafs.push(exemplar.data);
                            })
                        if (skill.data.descriptor && skill.data.descriptor!==DESCRIPTOR_TEMPLATE) {
                            descriptors.push(
                                {item:theSkill,
                                 descriptor:skill.data.descriptor}
                            )
                        }
                    })
            });
        return {
            skills : leafs,
            descriptors : descriptors
        }
    }

    function toAspen (skillsList, params) {
        
        var gbShortener = Shortener({maxLength:10})
        var assignmentShortener = Shortener({maxLength:50})

        const mapper = {
            'GB column name':(row)=>gbShortener.shorten(row.skill),
            'Assignment name':(row)=>assignmentShortener.shorten(row.skill),
            'Category':(row)=>row.strand,
            'Date assigned':(row)=>row.assignedDate,
            'Date due':(row)=>row.dueDate,
            'Total points':(row)=>row.points,
            'Extra credit points':(row)=>params.extraCredit||0,
            'Grade Scale':(row)=>params.gradingScale||'Current High School Grading Scale',
            'Grade Term':(row)=>params.semester||'S1',
        };
        var aspenList = skillsList.map(
            (row)=>{
                const newRow = {}
                for (var col in mapper) {
                    const converter = mapper[col];
                    newRow[col] = converter(row);
                }
                return newRow;
            });

        return new Promise((resolve,reject)=>{
            Api.set_aspen_assignments(aspenList,course)
                .then(()=>{
                    Api.get_aspen_assignments_url(course)
                        .then((url)=>resolve(url))
                })
                .catch((err)=>reject(err));
        });
    }
        
    function toGoogle (skillsList,descriptors) {
        console.log('Pushing %s skills to google...',skillsList.length);
        skillsList = skillsList.slice()
        skillsList.forEach((i)=>{
            delete i.children; // don't need nested
            delete i.data; // nested...
        });
        return Api.set_portfolio_desc({skills:skillsList,
                                       descriptors:descriptors},course)
    }

    function fromGoogle () {
        return Api.get_portfolio_desc(course)
    }

    function getSheet () {
        return Api.get_sheet_url(course);
    }

    return {fromFlatList,toFlatList,toGoogle,fromGoogle,propagateChanges,metadata,getSheet,toAspen}
    
}



function PortfolioBuilder (props) {
    var pm = PortfolioModel(props.course);

    const [skills,setSkills] = useState(
        [
        ]
    );
    const [descriptors,setDescriptors] = useState(
        [
        ]
    )
    const [latestDataCount,setLatestDataCount] = useState(1);
    const [treeData,setTreeData] = useState(pm.fromFlatList(skills,descriptors));
    
    const [errorState,setErrorState] = useState(false);
    const [busyState,setBusyState] = useState(false);
    const [sheetUrl,setSheetUrl] = useState(false);

    const [exportUrl,setExportUrl] = useState();
    const [showExportForm,setShowExportForm] = useState(false);

    useEffect(pullPortfolioFromGoogle,[])

    useEffect(()=>{
        console.log('Grabbing sheet from google...');
        pm.getSheet()
            .then(setSheetUrl)
            .catch((err)=>{setErrorState(err);
                           if (BE_FUSSY) throw err});
    },[]);

    useEffect(
        ()=>{
            console.log('skll or descriptor changed! just once!');
            setTreeData(pm.fromFlatList(
                skills,
                descriptors
            ));            
        },[skills, descriptors]);

    function pullPortfolioFromGoogle () {
        setBusyState('Pulling data from google...');
        setErrorState(false)
        pm.fromGoogle()
            .then((portfolioData)=>{
                console.log('Got data:',portfolioData);
                if (portfolioData) {
                    setSkills(portfolioData.skills);
                    setDescriptors(portfolioData.descriptors);
                    setLatestDataCount(latestDataCount+1);
                }
                setBusyState(false);
            })
            .catch((err)=>{
                setBusyState(false);setErrorState(err);
                if (BE_FUSSY) throw err;
            });
    }        

    function saveTree (newTreeData) {
        var portfolio = pm.toFlatList(newTreeData);
        setSkills(portfolio.skills);
        setDescriptors(portfolio.descriptors);
    }


    function getNewRowData ({nlevel,parent}) {
        const labelsByLevel = {
            0 : 'New Strand',
            1 : 'New Skill',
            2 : 'New Exemplar',
        }
        return {
            label : labelsByLevel[nlevel],
            data : getNewRowDataData({nlevel,parent})
        }
    }

    function getNewRowDataData ({nlevel,parent}) {
        const rowData = {
            data:{
                strand : 'New Strand',
            },
            children : []
        }
        
        if (nlevel==0) {
            rowData.children.push(
                getNewRowDataData({nlevel:nlevel+1,parent:rowData.data})
            );
            return rowData;
        }
        // Otherwise strand is populated
        rowData.data.strand = parent.strand;
        if (nlevel==1) {
            rowData.data.skill = "New Skill";
            rowData.data.descriptor = "<ul><li>New Skill description...</li></ul>";
            rowData.children.push(
                getNewRowData({nlevel:nlevel+1,parent:rowData.data})
            )
            return rowData;
        }
        if (nlevel==2) {
            rowData.data.skill = parent.skill;
            rowData.data.points = 100;
            rowData.data.dueDate = new Date();
            return rowData;
        }
        else {
            return {
                data : {
                    strand : 'WTF',
                    skill : '?',
                }
            }
        }
    }

    return (
        <div className="container">
          <h4 className="title">{props.course.name} Portfolio Builder</h4>
          <nav className="navbar">
            {sheetUrl && <a className="navbar-item" target="_BLANK" href={sheetUrl}>Edit as Spreadsheet</a>}
            <div className='navbar-item'>
              <button className='button is-danger' onClick={pullPortfolioFromGoogle}>
                <span className="icon"><FA icon={faRedo}/></span>
                <span>Reload from Google (wipe out changes)</span>
              </button>
            </div>

            <div className='navbar-item'>
              <button className='button is-secondary' onClick={()=>setShowExportForm(true)}>
                <span className="icon"><FA icon={faFileExport}/></span>
                <span>Export Assignments to Aspen</span>
              </button>
            </div>

            <div className="navbar-item navbar-end">
              <Button icon={Icon.save} className="is-primary button" onClick={()=>{
                  setBusyState('Pushing portfolio to google sheet...');
                  setErrorState(false)
                  pm.toGoogle(skills,descriptors)
                      .then((result)=>{
                          setBusyState(false);
                          console.log('Successful push to google: %s',result);
                          console.log(JSON.stringify(result))
                      })
                      .catch((err)=>{setBusyState(false);setErrorState(err)});
              }}>
                Save to Google
              </Button>
            </div>
          </nav>
          <hr/>
          <TreeView
            data={treeData}
            onDataChange={saveTree}
            headers={['Skill','Strand','Assigned','Due','Points','Description']}
            widths={
                [
                    '250px','80px','160px','160px','100px','200px'
                ]
            }
            onChangeHook={TreeView.CascadeHook(['skill','strand'])}
            getNewRowData={getNewRowData}
            maxNesting={2}
            cols={5}
            key={latestDataCount}
            getRenderers={
            (params)=>{
                if (params.level==0) {
                    return [TreeView.HeaderCol('strand',{colSpan:4,editable:true}),
                            TreeView.SumCol('points'),
                            TreeView.BlankCol()];
                }
                if (params.level==1) {
                    return [TreeView.TextCol('skill',{editable:true}),
                            TreeView.TagCol('strand'),
                            TreeView.BlankCol(),
                            TreeView.BlankCol(),
                            TreeView.SumCol('points'),
                            TreeView.RichTextCol(
                                'descriptor',
                                {makeHeader : (data) => `${data.skill} (${data.strand}) Description`}
                            )
                           ]
                }
                if (params.level==2) {
                    return [TreeView.TextCol('skill'),
                            TreeView.TagCol('strand'),
                            TreeView.DateCol('assignedDate',{editable:true}),
                            TreeView.DateCol('dueDate',{editable:true}),
                            TreeView.NumCol('points',{editable:true}),
                            TreeView.BlankCol()
                           ]
                }
            }
        }
          />
          <div className="section">
            {busyState && (<progress className="progress is-medium is-primary" max="100">Busy... {busyState}</progress>)}
            {errorState && (<b>ERROR: {inspect(errorState)}</b>)}
          </div>
        {
         (<Modal 
            active={showExportForm}
            onClose={()=>setShowExportForm(false)}
            title="Export to Aspen"
          >
            <div>
          {exportUrl
           && (<p><a href={exportUrl} target='_BLANK'>Jump to spreadsheet</a></p>)
           ||
              <AspenProps 
                onExport={(params)=>{
                    console.log('Got Aspen params: %s',JSON.stringify(params));
                    setBusyState(true)
                    setErrorState(false)
                    pm.toAspen(skills,params)
                        .then((url)=>{
                            setExportUrl(url);
                            setBusyState(false);
                            setErrorState(false);
                        })
                        .catch((err)=>{
                            setErrorState(err);
                        });
                }}
           />}
            {busyState && (<progress className="progress is-medium is-primary" max="100">Busy... {busyState}</progress>)}
            {errorState && (<b>ERROR: {inspect(errorState)}</b>)}
            </div>
            <div>
              {exportUrl &&
               <button className="button" onClick={()=>setExportUrl(undefined)}>Redo export?</button>
               }
            </div>
          </Modal>
         )}
      </div>
    )
}
function AspenProps (props) {

    const refs = {}

    function onExport (event) {
        //console.log('Export: check out refs: %s',inspect(refs));
        var params = {}
        for (var param in refs) {
            if (refs[param].type=='number') {
                params[param] = Number(refs[param].value)
            }
            else {
                params[param] = refs[param].value
            }
        }
        props.onExport(params);
        event.preventDefault();
    }
    
    return (
      <form onSubmit={onExport}>
        <label>Semester <input defaultValue="S1" className="input" ref={(n)=>refs['semester']=n}/></label>
        <label>Extra Credit Points <input defaultValue={0} type="number" className="input" ref={(n)=>refs['extraCredit']=n}/></label>
        <label>Grading Scale <input defaultValue="High School Grading Scale" type="text" className="input" ref={(n)=>refs['gradingScale']=n}/></label>
        <input type="submit" value={props.submitButtonText||"Push Aspen Headers to Spreadsheet"} className="button space-top is-primary"/>
      </form>
    );
    
}

export default PortfolioBuilder;
