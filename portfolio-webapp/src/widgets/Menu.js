import React, {useEffect,useState} from 'react';
import Icon from './Icon.js';
import Button from './Button.js';
import Panel from './Panel.js';
import {classNames,arrayProp} from '../utils.js';
import {CSSTransition} from 'react-transition-group';
import './Menu.sass';
import {requireProps} from './widgetUtils.js';

function Item (props) {
    return <span>{props.children}</span>
}

function Dropdown (props) {
    return <Menu {...props} dropdown={true}/>
}

function Menu (props) {
    const [active,setActive] = useState(false);
    var className = classNames({...props.classNames,
                                menu : true,
                                'is-dropdown' : props.dropdown,
                                active:active});
    if (props.className) {
        className = props.className + ' ' + className;
    }


    useEffect(()=>{
        if (props.active) {
            setActive(props.active)
        }
    },[props.active])
    
    function selectItem (itm) {
        setActive(false);
        props.onSelected && props.onSelected(itm)
    }

    var renderItem = props.renderItem
    if (!renderItem) {
        renderItem = (itm) => itm;
    }

    return (
        <div className={className}>
          <Button
            className='menu-title'
            onClick={()=>setActive(!active)}
            customIcon={<Icon  className={active&&'reverse'||'unreverse'} icon={Icon.down}/>}
          >
            {props.dropdown && props.initialValue &&
             renderItem(props.initialValue) ||
             <span>{props.title||'Menu'}</span>}
          </Button>
          <div className="menu-content-holder">
            <CSSTransition timout={3500} classNames='dropdown' in={active} mountOnEnter>
              <ul className='menu-content menu-list'>
                {props.items && props.items.map((itm)=><li key={JSON.stringify(itm)} className='menu-item' onClick={()=>selectItem(itm)}><a>{renderItem(itm)}</a></li>)}
              </ul>
            </CSSTransition>
          </div>
        </div>
    )
}

function SelectableItem (props) {
    const [selected,setSelected] = useState(props.initialValue)
    const [elWidth, setElWidth] = useState(400)
    const [elHeight, setElHeight] = useState(50)
    var renderedItems = []

    useEffect( ()=>{
        window.setTimeout(()=>{
            var maxHeight = 0;
            var maxWidth = 0;
            renderedItems.forEach(
                (el)=>{
                    if (el) {
                        var box = el.getBoundingClientRect();
                        if (box.width > maxWidth) maxWidth = box.width;
                        if (box.height > maxHeight) maxHeight = box.height;
                    }
                });
            setElWidth(maxWidth);
            setElHeight(maxHeight);
        },200);
    }, [selected, props]);
    
    var renderItem = props.renderItem;
    if (!renderItem) {
        renderItem = (itm)=>itm;
    }
    var menuProps = {...props};
    menuProps.onSelected = select;

    function select (itm) {
        console.log('selectable - Got it!',itm);
        setSelected(itm);
        props.onSelected(itm);
    }
    
    

    return (
        <React.Fragment>
          {/* For calculating height/width only */}
          <div style={{position:'absolute',visibility:'hidden',left:100,top:100,border:'3px solid red'}}>
            <div className='selectedItem' ref={(n)=>renderedItems.push(n)}>
              {selected && renderItem(selected)}
            </div>
            <div className='' ref={(n)=>renderedItems.push(n)}>
              <Menu {...menuProps}/>
            </div>
          </div>
          {/* End section for calculating height/width only */}
          
          <div 
               className='relWrap' 
               style={{height:elHeight,width:elWidth}}>           
            <CSSTransition timeout={200} classNames='fade-item' in={!(!selected)} mountOnEnter>
              <div className='static selectedItem'>
                {selected && renderItem(selected)}
                <Icon className='close-button' icon={Icon.close} onClick={()=>select()}/>
              </div>
            </CSSTransition>
            <CSSTransition timeout={200} classNames='fade-menu' in={!selected} mountOnEnter>
              <div className='static'>
                <Menu {...menuProps}/>
              </div>
            </CSSTransition>
          </div>
        </React.Fragment>
    )
}

function CustomSelectableItem (props) {

    const children = React.Children.toArray(props.children)
    if (children.length==2) {
        var item = children[0];
        var menu = children[1];
    }
    else {
        console.log('CustomSelectableItem needs exactly two children, got %s',children);
        throw 'Need two children, got '+children.length
    }

    var selected = props.selected;
    var renderedItems = []
    const [elWidth, setElWidth] = useState(100)
    const [elHeight, setElHeight] = useState(40)


    useEffect( ()=>{
        window.setTimeout(()=>{
        var maxHeight = 0;
        var maxWidth = 0;
        renderedItems.forEach(
            (el)=>{
                if (el) {
                    var box = el.getBoundingClientRect();
                    if (box.width > maxWidth) maxWidth = box.width;
                    if (box.height > maxHeight) maxHeight = box.height;
                }
            });
        setElWidth(maxWidth+30);
            setElHeight(maxHeight+5);
        },200);
    }, [props.selected]);

    return (
        <React.Fragment>
          {/* For calculating width/height only */}
          <div style={{position:'absolute',visibility:'hidden',left:100,top:100,border:'3px solid red'}}>
            <div className='selectedItem' ref={(n)=>renderedItems.push(n)}>
              {item}
            </div>
            <div ref={(n)=>renderedItems.push(n)}>
              {menu}
            </div>
          </div>
          {/* End div for calculating width/height */}
          <div className='relWrap' style={{height:elHeight,width:elWidth}}>          
            <CSSTransition timeout={0} classNames='fade-item' in={!(!selected)} mountOnEnter>
              <div className='static selectedItem'>
                {item}
                <Icon className='close-button' icon={Icon.close} onClick={()=>props.unselect()}/>
              </div>
            </CSSTransition>
            <CSSTransition timeout={0} classNames='fade-menu' in={!selected} mountOnEnter>
              <div className='static'>
                {menu}
              </div>
            </CSSTransition>
          </div>
        </React.Fragment>

    );
    
}

function MultiSelector (props) {

    const [updated,setUpdated] = useState(0)

    var getKey = props.getKey;
    if (!getKey) {
        getKey = (i)=>i&&i.id||i
    }

    var renderItem = props.renderItem;
    if (!renderItem) {
        renderItem = (item)=>item
    }

    try {
        requireProps(props,['onSelect','onUnselect','items','selected']);
    }
    catch (err) {
        console.log('ERROR: missing required props',err);
        return err.element
    }
    
    return <Panel key={updated}>
    {props.items.map(
        (item)=>{
            const active = props.selected.indexOf(item)>-1;
            return <Panel.Label
                     className={classNames({
                         active : active
                     })}
                     key={getKey(item)}
                   >
                     <input
                       type='checkbox'
                       active={active}
                       checked={active}
            onChange={
                (event)=>{
                    if (active) {
                        props.onUnselect(item)
                    }
                    else {
                        props.onSelect(item);
                    }
                }}
                     />
                     {renderItem(item)}
                   </Panel.Label>
        }
    )}
           </Panel>
}


Menu.Item = Item;

export default Menu;
export {MultiSelector,SelectableItem,CustomSelectableItem,Dropdown}
