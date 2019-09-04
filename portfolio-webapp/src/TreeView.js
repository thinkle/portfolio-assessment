import React, {useEffect,useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown,faAngleUp,faPenSquare,faWindowClose,faCheck,faPlus,faTrash } from '@fortawesome/free-solid-svg-icons'
import {classNames} from './utils.js';
import {TransitionGroup,CSSTransition} from 'react-transition-group';
import { inspect } from 'util'; // or directly
import Editor from './RichText.js';
import './TreeView.sass';

var FA = FontAwesomeIcon;


// Nevermind -- let's abstract the treeview out into a widget.

function TreeHead (props) {
    if (!props.headers) {
        return (<thead/>)
    }
    return (
        <thead>
          <tr><th></th>
        {props.headers.map((h)=>(
            <th>{h}</th>
        ))}
          </tr>
        </thead>
    )
}

function AddRowRow (props) {
    var newRowIndex = 0;

    var newRowMetadata = props.getNewRowData({
                           nlevel:props.nlevel,
                           parent:props.parent.data,
                           siblings:props.parent.children,
                       })


    if (props.parent.children) {
        newRowIndex = props.parent.children.length;
    }

    function addRowCallback () {
        var id;
        if (props.parentId) {
            id=`${props.parentId}-${newRowIndex}`
        }
        else {
            id = `${newRowIndex}`
        }
        props.onAddRow(id,newRowMetadata.data);
    }

    return (
        <tr className={classNames({
            ['nested'+(props.nlevel)]:props.nlevel,
            lastRow:true,
        })}
    >
      <td colSpan={props.colsToSkip}/>
      <td className="control">
        <span onClick={addRowCallback}>
          {newRowMetadata.label}
          <span
            className="button icon"
            >
            <FA icon={faPlus}/>
          </span>
        </span>
      </td>
    </tr>)
}

function TreeRow (props) {
    
    var nlevel = props.level

    const [showChildren,setShowChildren] = useState(props.showChildren);
    
    if (!props.show) {
        return null;
    }

    return (
        <React.Fragment>
          <tr
            key={props.id}
            className={
                classNames({
                    ['nested'+nlevel] : nlevel,
                    hidden : !props.show,
                })
            }
          >
            <td className="controls">
              {props.data.children && props.data.children.length > 0 && 
               (<span className={classNames({
                   icon:true,
                   reverse:showChildren,
                   unreverse:!showChildren
               })}>
                <FA icon={faAngleDown}
                  onClick={
                    ()=>setShowChildren(!showChildren)
                  }
                />
               </span>)}
            </td>
                       
            
            {props.getRenderers({
                data:props.data,
                level:nlevel
            }).map((renderer)=>{
                try {
                    return renderer({...props.data,
                                     onPropChange:(p,v)=>props.onChange(props.id,p,v)
                                    }
                                   );
                }
                catch (err) {
                    console.log('RENDERING ERROR %s',err);
                    return (<span>Error rendering data</span>)
                }
            })}
            <td className="controls">
              <span className="icon">
                <FA icon={faTrash}
                  onClick={
                      ()=>props.onDeleteRow(props.id)
                  }

                />
               </span>
            </td>
          </tr>
          

          {props.data.children &&
           props.data.children.map(
               (child,count)=>(

                   <CSSTransition
                       in={props.show && showChildren}
                       classNames="spring-tree"
                       timeOut={750}
                       unmountOnExit
                     >
                       <TreeRow
                         id={`${props.id}-${count}`}
                         level={nlevel+1}
                         data={child}
                         getRenderers={props.getRenderers}
                         onChange={props.onChange}
                         onAddRow={props.onAddRow}
                         onDeleteRow={props.onDeleteRow}
                         show={true}
                         maxNesting={props.maxNesting}
                         getNewRowData={props.getNewRowData}
                         cols={props.cols}
                       />
                   </CSSTransition>
               ))}
          {(nlevel < props.maxNesting || props.maxNesting===undefined) && showChildren && (
              <AddRowRow
                nlevel={nlevel+1}
                onAddRow={props.onAddRow}
                parent={props.data}
                parentId={props.id}
                getNewRowData={props.getNewRowData}
                colsToSkip={props.cols+1}
              />
          )
          }
          
        </React.Fragment>
    );

}

