import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import SkillsList from './SkillsList.js';
import SheetWidget from './SheetWidget.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import Editor from './RichText.js';
import Setting from './settings.js';
import Api from './api.js';


function TestView () {
    const [page,setPage] = useState('none')
    const [prop,setProp] = useState(undefined);
    var setting = Setting({name:'test-123',
                           data : {
                               testId : 'dummy-placeholder-value',
                               now : new Date(),
                               numerals : 24,
                               decimals: 3.33333333333333333
                           }})
    const [testId,setTestId] = useState(setting.data.testId);    

    return (
        <div>
          <h2>Test API</h2>
          <div className="buttons">          
            <button className="button" onClick={()=>setting.data.testId = 'zz'+Math.random()+'asieasdf'}>Change Setting</button>
            <button className="button" onClick={()=>setting.saveLocal()}>Save Local</button>
            <button className="button" onClick={()=>{setting.loadFromLocal(); setTestId(setting.data.testId)}}>Load Local</button>
            <button className="button" onClick={()=>setting.loadFromRemote().then(()=>setTestId(setting.data.testId))}>Load Saved Google Setting from Remote</button>
            <button className="button" onClick={()=>{
                setting.saveRemote()
                    .then((s)=>{console.log('set our id to %s',s.data.testId); setTestId(s.data.testId)})
            }}>Save Setting</button>
            <button className="button" onClick={()=>setPage('courses')}>List Classes</button>
            <button className="button" onClick={()=>setPage('builder')}>Build Portfolio</button>
            <button className="button" onClick={()=>setPage('embed')}>Test Embed</button>
            <button className="button" onClick={()=>setPage('portfolio')}>Show Portfolio</button>
            <button className="button" onClick={()=>Api.testPost()}>Test Post</button>
            <button className="button" onClick={()=>Api.testLongGet()}>Test Long Get</button>
            <button className="button" onClick={()=>Api.getProp('foo').then((v)=>setProp(v))}>Get Foo Prop</button>
            <button className="button" onClick={()=>setPage('editor')}>Test Editor</button>
            <button className="button" onClick={()=>{
                var val = 'foo' + Math.random()
                Api.setProp('foo',val).then((v)=>setProp(v))}
                                               }>Set Foo Prop</button>
            <button className="button" onClick={()=>{
                var val = {name:'Tom',age:Math.random()*40+20,height:Math.random()*24+60+' inches'}
                Api.setProp('foo',val).then((v)=>setProp(v))}
                                               }>Set Foo Prop to JSON magic</button>
          </div>

          <div>{page=='courses' && <ClassList></ClassList>}</div>
          <div>{page=='portfolio' && <SkillsList></SkillsList>}</div>
          {prop && <p>{JSON.stringify(prop)} {prop.name}</p>}
          <div>
            <h3>API test links</h3>
            <a target='blank' href={Api.getUrl('get_teacher_classes','thinkle@innovationcharter.org')}>
              Get teacher classes
            </a>
            <a target='blank' href={Api.getUrl('get_sheet','1RP7wlpGOrrfUbdvBXKYvRygomATov6DTp1OocBEinqI')}>
              Get sheet
            </a>
          </div>
          SETTING: {testId}
          
          {page=='builder' && <PortfolioBuilder courseId='test2'/>}
          {page=='editor' &&
           (
               <div>
                 <h3>Rich Text Editor Test!</h3>
                 <Editor onChange={(html)=>console.log('HTML UPDATED: %s',html)} editorHtml={`<ul>
<li>Type your</li>
<li>List of</li>
<li>indicators here.</li>
</ul>`}/>
               </div>
           )}
          {page=='embed' && <SheetWidget url="https://docs.google.com/spreadsheets/d/1RP7wlpGOrrfUbdvBXKYvRygomATov6DTp1OocBEinqI/edit#gid=0"/>}
          
        </div>
    );
}

export default TestView;
