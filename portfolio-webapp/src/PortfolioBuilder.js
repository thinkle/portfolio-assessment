import React, {useEffect,useState} from 'react';
import {InputWithEnter} from './widgets.js';
import { inspect } from 'util' // or directly
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRedo,faSave,faAngleDown,faAngleUp,faPenSquare,faWindowClose,faCheck, faPlus } from '@fortawesome/free-solid-svg-icons'
import {AnimateOnChange,AnimateGroup,animations} from 'react-animation';
import Api from './api.js';
import TreeView from './TreeView.js';
import {classNames} from './utils.js';

var FA = FontAwesomeIcon

const DESCRIPTOR_TEMPLATE = `
<ul>
  <li>Add descriptors here.</li>
  <li>You can copy paste rich text too :)</li>
</ul>
`

function PortfolioModel (courseId) {

    function sanitizeKey (k) {
        k = k.replace('%','Perc'); // remove problem characters from keys...
        return k
    }

    var metadata = {
        sheetid : '1eQ06dgoeRDNdV8Zn7d2BaD0Pj1IbUPxX_FfBSbYqmwQ', // hardcoded for now :)
    };
    var metadata = {
        courseId : courseId
    }

    function propagateChanges (treeData) {
        treeData.forEach(
            (strand)=>{
                if (!strand.children) {
                    console.log(`Strange: ${strand.data.strand} has no children? ${JSON.stringify(strand)}`);
                    return
                }
                strand.children.forEach(
                    (skill)=>{
                        if (!skill.children) {
                            console.log(`Strange: ${skill.data.skill} has no children? ${JSON.stringify(skill)}`);
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
        console.log(`Got descriptorMap ${inspect(descriptorMap)}`);

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
        //console.log('Got %s strands: %s',strands.length,JSON.stringify(strands));

        // Now let's go through and add some handy metadata...
        strands.forEach(
            (strandObj) => {
                strandObj.data.nchildren = strandObj.children.length;
                strandObj.children.forEach((skillObj)=>{
                    skillObj.data.nchildren = skillObj.children.length;
                })

            }
        );
        //console.log('Built %s',JSON.stringify(strands));
        return strands
    }

    function toFlatList (byStrand) {
        var leafs = []
        var descriptors = []
        // We basically just keep the leafs...
        byStrand.forEach(
            (strand)=>{
                strand.children && strand.children.forEach(
                    (skill)=>{
                        skill.children && skill.children.forEach(
                            (exemplar)=>{
                                leafs.push(exemplar.data);
                            })
                        if (skill.data.descriptor && skill.data.descriptor!==DESCRIPTOR_TEMPLATE) {
                            descriptors.push(
                                {item:skill.data.skill,
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

    function toGoogle (skillsList,descriptors) {
        console.log('Pushing %s skills to google...',skillsList.length);
        return new Promise((resolve,reject)=>{
            var doneCount = 0;
            Api.pushArrayInPieces(
                'set_skills_list',
                'append_to_skills_list',
                skillsList,
                metadata.courseId)
                .then(()=>{
                    console.log('Skils list done...');
                    doneCount += 1;
                    if (doneCount == 2) {

                        resolve()
                    }
                    else {
                        console.log('... waiting on descriptors');
                    }
                })
                .catch((err)=>reject(err));
            
        Api.pushArrayInPieces(
            'set_descriptors',
            'append_to_descriptors',
            descriptors,
            metadata.courseId,
        )
                .then(()=>{
                    console.log('Descriptors list done...');
                    doneCount += 1;
                    if (doneCount == 2) {
                        
                        resolve()
                    }
                    else {
                        console.log('... waiting on skills');
                    }
                })
                .catch((err)=>reject(err));

            return; // BELOW NOT IN USE NOW -- template for pushArrayInPieces...
        }
                      );
    }

    function fromGoogle () {
        return Api.runFunction('get_portfolio_desc',metadata.courseId)
    }

    function getSheet () {
        return Api.runFunction('get_sheet_url',metadata.courseId);
    }

    return {fromFlatList,toFlatList,toGoogle,fromGoogle,propagateChanges,metadata,getSheet}
    
}



function PortfolioBuilder (props) {
    var pm = PortfolioModel(props.courseId);

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

    useEffect(pullPortfolioFromGoogle,[])

    useEffect(()=>{
        console.log('Grabbing sheet from google...');
        pm.getSheet()
            .then(setSheetUrl)
            .catch((err)=>setErrorState);
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
        pm.fromGoogle()
        .then((portfolioData)=>{
            setSkills(portfolioData.skills);
            setDescriptors(portfolioData.descriptors);
            setLatestDataCount(latestDataCount+1);
            setBusyState(false);
        })
            .catch((err)=>{
                setBusyState(false);setErrorState(err)
            });
    }        

    function saveTree (newTreeData) {
        var portfolio = pm.toFlatList(newTreeData);
        console.log('Set skills!');
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
            console.log(`getNewRowData(${nlevel},${parent})=>${JSON.stringify(rowData)}`)
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
            console.log(`getNewRowData(${nlevel},${parent})=>${inspect(rowData)}`)
            return rowData;
        }
        if (nlevel==2) {
            rowData.data.skill = parent.skill;
            rowData.data.points = 100;
            rowData.data.dueDate = new Date();
            console.log(`getNewRowData(${nlevel},${parent})=>${inspect(rowData)}`)
            return rowData;
        }
        else {
            console.log('Unknown nlevel %s',nlevel);
            console.log(`getNewRowData(${nlevel},${parent})=>${inspect(rowData)}`)
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
          <h4 className="title">Skills List ({skills.length})</h4>
          <div className="section">
            {busyState && (<progress className="progress is-medium is-primary" max="100">Busy... {busyState}</progress>)}
            {errorState && (<b>ERROR: {inspect(errorState)}</b>)}
          </div>
          <nav className="navbar">
            {sheetUrl && <a className="navbar-item" target="_BLANK" href={sheetUrl}>Edit as Spreadsheet</a>}
            <div className='navbar-item'>
              <button className='button is-danger' onClick={pullPortfolioFromGoogle}>
                <span className="icon"><FA icon={faRedo}/></span>
                <span>Reload from Google (wipe out changes)</span>
              </button>
            </div>
            <div className="navbar-item navbar-end">
              <button className="is-primary button" onClick={()=>{
                  setBusyState('Pushing portfolio to google sheet...');
                  pm.toGoogle(skills,descriptors)
                      .then(()=>setBusyState(false))
                      .catch((err)=>{setBusyState(false);setErrorState(err)});
              }}>
                <span className="icon"><FA icon={faSave}/></span>
                <span>Save to Google</span>
              </button>
            </div>
          </nav>
          <hr/>
          <TreeView
            data={treeData}
            onDataChange={saveTree}
            headers={['Skill','Strand','Due','Points']}
            onChangeHook={TreeView.CascadeHook(['skill','strand'])}
            getNewRowData={getNewRowData}
            maxNesting={2}
            cols={5}
            key={latestDataCount}
            getRenderers={
            (params)=>{
                if (params.level==0) {
                    return [TreeView.HeaderCol('strand',{colSpan:3,editable:true}),
                            TreeView.SumCol('points'),
                            TreeView.BlankCol()];
                }
                if (params.level==1) {
                    return [TreeView.TextCol('skill',{editable:true}),
                            TreeView.TagCol('strand'),
                            TreeView.BlankCol(),
                            TreeView.SumCol('points'),
                            TreeView.RichTextCol('descriptor'),
                           ]
                }
                if (params.level==2) {
                    return [TreeView.TextCol('skill'),
                            TreeView.TagCol('strand'),
                            TreeView.DateCol('dueDate',{editable:true}),
                            TreeView.NumCol('points',{editable:true}),
                            TreeView.BlankCol()
                           ]
                }
            }
        }
          />
          <hr/>
          
        </div>
    )
}

export default PortfolioBuilder;
