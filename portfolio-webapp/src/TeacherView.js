import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import CourseworkList from './CourseworkList.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import StudentPortfolio from './gapi/StudentPortfolio.js';
import TeacherPortfolioView from './TeacherPortfolioView.js';
import TeacherAssignmentView from './TeacherAssignmentView.js';
import PortfolioCreator from './PortfolioCreator.js';
import AssignmentMapper from './AssignmentMapper.js';
import GradeExporter from './GradeExporter.js';
import Api from './gapi/gapi.js';
import {useTeacherCoursesApi} from './gapi/hooks.js';
import Brand from './brand.js';
import {Container,Menu,Navbar,Tabs,Button,Modal,Icon,Card,Viewport,h,Loader,Buttons} from './widgets.js';
import history from './history.js';
import {inspect} from 'util';
import {useStudents,useStudentWork,useCoursework,useStudentPortfolioManager} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';


function TeacherView (props) {
    // View for an individual course -- this will be the common ancestor
    // we list portfolioManager state into...
    const [course,setCourse] = useState();    
    const [teacherViewMessage,setTeacherViewMessage] = useState();
    const [initialStateReady,setInitialStateReady] = useState(false);
    
    console.log('Rerender TeacherView',props,course,teacherViewMessage,initialStateReady);

    function doSetCourse (course) {
        if (course) {
            history.push(`/teacher/${course.id}/`);
        }
        else {
            history.push(`/teacher/`);
        }
        setCourse(course);
    }

    function setCourseFromId () {
        if (props.courseId) {
            var myCourses = CoursesApi.value.filter((c)=>c.id==props.courseId)
            if (myCourses.length==1) {
                setCourse(myCourses[0]);
            }
            else {
                console.log('Error: course not found? or multiple found?')
                console.log('Had ID',props.courseId)
                console.log('Found',myCourses)
                console.log('Courses were:',CoursesApi.value);
            }
        }
    }



    function onCoursesReady () {
        setCourseFromId()
        setInitialStateReady(true);
        if (props.onReady) {
            props.onReady();
        }
    }

    const CoursesApi = useTeacherCoursesApi({teacher:props.user},
                                      onCoursesReady
                                     );

    return (
        <Viewport.Bottom>
          {!initialStateReady && <Loader>Loading Google Courses...</Loader>}
          {!course && initialStateReady && <Container>
            <ClassList
              CoursesApi={CoursesApi}
              onCourseSelected={(course)=>{
                  doSetCourse(course);
              }}
            /></Container>
           || course &&
           <TeacherCourseView setTeacherViewMessage={setTeacherViewMessage} course={course} {...props}/>
          }
        {course &&
          <Navbar>
            <Navbar.QuickBrand>
              {Brand.name}: Teacher Mode
            </Navbar.QuickBrand>
            <Navbar.Item>
              User: {JSON.stringify(props.user)}
            </Navbar.Item>
            <Navbar.Item>
              {teacherViewMessage}
            </Navbar.Item>
            <Navbar.Item>{course&&(
                <a  target="_blank" className="navbar-item" href={course.alternateLink}>{course.name}</a>
            )}
            </Navbar.Item>
            <Navbar.Item>
              {course &&
               <a className="navbar-item"
                  onClick={()=>doSetCourse()}
               >Switch course</a>
              }
            </Navbar.Item>
         </Navbar>
        }
        </Viewport.Bottom>
    );

}

