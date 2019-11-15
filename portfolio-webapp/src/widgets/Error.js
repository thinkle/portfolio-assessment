import React,{useState} from 'react';
import {inspect} from 'util';

function Error (props) {
    const [show,setShow] = useState();
    return <div className='error'>
             <h2 onClick={()=>setShow(!show)}>{props.name||'Error'}</h2>
             <p className={'fadeIn '+(show&&'active'||'inactive')}>
               {props.formatError && props.formatError(props.error) ||
                inspect(props.error)}
             </p>
           </div>
}

export default Error;