function cloneTree (tree) {
    console.log('Clone tree %s',tree);
    const newTree = []
    for (let node of tree) {
        const obj = {
            data : {...node.data},
        }
        if (node.children) {
            obj.children = cloneTree(node.children)
        }
        newTree.push(obj);
    }
    return newTree;
}

function getNodeInfoFromId (id, tree) {
    if (!id) {
        console.log('getNodeInfo undefined ID');
        return {
            node : {
                children:tree
            },
            parent : undefined,
        }
    }
    var addresses = id.split('-').map((i)=>Number(i))
    var node = {children:tree}; var parent = undefined;
    console.log(`converted ID ${id} to addresses ${addresses}`);
    for (var address of addresses) {
        parent = node;
        node = node.children && node.children[address];
        console.log(`Navigate to ${node}`);
    }
    return {
        node, parent, addresses,
        index:address,
    }
}

function getNodeFromId (id, tree) {
    return getNodeInfoFromId(id,tree).node;
    // if (!id) {
    //     return {
    //         children:tree
    //     }
    // }
    // var addresses = id.split('-').map((i)=>Number(i))
    // var node = {children:tree}
    // console.log(`converted ID ${id} to addresses ${addresses}`);
    // for (var address of addresses) {
    //     node = node.children && node.children[address];
    //     console.log(`Navigate to ${node}`);
    // }
    // return node;
}

function TreeView (props) {
    
    const [data,setData] = useState(props.data);

    useEffect(
        ()=>{
            console.log('Data changed!');
            props.onDataChange && props.onDataChange(data);
        },
        [data]);

    function insertRow (afterId, rowData) {
        console.log(`Insert row after ${afterId}: ${rowData}`);
        var newTree = cloneTree(data);
        var nodeInfo = getNodeInfoFromId(afterId,newTree);
        var childIndex = nodeInfo.index;
        var parent = nodeInfo.parent;
        if (!rowData.data) {
            rowData = {
                data : rowData
            }
        }
        try {
            parent.children.splice(childIndex,0,rowData)
        }
        catch (err) {
            console.log(`Trouble with parent ${inspect(parent)} childIndex ${childIndex}`)
            throw err;
        }
        setData(newTree);
    }

    function deleteRow (rowId) {
        var newTree = cloneTree(data);
        var nodeInfo = getNodeInfoFromId(rowId,newTree);
        if (!nodeInfo.parent) {
            // WTF? No parent
            console.log(`No parent found for ID ${rowId}`);
            throw 'BAD ID?';
        }
        nodeInfo.parent.children.splice(nodeInfo.index,1);
        setData(newTree);
    }

    function onDataChange (id, prop, val) {
        var newData = cloneTree(data);
        var item = getNodeFromId(id,newData);
        item.data[prop] = val;
        props.onChangeHook && props.onChangeHook(newData,item,prop,val)
        setData(newData);
    }

    return (
        <TransitionGroup>
        <table className="table treeView container is-striped">
          <TreeHead headers={props.headers}/>
          

        {data.map(
            (row,count)=>(<TreeRow
                            id={''+count}
                            level={0}
                            data={row}
                            getRenderers={props.getRenderers}
                            onChange={onDataChange}
                            onAddRow={insertRow}
                            onDeleteRow={deleteRow}
                            show={true}
                            showChildren={false}
                            maxNesting={props.maxNesting}
                            getNewRowData={props.getNewRowData}
                            cols={props.cols}
                            />)
        )}
          <AddRowRow
            nlevel={0}
            onAddRow={insertRow}
            parent={{children:data}}
            parentId=''
            getNewRowData={props.getNewRowData}
            colsToSkip={props.cols+1}
          />
        </table>
        </TransitionGroup>
    )
}

