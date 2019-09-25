import React, {useEffect,useState} from 'react';
import Icon from './Icon.js';
import Button from './Button.js';
import {classNames,arrayProp} from '../utils.js';
import {CSSTransition} from 'react-transition-group';
import './Menu.sass';

function Item (props) {
    return <span>{props.children}</span>
}

function Menu (props) {
    const [active,setActive] = useState(false);
    console.log('Render Menu with %s items',props.items && props.items.length);
    var className = classNames({...props.classNames,
                                menu : true,
                                active:active});


    useEffect(()=>{
        if (props.active) {
            setActive(props.active)
        }
    },[props.active])
    
    function selectItem (itm) {
        setActive(false);
        console.log('menu selectItem(%s)',itm);
        props.onSelected(itm)
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
          >
            <span className={active&&'reverse'||'unreverse'}><Icon icon={Icon.down}/></span>
            <span>{props.title||'Menu'}</span>
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
    const [elWidth, setElWidth] = useState(100)
    const [elHeight, setElHeight] = useState(40)
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
        setElWidth(maxWidth+30);
            setElHeight(maxHeight+5);
        },200);
    }, [selected]);

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

        <div className='relWrap' style={{height:elHeight,width:elWidth}}>          
          <CSSTransition classNames='fade-item' in={!(!selected)} mountOnEnter>
            <div className='static selectedItem' ref={(n)=>renderedItems.push(n)}>
              {selected && renderItem(selected)}
              <Icon className='close-button' icon={Icon.close} onClick={()=>select()}/>
            </div>
          </CSSTransition>
          <CSSTransition classNames='fade-menu' in={!selected} mountOnEnter>
            <div className='static' ref={(n)=>renderedItems.push(n)}><Menu {...menuProps}/></div>
          </CSSTransition>
        </div>
    )
}

Menu.Item = Item;

export default Menu;
export {SelectableItem}