import React, {useEffect,useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {classNames,getProp,sanitize} from './utils.js';
import {TransitionGroup,CSSTransition} from 'react-transition-group';
import { inspect } from 'util'; // or directly
import Editor from './RichText.js';
import {Icon,Modal,Button} from './widgets.js';
import makeComponent,{mergeClassNames} from './widgets/QuickComponents.js';
import './TreeView.sass';


// Nevermind -- let's abstract the treeview out into a widget.

function TreeHead (props) {
    if (!props.headers) {
        return (<thead/>)
    }
    return (
        <div className='treehead'>
          <div className='treerow'
            /* style={ */
            /*     {'grid-template-columns':props.template} */
            /* } */
          ><div className='treecell'></div>
        {props.headers.map((h)=>(
            <div key={h} className='treecell'>{h}</div>
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

    const columnCount = {} // handy counter... ugh -- globalish variable -- long story.

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
            }).map((renderer,i)=>
                   {
                try {
                    return renderer(
                        {...props.data,
                         rowId:props.id,
                         number:i,
                         columnCount:columnCount,
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
                       /*key={hash(child.data)}*/
                         data={child}
                         show={true}
                       />

                   ))}
               {(nlevel < props.maxNesting || props.maxNesting===undefined) && 
                props.getNewRowData && (
                   <AddRowRow
                     nlevel={nlevel+1}
                     /* template={props.template} */
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
    for (var address of addresses) {
        parent = node;
        node = node.children && node.children[address];
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
    // var widths = ['60px',...props.widths]
    // if (!noDelete) {widths.push('60px');}
    // var template = widths.join(' ');
    const baseClass = `treeView-${props.cols}-${!noDelete&&2||1}`;
    const tvClassNames = {
        [baseClass] : true,
        control1 : noDelete,
        control2 : !noDelete,
        table : true,
        treeView : true,
        ...props.classNames
    }
    
    // useEffect(
    //     ()=>{
    //         if (props.data != data) {
    //             setData(props.data)
    //         }
    //     },[props.data]
    // );

    useEffect(
        ()=>{
            //console.log('Data changed!');
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
          <div className={props.className + ' ' + classNames(tvClassNames)}>
          <TreeHead key={props.headers.join('')} headers={props.headers}
        /* template={template} */
          />
          

        {data.map(
            (row,count)=>(<TreeRow
                            {...props}
                            /* key={hash(row.data)} */
                            id={''+count}
                            /* template={template} */
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
                                  /* template={template} */
                                />}
        </div>
        </TransitionGroup>
    )
}

function tcClass (special, {params, data, number, columnCount, extraClasses}) {
    if (!params) {params = {}}
    const classes = ['treecell',...special]
    // if (number==0) {
    //     columnCount.count = 1;
    // }
    // if (number > columnCount.count) {
    //     console.log('oops, column counting appears to be off -- maybe not every column is calling tcClass?');
    //     columnCount.count = number+ 1;
    // }
    // classes.push('count'+columnCount.count)
    // if (params.colSpan) {
    //     classes.push('colSpan'+params.colSpan);
    //     classes.push('start'+columnCount.count);
    //     classes.push('end'+(columnCount.count+params.colSpan));
    //     columnCount.count += params.colSpan
    // }
    // else {
    //     classes.push('cell'+columnCount.count);
    //     columnCount.count += 1;
    // }
    console.log('tcClass got ',special,params);
    if (params.col) {
        if (params.colSpan) {
            classes.push('start'+params.col)
            classes.push('end'+(params.col+params.colSpan-1))
        }
        else {
            classes.push('cell'+params.col);
        }
    }
    return mergeClassNames(classes,{...params,...extraClasses})
}

TreeView.LinkCol = (field, params = {}) => ({data,onPropChange,number,columnCount}) => {
    const cn = tcClass(['treecell','text-col','link-col'],
                       {params,data,number,columnCount})
    return (<div className={cn}>
              <a href={getProp(data,field)} target="_blank">
                {params.getText && params.getText(data)
                 || getProp(data,params.linkField)
                 || params.linkText
                 || data[field]}
              </a>
            </div>);
}

TreeView.TextCol = (field,params = {}) => ({data,onPropChange,number,columnCount}) => {
    var value = getProp(data,field)
    if (!value) {
        value = ''
    }
    else {
        value = ''+value;
    }

    const cn = tcClass(['treecell','text-col'],{params,data,number,columnCount});

    return (<div className={cn}>              
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
TreeView.TagCol = (field,params = {}) => ({data,onPropChange,number,columnCount}) => {
    
    const cn = tcClass(['treecell','tag-col'],{params,data,number,columnCount});

    return (<div className={cn}>
              <span className="tag">{getProp(data,field)+''}</span>
            </div>)
}
TreeView.DateCol = (field,params = {}) => ({data,onPropChange,number,columnCount}) => {
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

    
    const cn = tcClass(['treecell','date-col'],{params,data,number,columnCount})

    return (<div className={cn}>

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
TreeView.BlankCol = (params = {}) => ({data,number,columnCount}) => {
    const cn = tcClass(['treecell','blank'],{params,data,number,columnCount});
    return (<div
              className={cn}
                >&nbsp;</div>)
}
TreeView.HeaderCol = (field,params = {}) => ({data,onPropChange,number,columnCount,}) => {    
    const cn = tcClass(['treecell','is-head','is-bold'],{data,number,columnCount,params})

    return (<div className={cn}>              
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

TreeView.SumCol = (field,params = {}) => ({data,children,number,columnCount}) => {
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

    const cn = tcClass(['treecell','sum-col'],{params,data,number,columnCount});
    // if (params.colSpanClasses) {
    //     classes.push(params.colSpanClasses);
    // }
    // const cn = mergeClassNames(classes,params)

    return <div className={cn}>
             {tot}
           </div>
}
TreeView.NumCol = (field,params = {}) => ({data,onPropChange,number,columnCount}) => {
    const cn = tcClass(['treecell','text-col'],{data,params,number,columnCount})
    return <div className={cn}>
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

TreeView.PopupCol = (field,params = {snippetMode:true}) => ({data,number,columnCount}) => { // read only
    
    const [showText,setShowText] = useState(false);

    var value = getProp(data,field);

    const cn = tcClass(['treecell','text-col'],{params,data,number,columnCount,
                                                extraClasses:{treePopover: showText, treePoppable : !showText && value}});
    
    return (<div className={cn}>
              {renderLabel()}
              {value &&
               (showText && 
                renderPopup()
                ||
                (params.snippetMode && value && <a onClick={setShowText}>{snippet(value)}</a>)
               )
              }
              {!value && '-'}
            </div>)

    function renderLabel () {
        return (params.labelField ||  params.label) &&
        <span
          className={
              classNames({
                  tag : params.tagMode,
                  'is-tiny':params.tagMode,
                  'is-bold':showText,
              })}
          onClick={()=>setShowText(!showText)}
        >
          {params.labelField && getProp(data,params.labelField) || params.label}
        </span>
    }

    function renderPopup () {
        return <div>
                 <div className="description" dangerouslySetInnerHTML={sanitize(value)}/>
          <Icon className='close-popup' icon={Icon.close} aria-label='close' onClick={()=>setShowText(false)}/>
        </div>
    }
    
}

TreeView.ButtonCol = (params = {}) => ({data, rowId, onPropChange,number,columnCount}) => {
    var onClickCallback
    if (params.generateOnClick) {
        onClickCallback = params.generateOnClick({data,onPropChange,rowId})
    }
    else {
        onClickCallback = params.onClick
    }
    const cn = tcClass(['treecell','button-col'],{params,data,number,columnCount});
    // if (params.colSpanClasses) {
    //     classes.push(params.colSpanClasses);
    // }
    // const cn = mergeClassNames(classes,params)

    
    return (<div className={cn}>
              <Button classNames={{}}
                  /*{'is-inverted':true,'is-outlined':true,'is-white':true}*/
                      onClick={onClickCallback} {...params}>
               {params.content}
             </Button>
            </div>)
}

TreeView.RichTextCol = (field,params = {}) => ({data,onPropChange,number,columnCount}) => {
    const [showEditor,setShowEditor] = useState(false);
    const cn = tcClass(['treecell','text-col','rich-text-col'],{params,data,number,columnCount});
    return(
        <div className={cn}>
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

TreeView.Cell = function (props) {
    const cn = tcClass([],props)
    return <div className={cn}>
             {props.children}
           </div>
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
            //console.log('receive cached tree state',childStateMap[rowProps.id],rowProps.id);
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
        //console.log('set show children state',id,value);
        setChildStateMap({
            ...childStateMap,
            [id]:value
        });
    }

    return {getShowChildrenState,
           onSetShowChildren}
}

function snippet (htmlVal) {
    if (!htmlVal) {htmlVal=''}
    // Very lame snippet.
    htmlVal = htmlVal.replace(
            /<[^>]*>/g,' '
    );
    return htmlVal.substr(0,20)+'...'
}


TreeView.NapTime = NapTime;
TreeView.tcc = tcClass
export default TreeView
