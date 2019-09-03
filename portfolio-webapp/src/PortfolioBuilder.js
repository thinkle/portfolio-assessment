import React, {useEffect,useState} from 'react';
import {InputWithEnter} from './widgets.js';
import { inspect } from 'util' // or directly
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown,faAngleUp,faPenSquare,faWindowClose,faCheck, faPlus } from '@fortawesome/free-solid-svg-icons'
import {AnimateOnChange,AnimateGroup,animations} from 'react-animation';
import Api from './api.js';
import TreeView from './TreeView.js';
import {classNames} from './utils.js';

function PortfolioModel () {

    function sanitizeKey (k) {
        k = k.replace('%','Perc'); // remove problem characters from keys...
        return k
    }

    var metadata = {
        sheetid : '1eQ06dgoeRDNdV8Zn7d2BaD0Pj1IbUPxX_FfBSbYqmwQ', // hardcoded for now :)
    };

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

    function fromFlatList (fl) {
        var id = 0;
        
        function nextId () {
            id += 1;
            return id;
        }
        
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
                            descriptor:'<ul><li>This is </li><li>a test</li>'},
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
        // We basically just keep the leafs...
        byStrand.forEach(
            (strand)=>{
                strand.children.forEach(
                    (skill)=>{
                        skill.children.forEach(
                            (exemplar)=>{
                                leafs.push(exemplar.data);
                            })
                    })
            });
        return leafs;
    }

    function toGoogle (skillsList) {
        console.log('Pushing %s skills to google...',skillsList.length);
        const MAXROWS = 10
        var idx = MAXROWS;
        Api.runFunction('set_skills_list',
                        skillsList.slice(0,idx),
                        //[{points:100,strand:'AAA',skill:'BC',name:'Alignment/Space','Foo':'(B)A(R)!'},
                       //],
                         metadata)
            .then(
                keepAdding
            )
            .catch((err)=>{
                console.log('First addition failed :(');
                console.log('Maybe try again?');
                console.log('Error: %s',err);
                throw err;
            });
        ;

        var RETRIES = 0;
        const MAX_RETRIES = 3;

        function keepAdding () {
            if (idx < skillsList.length) {
                console.log('We still have skills to add... adding %s to %s',idx,idx+MAXROWS);
                var nextSkills = skillsList.slice(idx,idx+MAXROWS);
                idx += MAXROWS;
                Api.runFunction('append_to_skills_list',
                                nextSkills,metadata)
                    .then(keepAdding)
                    .catch(()=>{
                        RETRIES += 1;
                        idx -= MAXROWS;
                        console.log('FAILED ON ',idx);
                        console.log('Try again?');
                        if (RETRIES < MAX_RETRIES) {
                            keepAdding()
                        }
                        else {
                            console.log('Too many retries');
                        }
                    });
            }
        }
    }

    function fromGoogle (gotData,handleError) {
        console.log('Firing off request to google');
        Api.runFunction('get_skills_list',
                        metadata,
                       )
            .then((r)=>handleSkillsList(r))
            .catch((e)=>{
                console.log('Error fetching data from google %s',metadata);
                console.log('Error: %s',inspect(e));
                handleError && handleError(e)
            });
        function handleSkillsList (data) {
            console.log("Got data... now let's parse it");
            var headers = data[0]
            
            var myData = [];
            for (var i=1; i<data.length; i++) {
                var row = data[i];
                var rowObj = {}
                rowObj.strand = getField('Strand',row) || getField('Category',row);
                rowObj.skill = getField('Skill',row) || getField('Assignment Name',row);
                rowObj.dueDate = getField('Due Date',row) || getField('Date due',row);
                rowObj.points = getField('Points',row) || getField('Total points',row);
                if (rowObj.strand||rowObj.skill||rowObj.points) {
                    if (typeof rowObj.dueDate == 'string') {
                        console.log('Got a string date %s',rowObj.dueDate)
                        try {
                            rowObj.dueDate = new Date(rowObj.dueDate);
                        }
                        catch (err) {
                            console.log("Couldn't cast date to Date %s",rowObj.dueDate);
                        }
                    }
                    // Include other data in case we want it...
                    for (var h of headers) {
                        if (['Strand','Category','Skill','Assignment Name',
                             'Due Date','Date due','Points','Total points'].indexOf(h)==-1) {
                            rowObj[sanitizeKey(h)] = getField(h,row);
                        }
                    }
                    myData.push(rowObj);
                }
                //console.log('parsed row %s',i);
            }
            gotData(myData);

            function getField (fieldName, row) {
                var colIndex = headers.indexOf(fieldName)
                if (colIndex == -1) {return undefined}
                if (colIndex >= row.length) {
                    throw 'Row '+row+' does not have enough data? index='+colIndex;
                }
                else {
                    return row[colIndex]
                }
            }
            
        }
    }

    return {fromFlatList,toFlatList,toGoogle,fromGoogle,propagateChanges,metadata}
    
}

var pm = PortfolioModel();

