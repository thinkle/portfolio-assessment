import React, {useEffect,useState} from 'react';
import {classNames} from './utils.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSave,faExternalLinkAlt,faCheck,faTrash,faAngleDown,faAngleUp,faAngleRight,faAngleLeft,faPenSquare,faWindowClose} from '@fortawesome/free-solid-svg-icons'
const InputWithEnter = React.forwardRef( (props, ref) => {
    return (
        <input onKeyDown={
            function (e) {
                if (e.keyCode == 13) {
                    props.onEnter && props.onEnter();
                }
            }
        } defaultValue={props.defaultValue}  key={props.key} ref={ref}>
        </input>
    );
})

function Modal (props) {
    var body, footer;
    var arrayChildren = React.Children.toArray(props.children);
    if (arrayChildren.length == 2 ) {
        body = arrayChildren[0];
        footer = arrayChildren[1];
    }
    else {
        body = props.children
    }
    return (
            <div className={classNames(
                {modal:true,
                 'is-active':props.active}
            )}>
              <div className='modal-background'/>
              <div className='modal-content modal-card'>
                {props.title &&
                 <div className="modal-card-head">{props.title}</div>
                }
                <div className='modal-card-body'>{body}</div>
                {footer &&
                 <div className='modal-card-foot'>{footer}</div>
                }
              </div>
              <button className="modal-close is-large"
                      aria-label="close" onClick={props.onClose}
              />
            </div>
    );
}

function Card (props) {
    var head,body,footer;
    var arrayChildren = React.Children.toArray(props.children)
    if (arrayChildren.length==3) {
        [head,body,footer] = arrayChildren;
    }
    else if (arrayChildren.length==2) {
        [head,body] = arrayChildren;
    }
    else if (arrayChildren.length==1) {
        [body] = arrayChildren;
    }
    else {
        console.log('ERROR Card called with %s children?',arrayChildren.length)
        console.log('Use 1 child for Body, 2 for Head+Body or 3 for Head+Body+Footer');
        throw 'Card must have 1, 2 or 3 children';
    }

    return (
        <div className='card'>
          {head && <div className='card-header'>{head}</div>}
          <div className='card-content'>{body}</div>
          {footer && footer}
        </div>
    );
    
}

function Button (props) {
    var className = classNames({...props.classNames, button:true})
    if (props.className) {className += ' '+props.className}
    if (props.useButton) {
        return (<button className={className} onClick={props.onClick}>
                  {props.icon && <Icon icon={props.icon}/>}
                  <span>{props.children}</span>
                </button>)
    }
    else {
        return (<a className={className} onClick={props.onClick}>
                  {props.icon && <Icon icon={props.icon}/>}
                  <span>{props.children}</span>
                </a>)
    }
}

function Icon (props) {
    return (
        <span className={props.className||'' + classNames({
            ...props.classNames,
            icon:true,
            button:props.onClick,
            'is-white':props.onClick,
        })}
              onClick={props.onClick}
        >
          <FontAwesomeIcon icon={props.icon}/>
        </span>
    );
}

function makeComponent (myClassNames, elementType) {
    var myClassNameDic = {}
    myClassNames.forEach((i)=>myClassNameDic[i]=true);
    return function (props) {
        var className = classNames({...props.classNames, ...myClassNameDic})
        if (props.className) {className += ' '+props.className}
        if (elementType=='a') {
            return <a className={className} onClick={props.onClick}>{props.children}</a>
        }
        else if (elementType=='span') {
            return <span className={className} onClick={props.onClick}>{props.children}</span>
        }
        else {
            return <div className={className} onClick={props.onClick}>{props.children}</div>
        }
    }
}

Card.Footer = makeComponent(['card-footer']);
Card.FooterItem = makeComponent(['card-footer-item'],'a');
Card.Title = makeComponent(['card-header-title']);
Card.HeaderIcon = makeComponent(['card-header-icon'],'span');
const Buttons = makeComponent(['buttons']);
const Content = makeComponent(['content']);
const Container = makeComponent(['container']);


Icon.check =faCheck;
Icon.trash = faTrash;
Icon.save = faSave;
Icon.edit = faPenSquare;
Icon.close = faWindowClose;
Icon.down = faAngleDown;

Icon.up = faAngleUp;

Icon.right = faAngleRight;

Icon.left = faAngleLeft;
Icon.external = faExternalLinkAlt

export {InputWithEnter,Modal,Card,Button,Buttons,Content,Icon,Container}
