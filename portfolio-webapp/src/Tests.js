import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import SkillsList from './SkillsList.js';
import SheetWidget from './SheetWidget.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import Editor from './RichText.js';
import Setting from './settings.js';
//import Api from './api.js';
import Api from './gapi/gapi.js';
import Gapi from './gapi/gapiLoader.js';
import DocumentManager from './gapi/DocumentManager.js';
import Sheets from './gapi/SheetBasics.js';
import SheetManager from './gapi/SheetManager.js';
import Prefs from './gapi/Prefs.js';

function TestView () {
    const [page,setPage] = useState('gapi')
    const [prop,setProp] = useState(undefined);
    var setting = Setting({name:'test-123',
                           data : {
                               testId : 'dummy-placeholder-value',
                               now : new Date(),
                               numerals : 24,
                               decimals: 3.33333333333333333
                           }})
    const [testId,setTestId] = useState(setting.data.testId);
    const [testUrl,setTestUrl] = useState('');
    const [testData,setTestData] = useState('');
    const prefs = Prefs();

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
            <button className="button" onClick={()=>setPage('gapi')}>Test GApi</button>
            <button className="button" onClick={()=>{setTestUrl('http://www.google.com');setTestData({test:'me',hello:'world'})}}>Test TestData & URL</button>
            <button className="button" onClick={()=>{
                var val = 'foo' + Math.random()
                Api.setProp('foo',val).then((v)=>setProp(v))}
                                               }>Set Foo Prop</button>
            <button className="button" onClick={()=>{
                var val = {name:'Tom',age:Math.random()*40+20,height:Math.random()*24+60+' inches'}
                Api.setProp('foo',val).then((v)=>setProp(v))}
                                               }>Set Foo Prop to JSON magic</button>
            <button className='button' onClick={()=>{
                prefs.createPropFile().then((result)=>console.log('success! %s',JSON.stringify(result)));
            }}>Create new pref file...</button>

            <button className='button' onClick={()=>{
                prefs.getPropFile().then((result)=>console.log('success! %s',JSON.stringify(result)));
            }}>Test new pref interface...</button>

            <button className='button' onClick={()=>{
                prefs.getProps().then((result)=>setTestData(result))
            }}>Show props</button>
            <button className='button' onClick={()=>{
                prefs.setProp('foo','val'+Math.random());
            }}>Update prop!</button>
            <button className='button' onClick={()=>{
                prefs.getPropFile().
                    then((id)=>{
                        prefs.updateFile(id,{foo:'bar',new:'baz',bang:'booo'})
                    });
            }}>Clobber props!</button>

            <button className='button'
                    onClick={()=>{
                        DocumentManager().createSheet(
                            'testTitle',
                            [
                                {
                                    title:'Names',
                                    data:[['First','Last'],
                                          ['Tom','Hinkle'],
                                          ['Kat','Hinkle']
                                         ]
                                },
                                {
                                    title:'Birthdays',
                                    data:[
                                        ['name','bday'],
                                        ['Tom',new Date(1979,1,21)],
                                        ['Kat',new Date(1980,4,11)],
                                        ['Grace',new Date(2007,10,13)],
                                        ['Clara',new Date(2009,8,22)],
                                        ['Lila',new Date(2011,6,26)]
                                    ]
                                }
                                ]
                        ).then(
                            (result)=>{
                                console.log('Got result! %s',JSON.stringify(result))
                                setTestUrl(result.spreadsheetUrl)
                            }
                        )
                    }
                            }
            >Test Create Sheet (raw)
            </button>
            <button className='button'
                    onClick={()=>{
                        DocumentManager()
                            .createSheetForProp(
                                'testcourse',
                                'fakeProp',
                                'A New Sheet',
                                [{name:'Name sheet',rowData:Sheets.jsonToRowData([{name:'Tom',age:40},{name:'Kat',age:39},{name:'Grace',age:11}])},
                                 {name:'Dates?',rowData:Sheets.jsonToRowData([{date:new Date(),name:'Today!'},{date:'some time',name:'FoO!'}])},
                                 {name:'Straight Data?',data:[[1,2,3],[4,5,6],[7,8,9]]},
                                 ]
                            ).then((data)=>{
                                setTestData(data);
                                setTestUrl(data.spreadsheetUrl);
                            })
                    }}
            >
              Test Create Sheet for Course
            </button>
            <button className='button'
                    onClick={
                        ()=>{SheetManager('1EDFnmkEUgH-3wjMHFQk1EOtV5sUMco_esBKfvw2nVlk').getJson('Birthdays').then(
                            (result)=>{
                                console.log('Got data: %s',JSON.stringify(result));
                                setTestData(result)
                            }
                        )
                            }
                    }>Test Read Sheet
        </button>
        <button className='button'
        onClick={()=>{
            SheetManager('1mlEdDoe_dnu8RxKbknCIG-1fXDXawnEWoZEhl-FcDuY')
                .updateData(
                    [
                        {title:'worry',
                         data:[[1,2,3,],[2,4,6],[3,6,9],[4,8,12],[new Date(),'no more worries','sleep well']]},
                        {title:'nooboodoogoo',
                         data:[[7,6,5],[4,3,2],[2,1,0],['a','b','c']]}
                    ]
                )
                .then((r)=>setTestData(r));
            
        }}>Test Update Sheet</button>
            
          </div>


          <div>
            {testUrl && <a href={testUrl} target='blank'>Test URL was created!</a>}
            {testData && <pre>TEST DATA:
                           {JSON.stringify(testData)}</pre>}
          </div>
          
          <div>{page=='courses' && <ClassList onCourseSelected={(c)=>console.log('Selected course %s',JSON.stringify(c))} user='thinkle@innovationcharter.org'></ClassList>}</div>
          <div>{page=='portfolio' && <SkillsList></SkillsList>}</div>
          {prop && <p>{JSON.stringify(prop)} {prop.name}</p>}
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
          {page=='gapi' && (<div>GAPI:<Gapi/></div>)}
        </div>
    );
}

export default TestView;
