import React from 'react';
import {classNames} from '../utils.js';

function makeComponent (myClassNames, elementType) {
    var myClassNameDic = {}
    myClassNames.forEach((i)=>myClassNameDic[i]=true);
    var f = function (props) {
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
