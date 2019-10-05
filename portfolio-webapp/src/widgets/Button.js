import React, {useEffect,useState} from 'react';
import Icon from './Icon.js';
import {classNames} from '../utils.js';

function Button (props) {
    var className = classNames({...props.classNames, button:true})
    if (props.className) {className += ' '+props.className}
    if (props.useButton || props.disabled) {
        return (<button className={className} onClick={props.onClick} disabled={props.disabled}>
                  {props.icon && <Icon icon={props.icon}/>}
                  <span>{props.children}</span>
                </button>)
    }
    else {
        return (<a className={className} onClick={props.onClick} disabled={props.disabled}>
                  {props.icon && <Icon icon={props.icon}/>}
                  <span>{props.children}</span>
                </a>)
    }
}
export default Button;
