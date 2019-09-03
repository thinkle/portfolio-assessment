import React,{useState} from 'react';

function SheetWidget (props) {
    
    const [showEmbed,setShowEmbed] = useState(true);

    return (
        <div>
          <a href={props.url} target="_blank">New window?</a>
          {showEmbed
           &&
           <div>
             <a href="#" onClick={()=>setShowEmbed(false)}>Hide</a>
             <br/><iframe width={props.width||1200} height={props.height||800} src={props.url}/>
           </div>
           ||
           <a href="#" onClick={()=>setShowEmbed(true)}>Show</a>
          }
        </div>
    );
}

export default SheetWidget;