function TeacherCourseView (props) {

    const [message,setMessage] = useState('');
    const [gotDataAndStuff,setGotDataAndStuff] = useState(0)
    const students = useStudents(props)
    const skillHookProps = usePortfolioSkillHook(props);
    const allStudentWork = useStudentWork({...props,teacherMode:true});
    const coursework = useCoursework(props);
    const portfolioManager = useStudentPortfolioManager(props);

    console.log('Rerender TeacherCourseView',props,message,gotDataAndStuff,students,
                skillHookProps,allStudentWork,coursework,portfolioManager)
    useEffect(()=>{
        console.log('TCV: Got data&stuff effect triggered: let us update our state!');
        const n = gotDataAndStuff + 1
        setGotDataAndStuff(n);
    },[students,coursework,allStudentWork,skillHookProps.key]
             )

    const propsToPassDown = {
        students,
        skillHookProps,
        allStudentWork,
        coursework,
        portfolioManager
    }

    const tabList = [
        {routeName:'home',
         label:props.course.name,
         element:<TeacherHome
                   key={gotDataAndStuff}
                   {...props}
                   {...propsToPassDown}
                   dataKey={gotDataAndStuff}
                 />
        },
        {routeName:'assignment',
         label:'Assess By Assignments',
         element:<TeacherAssignmentView key={gotDataAndStuff} course={props.course} {...props} {...propsToPassDown}/>
        },
        {routeName:'portfolio',
         label:'Assess Portfolios',
         element:<TeacherPortfolioView
                   key={gotDataAndStuff}
                   course={props.course}
                   {...props}
                   {...propsToPassDown}
                   onSelected={()=>updateRoute('portfolio')}
                 />},
        {routeName:'build',
         label:'Build Skill Portfolio',
         element:<PortfolioBuilder
                   key={gotDataAndStuff}
                   {...props}
                   {...propsToPassDown}
                   onSelected={()=>updateRoute('build')}
                 />,
        },
        {routeName:'map',
         label:'Map Skills to Assignments',
         element:<AssignmentMapper
                   key={gotDataAndStuff}
                   {...props}
                   {...propsToPassDown}
                   onSelected={()=>updateRoute('map')}/>
        },
    ]
    var initialTabIndex=undefined;
    if (props.task) {
        for (var i=0; i<tabList.length; i++) {
            if (tabList[i].routeName==props.task) {
                initialTabIndex=i;
            }
        }
        if (!initialTabIndex) {
            console.log('Did not find routeName ',props.task,tabList.map((t)=>t.routeName));
        }
    }

    function updateRoute (routeName) {
        console.log('TeacherView: updateRoute')
        history.push(`/teacher/${props.course.id}/${routeName}/`);
    }

    return (
        <div className='body'>
          <Viewport.Wrap>
            <Viewport.Two>
              <Tabs className="is-centered" groupedMode={true}
                    initialTab={initialTabIndex}
                    preload={true}
                    key={gotDataAndStuff}
              >
                <>{tabList.map(
                    (tabInfo)=><span>{tabInfo.label}</span>
                )}
                </>
                <>
                  {tabList.map(
                      (tabInfo)=>(
                          <Viewport.Wrap onSelected={()=>updateRoute(tabInfo.routeName)}>
                            {tabInfo.element}
                          </Viewport.Wrap>
                      ))}
                </>
              </Tabs>
            </Viewport.Two>
              <Modal active={message} onClose={()=>setMessage('')}>
                <Card>
                  <p>Complex processes at work...</p>
                  <p>{message}</p>
                  <Button icon={Icon.close} onClick={()=>setMessage('')}>Close</Button>
                </Card>
              </Modal>
          </Viewport.Wrap>
        </div>
    );

}

function TeacherHome (props) {

    const EXPORTA = 'exportA'
    const EXPORTG = 'exportG'
    const CREATE = 'createP'
    const SHAREP = 'shareP'
    
    const [tool,setTool] = useState('');
    const [message,setMessage] = useState('');

    async function sharePortfolio () {
        setMessage('Sharing portfolio with class... ');
        /** This may be unnecessary -- it seems like portfolios shared directly w/ students show up in 
           search unlike portfolios shared with groups. But if that's true maybe we can just share
           portfolios directly with students in the first place and we don't need any of this sharing
           infrastructure in which case FACE PALM
         **/
        // var allThePrefs = await Api.getPrefs().getProps();
        const propsToShare = {}
        // for (var key in allThePrefs) {
        //     if (key.match(StudentPortfolio.PORTPROP) || key.match(StudentPortfolio.GRADEPROP)) {
        //         console.log('SP: Prop is a portfolio prop!',key)
        //         if (key.match(course.id)) {
        //             propsToShare[key] = allThePrefs[key]
        //         }
        //         else {
        //             console.log('No dice');
        //         }
        //     }
        // }
        // console.log('Got matches? ',propsToShare);
        try {
            var resp = await Api.PortfolioDesc(props.course).share_with_class({otherProps:propsToShare}); // make sure the doc is shared...
            setMessage(`Shared portfolio with class group ${props.course.courseGroupEmail}. ${inspect(resp)}`);
        }
        catch (err) {
            setMessage(`Ran into trouble I am afraid... ${inspect(err)}`);
            console.log(err);
            
        }
    }



    return (
        <Container>
          <Card>
            <h.h3>Tools...</h.h3>
            <Buttons>
              <Button onClick={()=>setTool(CREATE)}>Create Portfolios for Students</Button>
              <Button onClick={()=>sharePortfolio()}>Share Portfolio w/ Class</Button>
              <Button onClick={()=>setTool(EXPORTA)}>Export Assignments</Button>
              <Button onClick={()=>setTool(EXPORTG)}>Export Grades</Button>
             </Buttons>
          </Card>
          {message && <Card>
                        <h.h6>Status Update...</h.h6>
                        <p>{message}</p>
                      </Card>}

           <GradeExporter
             {...props}
             {...props.skillHookProps}
             key={props.dataKey}
             active={tool==EXPORTG}
             onClose={()=>setTool('')}
             />
          {tool==CREATE && 
           <PortfolioCreator key={props.dataKey} {...props}/>
          }
          {tool==EXPORTA &&
           <p>Refactoring coming soon... for now this is under Build Skill Portfolio</p>
          }
        </Container>
    )
    
        
}

export default TeacherView;
