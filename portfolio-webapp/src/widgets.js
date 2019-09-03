import React, {useEffect,useState} from 'react';
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

export {InputWithEnter}
