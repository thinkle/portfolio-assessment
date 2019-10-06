import React,{useState,useEffect} from 'react';
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

    const [activeTab,setActiveTab] = useState(props.noInitialTab && -1 || props.initialTab || 0);
    const [fresh,setFresh] = useState(true)
    var tabs = [];
    var contents = [];
    
    if (props.groupedMode) {
        const children = React.Children.toArray(props.children);
        if (children.length != 2) {
            throw 'Tabs needs exactly 2 children in grouped mode';
        }
        else {
            tabs = children[0].props.children
            contents = children[1].props.children
        }
    }
    else { // flat
        const children = React.Children.toArray(props.children);
        if (children.length % 2) {
            throw 'Tabs needs an even number of children in flat mode';
        }
        else {
            console.log('Tab got %s children',children.length);
            console.log('Children are: ',children);
        }
        for (var i=0; i<children.length; i++) {
            if (i % 2) { // odd - but counting from 0 :)
                contents.push(children[i]);
            }
            else {
                tabs.push(children[i])
            }
        }
    }

    useEffect(()=>{
        if (!fresh) {
            console.log('Tab changed!');
            console.log('New child is',contents[activeTab]);
            if (props.onChange) {
                props.onChange({
                    tabNumber:activeTab,
                    contents:contents[activeTab],
                    tab:tabs[activeTab]
                });
            }
            if (contents[activeTab].props.onSelected) {
                contents[activeTab].props.onSelected()
            }
        }
        else {
            setFresh(false);
        }
    },[activeTab]);

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
