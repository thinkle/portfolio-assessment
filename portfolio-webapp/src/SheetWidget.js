import {Icon} from './widgets.js';
import React,{useState} from 'react';

function SheetWidget (props) {
    
    const [showEmbed,setShowEmbed] = useState(true);

    var h = props.height || 800;
    var w = props.width || 1200;

    return (
        <div style={{position:'relative'}}>
          <a style={{position:'absolute',right:'2px',top:'2px'}} href={props.url} target="_blank">
            <Icon icon={Icon.external}/>
          </a>
          {showEmbed
           &&
           <div>
             {/* <a href="#" onClick={()=>setShowEmbed(false)}>Hide</a> */}
             <br/><iframe style={{height:h+'px', width:w+'px'}} height={h} width={w} src={props.url}/>
           </div>
           ||
           <a href="#" onClick={()=>setShowEmbed(true)}>Show</a>
          }
        </div>
    );
}

export default SheetWidget;
