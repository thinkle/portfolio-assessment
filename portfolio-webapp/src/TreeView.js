import React, {useEffect,useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown,faAngleUp,faPenSquare,faWindowClose,faCheck,faPlus,faTrash } from '@fortawesome/free-solid-svg-icons'
import {classNames} from './utils.js';
import {TransitionGroup,CSSTransition} from 'react-transition-group';
import { inspect } from 'util'; // or directly
import Editor from './RichText.js';
import {Icon,Modal,Button} from './widgets.js';
import './TreeView.sass';


// Nevermind -- let's abstract the treeview out into a widget.

function TreeHead (props) {
    if (!props.headers) {
        return (<thead/>)
    }
    return (
        <div className='treehead'>
          <div className='treerow'
            style={
                {'grid-template-columns':props.template}
            }
          ><div className='treecell'></div>
        {props.headers.map((h)=>(
            <div className='treecell'>{h}</div>
        ))}
          </div>
        </div>
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
        <div className={classNames({
            treerow:true,
            ['nested'+(props.nlevel)]:props.nlevel,
            lastRow:true,
        })} style={
            {'grid-template-columns':props.template}
        }
        >
          <div className={"treecell colSpan"+props.colsToSkip}/>
          <div className="control treecell" >
            <Icon icon={faPlus}
                  onClick={addRowCallback}
            />
          </div>
        </div>)
}


function TreeRow (props) {
    
    var nlevel = props.level

    const [showChildren,setShowChildren] = useState(props.showChildren);
    
    if (!props.show) {
        return null;
    }

    return (
        <div className={
            classNames({
                rowGroup : props.data.children && props.data.children.length > 0,
                ['nested'+nlevel] : nlevel,
            })
        }>
          <div
            key={props.id}
            className={
                classNames({
                    ['nested'+nlevel] : nlevel,
                    hidden : !props.show,
                    treerow : true,
                })
            }
            style={
                {'grid-template-columns':props.template}
            }
          >
            <div className="controls treecell" >
              {props.data.children && props.data.children.length > 0 && 
               (<span className={classNames({
                   icon:true,
                   reverse:showChildren,
                   unreverse:!showChildren
               })}>
                <Icon icon={faAngleDown}
                      onClick={
                          ()=>setShowChildren(!showChildren)
                      }
                />
               </span>)}
            </div>
                       
            
            {props.getRenderers({
                data:props.data,
                level:nlevel
            }).map((renderer)=>{
                try {
                    return renderer(
                        {...props.data,
                         onPropChange:(p,v)=>props.onChange(props.id,p,v)
                        }
                    );
                }
                catch (err) {
                    console.log('RENDERING ERROR with renderer %s',renderer)
                    console.log('RENDERING ERROR %s',err);
                    return (<span>Error rendering data</span>)
                }
            })}
            <div className="controls treecell" >
              <Icon icon={faTrash}
                    onClick={
                        ()=>props.onDeleteRow(props.id)
                    }
              />
            </div>
          </div>
          

          {props.data.children &&
            <CSSTransition              
              timeout={400}
              classNames='spring-tree'
              in={showChildren}
              unmountOnExit
            >
             <div className={
                 classNames({
                     'row-children':true,
                 })
             }>

               {props.data.children.map(
                   (child,count)=>(
                       <TreeRow
                         id={`${props.id}-${count}`}
                         template={props.template}
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

                   ))}
               {(nlevel < props.maxNesting || props.maxNesting===undefined) && 
                props.getNewRowData && (
                   <AddRowRow
                     nlevel={nlevel+1}
                     template={props.template}
                     onAddRow={props.onAddRow}
                     parent={props.data}
                     parentId={props.id}
                     getNewRowData={props.getNewRowData}
                     colsToSkip={props.cols+2}
                   />
               )
               }
             </div>
           </CSSTransition>
          }
        </div>
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

    var widths = ['60px',...props.widths,'60px']
    var template = widths.join(' ');

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
          <TreeHead headers={props.headers} template={template}/>
          

        {data.map(
            (row,count)=>(<TreeRow
                            id={''+count}
                            template={template}
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
        {props.getNewRowData && <AddRowRow
            nlevel={0}
            onAddRow={insertRow}
            parent={{children:data}}
            parentId=''
            getNewRowData={props.getNewRowData}
            colsToSkip={props.cols+2}
            template={template}
                                />}
        </table>
        </TransitionGroup>
    )
}

TreeView.TextCol = (field,params = {}) => ({data,onPropChange}) => {
    return (<div className={'treecell text-col colSpan'+params.colSpan}>              
              {params.editable && <input className="input" value={data[field]}
                     onChange={
                         (event)=>{
                             onPropChange(field,event.target.value)
                         }
                     }
                                  />
               ||
               ''+data[field]}
            </div>
           )
}
TreeView.TagCol = (field,params = {}) => ({data,onPropChange}) => {
    return (<div className={"treecell colSpan"+params.colSpan} className='tag-col'>
              <span className="tag">{data[field]+''}</span>
            </div>)
}
TreeView.DateCol = (field,params = {}) => ({data,onPropChange}) => {
    var v = data[field];
    var inputVal = undefined;
    if (v && v.toLocaleDateString) {
        inputVal = v.toISOString().substring(0,10);
        v = v.toLocaleDateString();
    }
    else if (v) {
        try {
            v = new Date(v);
            inputVal = v.toISOString().substring(0,10);
            v = v.toLocaleDateString();
        }
        catch (err) {
            console.log('Unable to convert date value: %s (%s)',v,err)
        }
    }

    return (<div className={"treecell colSpan"+params.colSpan}>

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
              
            </div>)
}
TreeView.BlankCol = (field,params = {}) => ({data}) => {
    return (<div
              className={"blank treecell colSpan"+params.colSpan}
                >&nbsp;</div>)
}
TreeView.HeaderCol = (field,params = {}) => ({data,onPropChange}) => {
    return (<div className={"treecell is-bold colSpan"+params.colSpan}
                 >              
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
            </div>)
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
    return <div className={"treecell colSpan"+params.colSpan}>
             {tot}
           </div>
}
TreeView.NumCol = (field,params = {}) => ({data,onPropChange}) => {
    return <div className={"treecell colSpan"+params.colSpan}>
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
           </div>
}

TreeView.RichTextCol = (field,params) => ({data,onPropChange}) => {
    const [showEditor,setShowEditor] = useState(false);
    return(
        <div className={"treecell colSpan"+(params&&params.colSpan)}>
          <div>
            <span>{snippet(data[field])}</span>
            <Icon
              onClick={()=>setShowEditor(!showEditor)}
              icon={faPenSquare}
            />
            <Modal active={showEditor} onClose={()=>setShowEditor(false)}
                   title={params.makeHeader && params.makeHeader(data)}
            >
              <div>
              {showEditor &&
                <Editor editorHtml={data[field]}
                     onChange={(v)=>{
                         onPropChange(field,v)
                     }}
                />
              }
               </div>
              <Button icon={faCheck} onClick={()=>setShowEditor(false)}>
                Close
              </Button>
            </Modal>
            {/*showEditor && popupEditor()*/}
          </div>
        </div>
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


export default TreeView
