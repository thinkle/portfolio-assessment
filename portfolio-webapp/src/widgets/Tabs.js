import React,{useState} from 'react';
import makeComponent from './QuickComponents';

function TopTab (props) {
    return <li {...props}>
             <a>
               {props.children}
             </a>
        </li>
}

const TabsTop = makeComponent(['tabs']);

function Tabs (props) {

    const [activeTab,setActiveTab] = useState(props.noInitialTab && -1 || 0);
    
    const children = React.Children.toArray(props.children);
    if (children % 2) {
        throw 'Tabs needs an even number of children';
    }
    const tabs = [];
    const contents = [];
    for (var i=0; i<children.length; i++) {
        if (i % 2) { // odd - but counting from 0 :)
            contents.push(children[i]);
        }
        else {
            tabs.push(children[i])
        }
    }

    return (
        /*<div className="tab-container">*/
        <React.Fragment>
          <TabsTop {...props}>
            <ul>
              {tabs.map((tab,i)=>
                        <TopTab key={i} className={i==activeTab ? 'is-active' : undefined} onClick={()=>setActiveTab(i)}>
                          {tab}
                        </TopTab>
                       )}
            </ul>
          </TabsTop>
          <div className="tab-content">
            {activeTab != -1 && contents[activeTab]}
          </div>
        </React.Fragment>
    );
    
}

export default Tabs;
