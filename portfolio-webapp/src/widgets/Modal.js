import React, {useEffect,useState} from 'react';
import {classNames} from '../utils.js';

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

export default Modal;
