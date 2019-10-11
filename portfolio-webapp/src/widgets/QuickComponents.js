import React from 'react';
import {classNames} from '../utils.js';

function mergeClassNames (myClassNames, props) {
    var myClassNameDic = {}
    myClassNames.forEach((i)=>myClassNameDic[i]=true);
    var className = classNames({...props.classNames, ...myClassNameDic})
    if (props.className) {className += ' '+props.className}
    return className
}

function makeComponent (myClassNames, elementType='div') {
    
    var f = function (props) {
        const className = mergeClassNames(myClassNames,props);
        // if (elementType=='a') {
        //     return <a className={className} onClick={props.onClick}>{props.children}</a>
        // }
        // else if (elementType=='span') {
        //     return <span className={className} onClick={props.onClick}>{props.children}</span>
        // }
        // else if (elementType) {
        //     return React.createElement(
        return React.createElement(
            elementType,
            {...props,className:className},
            props.children
        )
        // else {
        //     return <div className={className} onClick={props.onClick}>{props.children}</div>
        // }
    }
    if (myClassNames.length) {
        // for inspector...
        function makeName (name) {
            var names = name.split('-')
            name = names.map((s)=>s[0].toUpperCase()+s.substr(1)).join('')
            return name
        }
        f.displayName = myClassNames.map(makeName).join('.');
    }
    return f;
}

export default makeComponent;
export {mergeClassNames}
