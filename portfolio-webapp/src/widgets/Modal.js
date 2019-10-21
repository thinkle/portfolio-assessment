import React, {useEffect,useState} from 'react';
import {classNames} from '../utils.js';
import './Modal.sass';
import {CSSTransition} from 'react-transition-group';

const animationNames = {
    enter : 'is-active fade-enter-start',
    enterActive : 'is-active fade-enter-active',
    enterDone : 'is-active fade-enter-done',
    exit : 'is-active fade-exit',
    exitActive : 'is-active fade-exit-active',
    exitDone : 'fade-exit-done',
}
    
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
    var className = classNames({...props.classNames,
                                'modal-content':true,
                                'is-opaque':true}
                              );
    if (props.className) {
        className += ' '+props.className;
    }
    return (
          <CSSTransition
            timeout={400}
            classNames={animationNames} 
            transitionLeaveTimeout={500}
            transitionEnterTimeout={500}
            transitionAppear={true}
            in={props.active}
          >
            <div className={classNames({modal:true,})}>

          <div className='modal-background'/>
            <div className={className}>
              {props.title && <h2 className='title'>{props.title}</h2>}
              {body}
              {footer}
            </div>

          <button className='modal-close is-large' aria-label='close' onClick={props.onClose}/>
        </div>
          </CSSTransition>

    );
}

function ModalCard (props) {
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
          <CSSTransition
            timeout={400}
            classNames={animationNames}
            in={props.active}
          >
            <div className={classNames(
                {modal:true,
                }
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
        </CSSTransition>
    );
}

Modal.ModalCard = ModalCard

export default Modal;
