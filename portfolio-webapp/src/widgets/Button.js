import React, {useEffect,useState} from 'react';
import Icon from './Icon.js';
import {classNames} from '../utils.js';


function Button (props) {
    var className = classNames({...props.classNames, button:!props.linkStyle})
    if (props.className) {className += ' '+props.className}
    if (props.useButton || props.disabled) {
        return (<button  {...props} className={className} onClick={props.onClick} disabled={props.disabled}>
                {props.customIcon || props.icon && <Icon icon={props.icon}/>}
                {props.children && <span>{props.children}</span>}
                </button>)
    }
    else {
        return (<a  {...props} className={className} onClick={props.onClick} disabled={props.disabled}>
                  {props.customIcon || props.icon && <Icon icon={props.icon}/>}
                  {props.children && <span>{props.children}</span>}
                </a>)
    }
}

function Toggle (props) {
    const classNames = {
        ...props.classNames,        
    }
    return <Button {...props}
                   icon={props.active && Icon.toggleOn || Icon.toggleOff}
                   classNames={classNames}>{props.children}</Button>
}

Button.Toggle = Toggle;

export default Button;
