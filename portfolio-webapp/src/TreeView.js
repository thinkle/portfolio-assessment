import React, {useEffect,useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {classNames,getProp} from './utils.js';
import {TransitionGroup,CSSTransition} from 'react-transition-group';
import { inspect } from 'util'; // or directly
import Editor from './RichText.js';
import {Icon,Modal,Button} from './widgets.js';
import './TreeView.sass';
import hash from 'object-hash';

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
            <Icon icon={Icon.plus}
                  onClick={addRowCallback}
            />
          </div>
        </div>)
}


function TreeRow (props) {

    var nlevel = props.level

    const [showChildren,_setShowChildren] = useState(props.getShowChildrenState && props.getShowChildrenState(props));

    function setShowChildren (v) {
        _setShowChildren(v);
        if (props.onSetShowChildren) {
            props.onSetShowChildren(v,props.id);
        }
    }
    
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
                <Icon icon={Icon.down}
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
                         rowId:props.id,
                         rowProps:props,
                         onPropChange:(p,v)=>props.onChange(props.id,p,v)
                        }
                    );
                }
                catch (err) {
                    console.log('RENDERING ERROR with renderer %s',renderer)
                    console.log('RENDERING ERROR %s',err);
                    return (<span>Error rendering data: {inspect(err)}</span>)
                }
            })}
            {!props.noDelete && 
            <div className="controls treecell" >
              <Icon icon={Icon.trash}
                    onClick={
                        ()=>props.onDeleteRow(props.id)
                    }
              />
            </div>}
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
                         {...props}
                         id={`${props.id}-${count}`}
                         level={nlevel+1}
                         key={hash(child.data)}
                         data={child}
                         show={true}
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
}

function TreeView (props) {
    
    const [data,setData] = useState(props.data);

    const noDelete = props.noDelete
    var widths = ['60px',...props.widths]
    if (!noDelete) {widths.push('60px');}
    var template = widths.join(' ');
    
    // useEffect(
    //     ()=>{
    //         if (props.data != data) {
    //             setData(props.data)
    //         }
    //     },[props.data]
    // );

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
        if (parent && props.onSetShowChildren) {
            console.log('Tell our parent to show us off...');
            props.onSetShowChildren(true,parent.id)
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
          <TreeHead key={props.headers.join('')} headers={props.headers} template={template}/>
          

        {data.map(
            (row,count)=>(<TreeRow
                            {...props}
                            key={hash(row.data)}
                            id={''+count}
                            template={template}
                            level={0}
                            data={row}
                            onChange={onDataChange}
                            onAddRow={insertRow}
                            onDeleteRow={deleteRow}
                            noDelete={noDelete}
                            show={true}
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

TreeView.LinkCol = (field, params = {}) => ({data,onPropChange}) => {
    return (<div className={'treecell text-col link-col colSpan'+params.colSpan}>
              <a href={data[field]} target="_blank">{params.getText && params.getText(data) || params.linkText || data[field]}</a>
            </div>);
}

TreeView.TextCol = (field,params = {}) => ({data,onPropChange}) => {
    var value = getProp(data,field)
    if (!value) {
        value = ''
    }
    else {
        value = ''+value;
    }
    return (<div className={'treecell text-col colSpan'+params.colSpan}>              
              {params.editable &&
               <input className="input" value={value}
                      onChange={
                          (event)=>{
                              onPropChange(field,event.target.value)
                          }
                      }
               />
               ||
               <span>{''+value}</span>
              }
            </div>
           )
}
TreeView.TagCol = (field,params = {}) => ({data,onPropChange}) => {
    return (<div className={"treecell colSpan"+params.colSpan} className='tag-col'>
              <span className="tag">{getProp(data,field)+''}</span>
            </div>)
}
TreeView.DateCol = (field,params = {}) => ({data,onPropChange}) => {
    var v = getProp(data,field);
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
              {params.editable && <input className="input" value={getProp(data,field)}
                     onChange={
                         (event)=>{
                             onPropChange(field,event.target.value)
                         }
                     }
                                  />

               ||
               getProp(data,field)
              }
            </div>)
}

TreeView.SumCol = (field,params = {}) => ({data,children}) => {
    var tot = 0;
    function crawl (node) {
        if (getProp(node,`data.${field}`)) {
            tot += getProp(node,`data.${field}`)
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
                            value={getProp(data,field)}
                            type='number'
                            onChange={(event)=>{onPropChange(field,Number(event.target.value))}}
                     />
                 ||
                 Number(getProp(data,field))
             }
           </div>
}

TreeView.ButtonCol = (params = {}) => ({data, rowId, onPropChange}) => {
    var onClickCallback
    if (params.generateOnClick) {
        onClickCallback = params.generateOnClick({data,onPropChange,rowId})
    }
    else {
        onClickCallback = params.onClick
    }
    
    return (<div className={'treecell colSpan'+params.colSpan}>
              <Button classNames={{}}
                  /*{'is-inverted':true,'is-outlined':true,'is-white':true}*/
                      onClick={onClickCallback} {...params}>
               {params.content}
             </Button>
            </div>)
}

TreeView.RichTextCol = (field,params = {}) => ({data,onPropChange}) => {
    const [showEditor,setShowEditor] = useState(false);
    return(
        <div className={"treecell colSpan"+(params&&params.colSpan)}>
          <div>
            <span>{snippet(getProp(data,field))}</span>
            <Icon
              onClick={()=>setShowEditor(!showEditor)}
              icon={Icon.edit}
            />
            <Modal active={showEditor} onClose={()=>setShowEditor(false)}
                   title={params.makeHeader && params.makeHeader(data)}
            >
              <div>
              {showEditor &&
                <Editor editorHtml={getProp(data,field)}
                     onChange={(v)=>{
                         onPropChange(field,v)
                     }}
                />
              }
               </div>
              <Button icon={Icon.check} onClick={()=>setShowEditor(false)}>
                Close
              </Button>
            </Modal>
            {/*showEditor && popupEditor()*/}
          </div>
        </div>
    );

    function snippet (htmlVal) {
        if (!htmlVal) {htmlVal=''}
        // Very lame snippet.
        htmlVal = htmlVal.replace(
                /<[^>]*>/g,' '
        );
        return htmlVal.substr(0,20)+'...'
    }

    function popupEditor () {
        return (
            <div className="textEditorCell spring-tree-enter-done">
                <Editor editorHtml={getProp(data,field)}
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

function NapTime (showLevel=0) { // i.e. collapsing children manager

    const [childStateMap,setChildStateMap] = useState({});

    function getShowChildrenState (rowProps) {
        if (childStateMap[rowProps.id]) {
            console.log('receive cached tree state',childStateMap[rowProps.id],rowProps.id);
            return childStateMap[rowProps.id]
        }
        else {
            if (rowProps.level < showLevel) {
                return true;
            }
            else {
                return false;
            }
        }
    }

    function onSetShowChildren (value, id) {
        console.log('set show children state',id,value);
        setChildStateMap({
            ...childStateMap,
            [id]:value
        });
    }

    return {getShowChildrenState,
           onSetShowChildren}
}

TreeView.NapTime = NapTime;

export default TreeView
