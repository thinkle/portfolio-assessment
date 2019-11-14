import React from 'react';
import './widgetUtils.sass'

function requireProps (props,plist) {
    const missing = [];
    for (var p of plist) {
        if (!props.hasOwnProperty(p)) {
            missing.push(p)
        }
    }
    if (missing.length) {
        throw {
            name : 'Missing properties',
            required : plist,
            missing : missing,
            element : <div className='renderError error'>Missing Required Props: {missing.join(', ')} (of {plist.join(', ')})</div>
        }
    }
}

export {requireProps}