function initializeTreeState (treeData) {
    // Given nested data, initialize state for whether children are shown -- default to no children.
    var treeState = {
        nodeMap : {},
    }

    treeState.nodes = treeData.map(makeNodeState);
    treeState.getNode = function (id) {
        if (treeState.nodeMap[id]) {return treeState.nodeMap[id]}
        else {
            console.log('WARNING: No node for %s',id);
            console.log('Returning dummy state');
            return {
                ref : {}, parent:{showChildren:false},showChildren:false,edit:false,selected:false
            };
        }
    }
    treeState.clone = function () {
        var newState = {...treeState}
        return newState;
    }

    treeState.turnOffEdit = function () {
        treeState.nodes.forEach(turnOffEdit);
        function turnOffEdit (node) {
            node.edit = false;
            node.children.forEach(turnOffEdit)
        }
    }
    
    treeState.isEdited = function () {
        var val = false;
        treeState.nodes.forEach(crawlForEdit);
        return val;

        function crawlForEdit (node) {
            if (node.edit) {val = true}
            else {
                node.children.forEach(crawlForEdit);
            }
        }
            
    }
    // treeState.getNodeState (id) {
    //     var address = treeState.nodeMap[id]
    //     var item = {children:treeState.nodes};
    //     for (var idx of address) {
    //         item = item.children[idx];
    //     }
    //     return item;
    // }

    return treeState;

    function makeNodeState (node, idx, parent) {
        var state = {
            ref : {}, // a home for references to editable widgets
            parent : parent,
            showChildren : false,
            edit : false,
            selected: false,
            index: idx,
        }
        state.children = (node.children && node.children.map((n,i)=>makeNodeState(n,i,state))) || []
        var address = [idx];
        var item = state;
        // while (item.parent) {
        //     address.unshift(item.parent.idx)
        //     item = item.parent
        // }
        treeState.nodeMap[node.id] = state;
        return state;
    }
    
}

function PortfolioBuilder () {

    const [skills,setSkills] = useState(
        [
            {strand:'Modeling',skill:'DRY',dueDate:new Date(2019,9,1),points:100},
            {strand:'Modeling',skill:'DRY',dueDate:new Date(2019,10,10),points:100},
            {strand:'Modeling',skill:'DRY',dueDate:new Date(2019,11,11),points:100},
            {strand:'Modeling',skill:'WET',dueDate:new Date(2019,9,1),points:100},
            {strand:'Modeling',skill:'WET',dueDate:new Date(2019,10,10),points:100},
            {strand:'Modeling',skill:'WET',dueDate:new Date(2019,11,11),points:100},
            {strand:'EU',skill:'Function Def',dueDate:new Date(2019,9,1),points:100},
            {strand:'EU',skill:'Function Def',dueDate:new Date(2019,10,10),points:100},
            {strand:'EU',skill:'Data Types',dueDate:new Date(2019,10,11),points:100},
            {strand:'EU',skill:'Data Types',dueDate:new Date(2020,1,11),points:100},
        ]
    );

    //const [nextSkill,setNextSkill] = useState('Skill?');
    //const [nextStrand,setNextStrand] = useState('Strand?');
    useEffect(
        ()=>{
            console.log('Effect: just once!');
            /*
            pm.fromGoogle(
                (skills)=>{
                    console.log(`Got ${skills.length} skills`);
                    treeData = pm.fromFlatList(skills);
                    setTreeState(initializeTreeState(treeData));
                    setSkills(skills);
                }
            );*/
        },[]);

    var treeData = pm.fromFlatList(skills);
    /*var treeData = pm.fromFlatList(skills);
    function setTreeData (v) {
        treeData = v;
    }*/
    const [treeState,setTreeState] = useState(initializeTreeState(treeData)); // uiState of tree


    function saveTree (newTreeData) {
        var newSkills = pm.toFlatList(newTreeData);
        console.log('Set skills!');
        setSkills(newSkills);
    }


    function getNewRowData ({nlevel,parent}) {
        console.log(`getNewRowData(${nlevel},${parent})`)
        const rowData = {
            data:{
                strand : 'New Strand',
            },
            children : []
        }
        
        if (nlevel==0) {
            console.log(`Add children to ${rowData}`)
            rowData.children.push(
                getNewRowData({nlevel:nlevel+1,parent:rowData.data})
            );
            console.log(`getNewRowData(${nlevel},${parent})=>${inspect(rowData)}`)
            return rowData;
        }
        // Otherwise strand is populated
        rowData.data.strand = parent.strand;
        if (nlevel==1) {
            rowData.data.skill = "New Skill"
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
        <div>
          <h4>Skills List ({skills.length})</h4>
          <a href={`https://docs.google.com/spreadsheets/d/${pm.metadata.sheetid}`}>As Sheet</a>
          <button onClick={()=>pm.toGoogle(skills)}>
            Push to Google
          </button>
          <hr/>
          <TreeView
            data={treeData}
            onDataChange={saveTree}
            headers={['Skill','Strand','Due','Points']}
            onChangeHook={TreeView.CascadeHook(['skill','strand'])}
            getNewRowData={getNewRowData}
            maxNesting={2}
            cols={5}
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
