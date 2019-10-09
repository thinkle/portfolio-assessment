import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import SkillsList from './SkillsList.js';
import SheetWidget from './SheetWidget.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import ExemplarEditor from './ExemplarEditor.js';
import Editor from './RichText.js';
import Setting from './settings.js';
//import Api from './api.js';
import Api from './gapi/gapi.js';
import Gapi from './gapi/gapiLoader.js';
import DocumentManager from './gapi/DocumentManager.js';
import Sheets from './gapi/SheetBasics.js';
import SheetManager from './gapi/SheetManager.js';
import Prefs from './gapi/Prefs.js';
import AssignmentMapper from './AssignmentMapper.js';
import Portfolio from './Portfolio.js';
import {Button,Buttons,SelectableItem,Box,h,Container} from './widgets.js';
import Menu from './widgets/Menu.js';
import Tabs from './widgets/Tabs.js';
import TeacherAssignmentView from './TeacherAssignmentView.js';


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
    const [testUrls,setTestUrls] = useState([]);
    const [testState,setTestState] = useState(3);
    const [showButtons,setShowButtons] = useState(true);
    const [studentMode,setStudentMode] = useState(false);
    
    useEffect(
        ()=>{
            var urls = []
            if (testData && testData.forEach) {
                testData.forEach(findUrlsInObject);
            }
            else if (testData && typeof testData=='object') {
                findUrlsInObject(testData)
            }
            function findUrlsInObject (o) {
                for (var key in o) {
                    if (key.toLowerCase().indexOf('url') >-1) {
                        urls.push(
                            {name:key,
                             url:o[key]}
                        );
                    }
                    if (key.toLowerCase().indexOf('id') > -1 || key.toLowerCase().indexOf('portfolio') > -1) {
                        if (key.toLowerCase().indexOf('folder') > -1) {
                            urls.push(
                                {name:key,
                                 url:'https://drive.google.com/drive/folders/'+o[key]
                                });
                        }
                        else {
                            urls.push(
                                {name:key,
                                 url:'https://drive.google.com/file/d/'+o[key]}
                            );
                        }
                    }
                }
            }
            
            setTestUrls(urls);
        
        },[testData]);
    
    const prefs = Prefs();


    const defaultStudent = {
        "courseId":"20912946613",
        "userId": "109899082656923697222",
        "profile":{"id":"118286616169423182268",
                   "name":{"givenName":"Test","familyName":"Student","fullName":"Test Student"},
                   emailAddress:'test.student@innovationcharter.org',                   
                  },
    }

    const defaultCourse = {
        "id": "20912946613",
        "name": "Web Design 1",
        "section": "Fall 2019",
        "descriptionHeading": "Web Design 1 Fall 2019",
        "room": "241",
        "ownerId": "113561106451202000689",
        "creationTime": "2019-08-29T10:18:54.365Z",
        "updateTime": "2019-08-29T10:18:53.333Z",
        "enrollmentCode": "mxji4e0",
        "courseState": "ACTIVE",
        "alternateLink": "https://classroom.google.com/c/MjA5MTI5NDY2MTNa",
        "teacherGroupEmail": "Web_Design_1_Fall_2019_teachers_4eace9b4@innovationcharter.org",
        "courseGroupEmail": "Web_Design_1_Fall_2019_146614c0@innovationcharter.org",
        "teacherFolder": "Object",
        "guardiansEnabled": true,
        "calendarId": "innovationcharter.org_classroom5d9c6d99@group.calendar.google.com"
    }

    return (
        <div>
          <h.h2>Tests</h.h2>
          {widgets()}
          {buttons()}
          {data()}
        </div>

    );

    function buttons () {
        return <Box>
            {!showButtons && <Button onClick={()=>setShowButtons(true)}>(show test buttons)</Button>}
            <div style={{
                display : showButtons || 'none',
            }}>
              <Button onClick={()=>setShowButtons(false)}>(hide test buttons)</Button>
              <Buttons>
                <Button onClick={()=>setStudentMode(false)}>Teacher Mode</Button>
                <Button onClick={()=>setStudentMode(true)}>Student Mode</Button>
              </Buttons>
              <Box>
                <h.h3>Properties</h.h3>
                <Button onClick={()=>Api.getProp('foo').then((v)=>setProp(v))}>Get Foo Prop</Button>
                <Button onClick={()=>{
                    var val = 'foo' + Math.random()
                    Api.setProp('foo',val).then((v)=>setProp(v))}
                                }>Set Foo Prop</Button>
                <Button onClick={()=>{
                    var val = {name:'Tom',age:Math.random()*40+20,height:Math.random()*24+60+' inches'}
                    Api.setProp('foo',val).then((v)=>setProp(v))}
                                }>Set Foo Prop to JSON magic</Button>
                <Button onClick={()=>{
                    prefs.createPropFile().then((result)=>console.log('success! %s',JSON.stringify(result)));
                }}>Create new pref file...</Button>

                <Button onClick={()=>{
                    prefs.getPropFile().then((result)=>console.log('success! %s',JSON.stringify(result)));
                }}>Test new pref interface...</Button>

                <Button onClick={()=>{
                    prefs.getProps().then((result)=>setTestData(result))
                }}>Show props</Button>
                <Button onClick={()=>{
                    prefs.setProp('foo','val'+Math.random());
                }}>Update prop!</Button>
                <Button onClick={()=>{
                    async function foo () {
                        var p = await prefs.getProps();
                        var id = await prefs.getPropFile();
                        delete p['error']
                        prefs.updateFile(id,p);
                    }
                    foo();
                }}>Remove bad prop</Button>
                <button className="button is-danger" onDoubleClick={()=>{
                    prefs.getPropFile().
                        then((id)=>{
                            prefs.updateFile(id,{foo:'bar',new:'baz',bang:'booo'})
                        });
                }}>Clobber props! (dblclk)</button>
                <button className="button is-danger" onDoubleClick={()=>{window.localStorage.clear()}}>CLEAR LOCALSTORAGE (dblclk)</button>
              </Box>
              {/* <Box> */}
              {/*   <h.h3>UI</h.h3> */}
              {/*   <Button onClick={()=>setPage('exemplar')}>Test EXEMPLAR EDITOR</Button> */}
              {/*   <Button onClick={()=>setPage('portf')}>Show Portf</Button> */}
              {/*   <Button onClick={()=>setPage('assm')}>Show Assignment Mapper</Button> */}
              {/*   <Button onClick={()=>setPage('courses')}>List Classes</Button> */}
              {/*   <Button onClick={()=>setPage('builder')}>Build Portfolio</Button> */}
              {/*   {/\* <Button onClick={()=>setPage('embed')}>Test Embed</Button> *\/} */}
              {/*   {/\* <Button onClick={()=>setPage('portfolio')}>Show Portfolio</Button> *\/} */}
              {/* </Box> */}
              <Box>
                <h.h3>Drive/Docs</h.h3>
                <Button onClick={
                    ()=>Api.StudentPortfolio(defaultCourse,defaultStudent).get_portfolio_data().then(setTestData)
                }>Get portfolio...</Button>
                <Button onClick={
                    ()=>Api.StudentPortfolio(defaultCourse,defaultStudent).get_updated_time().then(setTestData)
                }>Get modified time on portfolio item...</Button>
                <Button onClick={
                    ()=>{
                        DocumentManager().createStudentSheet(
                            defaultCourse,
                            defaultStudent,
                            'sample-prop',
                            'Test Spreadsheet',
                            [{rowData:Sheets.jsonToRowData([{hello:'world'},{hello:'sheets'},{hello:'moon'},{hello:'sun'}]),
                              title:'howdy'}]
                        ).then(setTestData);
                    }
                }>
                  Test Create Student Sheet
                </Button>
                <Button onClick={()=>DocumentManager().addMetadata().then(setTestData)}>Set MEtadata</Button>
                <Button onClick={()=>DocumentManager().getRootFolderId().then(setTestData)}>Create root folder?
                </Button>
                <Button onClick={()=>{
                    DocumentManager().getCourseFolder({title:'Test Course',id:'test-course-id'}).then(setTestData);
                }}>
                  createTestClassFolder
                </Button>
                
                <Button
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
                </Button>
                <Button
                  onClick={()=>{
                      DocumentManager()
                          .createSheetForProp(
                              {title:'testcourse',id:'test-id'},
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
                </Button>

                <Button
                  onClick={
                      ()=>{SheetManager('1EDFnmkEUgH-3wjMHFQk1EOtV5sUMco_esBKfvw2nVlk').getJson('Birthdays').then(
                          (result)=>{
                              console.log('Got data: %s',JSON.stringify(result));
                              setTestData(result)
                          }
                      )
                          }
                  }>Test Read Sheet
                </Button>
                <Button
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
                      
                  }}>Test Update Sheet</Button>

                <Button
                  onClick={()=>{
                      async function doIt () {
                          var response = await window.gapi.client.drive.files.list(
                              {spaces:'drive',
                               q:'appProperties has {key="courseId" and value="20912946613"}',
                              }
                          );
                          setTestData(response.result.files);
                      }
                      doIt();
                  }}
                >Test Property Query
                </Button>

              </Box>
              <Box>
                <h.h3>Other APIs</h.h3>
                <Button onClick={()=>setPage('gapi')}>Test GApi</Button>
                <Button onClick={()=>{
                    async function test () {
                        console.log('fetch coursework...',defaultCourse.id);
                        var cwList = await Api.Classroom.get_coursework({course:defaultCourse});
                        console.log('Fetch student work...');
                        var work = await Api.Classroom.get_student_work({course:defaultCourse,courseWork:cwList[0],teacherMode:!studentMode})
                        console.log('Got it!');
                        setTestData(work);
                    }
                    test();
                } }>Get Student Work</Button>
                <Button onClick={()=>{
                    async function test () {
                        var students = await Api.Classroom.get_students({course:defaultCourse});
                        setTestData(students);
                    };
                    test();
                }}>Get Students</Button>

              </Box>


            <Button onClick={()=>Api.testPost()}>Test Post</Button>
            <Button onClick={()=>Api.testLongGet()}>Test Long Get</Button>
            <Button onClick={()=>{setTestUrl('http://www.google.com');setTestData({test:'me',hello:'world'})}}>Test TestData & URL</Button>
        </div>
        </Box>
    }

    function data() { 
        return <div><h.h3>Test Data and Stuff...</h.h3>
            {testData && <pre>TEST DATA:
                           {JSON.stringify(testData)}</pre>}

          <div>
            {testUrl && <a target="_blank" href={testUrl} target='blank'>Test URL was created!</a>}
            {testUrls &&
             testUrls.map(
                 (urlData)=><span>|<a target="_blank"  href={urlData.url}>{urlData.name}</a>|</span>
             )}
          </div>
            {prop && <p>{JSON.stringify(prop)} {prop.name}</p>}
            SETTING: {testId}
          </div>
    }

    function widgets () {
        return (
          <Tabs>

            <span>Widgets!</span>
            <div>
              <div style={{height:100}}/>
              <hr/>
              <div>
                <h.h2>Dropdown menu!</h.h2>
                <Menu dropdown={true} items={[1,2,3,4,5,6]} itemRenderer={Menu.Item} initialValue={testState} onSelected={setTestState}/>
              </div>
              <div>
                <SelectableItem title="Test me"
                                items={[1,2,3,4,5,6,7]}
                                itemRenderer={Menu.Item}
                                onSelected={console.log}
                >
                  
                </SelectableItem>
                <Box>
                  <h.h3>Tabs!</h.h3>
                  <Tabs onChange={(o)=>console.log('Test Tab selected: got description',o)}>
                    <span>Hello</span>
                    <div onSelected={()=>console.log('hello selected!')}>Hello World</div>
                    <span>Goodbye</span>
                    <div onSelected={()=>console.log('goodbye selected!')}>See you around!</div>
                  </Tabs>
                </Box>
                <Box>
                  <h.h3>Tabs Grouped Mode!</h.h3>
                  <Tabs groupedMode={true}>
                    <div>
                      <span>Head1</span><span>Head2</span><span>Head3</span>
                    </div>
                    <div>
                      <p>Howdy 1</p>
                      <p>Howdy 2</p>
                      <p>Howdy 3</p>
                    </div>
                  </Tabs>
                </Box>
              </div>
            </div>

            <span>Teacher Assessment View</span>
            <TeacherAssignmentView course={defaultCourse}/>

            <span>Portfolio</span>
            <div>
              <Button onClick={()=>setStudentMode(false)}>Teacher Mode</Button>
              <Button onClick={()=>setStudentMode(true)}>Student Mode</Button>
              {studentMode && <h.h2>Student View</h.h2> || <h.h2>Teacher View</h.h2>}
              <Portfolio course={defaultCourse} student={defaultStudent}
                         teacherMode={!studentMode}
              />
              
            </div>

            <span>Assignment Mapper</span>
            <AssignmentMapper course={defaultCourse}/>

            <span>Course List</span>
            <ClassList onCourseSelected={(c)=>console.log('Selected course %s',JSON.stringify(c))} user='thinkle@innovationcharter.org'></ClassList>

            {/* <span>Skills List</span> */}
            {/* <SkillsList></SkillsList> */}
            
            <span>Builder</span>
            <PortfolioBuilder course={defaultCourse}/>
            <span>Rich Text</span>
            <div>
              <h3>Rich Text Editor Test!</h3>
              <Editor onChange={(html)=>console.log('HTML UPDATED: %s',html)} editorHtml={`<ul>
<li>Type your</li>
<li>List of</li>
<li>indicators here.</li>
</ul>`}/>
            </div>

            <span>Embedded</span>
            <SheetWidget url="https://docs.google.com/spreadsheets/d/1RP7wlpGOrrfUbdvBXKYvRygomATov6DTp1OocBEinqI/edit#gid=0"/>
            <span>Exemplar Editor</span>
            <div>
              <h2>Student Version</h2>
              <ExemplarEditor
                student={defaultStudent}
                course={defaultCourse}
                onChange={console.log}
                mode='student'
              />
             <h2>Teacher Version</h2>
              <ExemplarEditor
                student={defaultStudent}
                course={defaultCourse}
                onChange={console.log} mode='teacher'
              />
            </div>

          </Tabs>
        );
    }
}



export default TestView;
