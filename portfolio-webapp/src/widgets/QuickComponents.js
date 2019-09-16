import React from 'react';
import {classNames} from '../utils.js';

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

export default makeComponent;