TreeView.TextCol = (field,params = {}) => ({data,onPropChange}) => {
    return (<td colSpan={params.colSpan} className='text-col'>
              
              {params.editable && <input className="input" value={data[field]}
                     onChange={
                         (event)=>{
                             onPropChange(field,event.target.value)
                         }
                     }
                                  />
               ||
               ''+data[field]}
            </td>
           )
}
TreeView.TagCol = (field,params = {}) => ({data,onPropChange}) => {
    return (<td colSpan={params.colSpan} className='tag-col'>
              <span className="tag">{data[field]+''}</span>
            </td>)
}
TreeView.DateCol = (field,params = {}) => ({data,onPropChange}) => {
    var v = data[field];
    var inputVal = undefined;
    if (v && v.toLocaleDateString) {
        inputVal = v.toISOString().substring(0,10);
        v = v.toLocaleDateString();
    }

    return (<td colSpan={params.colSpan}>

              {params.editable &&
               <input
                 className="input"
                 value={inputVal}
                 type='date'
                 onChange={(event)=>{onPropChange(field,new Date(event.target.value))}}
               />
               ||
               v
              }
              
            </td>)
}
TreeView.BlankCol = (field,params = {}) => ({data}) => {
    return (<td colSpan={params.colSpan}
                className='blank'>&nbsp;</td>)
}
TreeView.HeaderCol = (field,params = {}) => ({data,onPropChange}) => {
    return (<td colSpan={params.colSpan}
                className='is-bold'>              
              {params.editable && <input className="input" value={data[field]}
                     onChange={
                         (event)=>{
                             onPropChange(field,event.target.value)
                         }
                     }
                                  />

               ||
               data[field]
              }
            </td>)
}

TreeView.SumCol = (field,params = {}) => ({data,children}) => {
    var tot = 0;
    function crawl (node) {
        if (node.data[field]) {
            tot += node.data[field]
        }
        if (node.children) {
            node.children.forEach(crawl);
        }
    }
    children.forEach(crawl);
    return <td>
             {tot}
           </td>
}
TreeView.NumCol = (field,params = {}) => ({data,onPropChange}) => {
    return <td>
             {
                 params.editable &&
                     <input className="input"
                            value={data[field]}
                            type='number'
                            onChange={(event)=>{onPropChange(field,Number(event.target.value))}}
                     />
                 ||
                 Number(data[field])
             }
           </td>
}

TreeView.RichTextCol = (field,params) => ({data,onPropChange}) => {
    const [showEditor,setShowEditor] = useState(false);
    return(
        <td>
          <div>
          <span>{snippet(data[field])}</span>
          <span className="icon"
                onClick={()=>setShowEditor(!showEditor)}
          >
            <FA icon={faPenSquare}/>
          </span>
          {showEditor && popupEditor()}
        </div>
        </td>
                       
    
    );

    function snippet (htmlVal) {
        // Very lame snippet.
        htmlVal = htmlVal.replace(
                /<[^>]*>/g,' '
        );
        return htmlVal.substr(0,20)+'...'
    }

    function popupEditor () {
        return (
            <div className="textEditorCell spring-tree-enter-done">
                <Editor editorHtml={data[field]}
                     onChange={(v)=>{
                         onPropChange(field,v)
                     }}
                />
            </div>
        )
    }

}


TreeView.CascadeHook = (props) => (data,node,prop,val) => {
    if (props.indexOf(prop) > -1) {
        writeDown(node,prop,val);
    }
    
    function writeDown (node, attribute, newVal) {
        node.data[attribute] = newVal
        if (node.children) {
            node.children.forEach((n)=>writeDown(n,attribute,newVal));
        }
    }
    
}


export default TreeView;
