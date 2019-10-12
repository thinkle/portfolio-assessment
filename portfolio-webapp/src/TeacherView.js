import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import CourseworkList from './CourseworkList.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import StudentPortfolio from './gapi/StudentPortfolio.js';
import TeacherPortfolioView from './TeacherPortfolioView.js';
import TeacherAssignmentView from './TeacherAssignmentView.js';
import PortfolioCreator from './PortfolioCreator.js';
import AssignmentMapper from './AssignmentMapper.js';
import Api from './gapi/gapi.js';
import {useTeacherCoursesApi} from './gapi/hooks.js';
import Brand from './brand.js';
import {Container,Menu,Navbar,Tabs,Button,Modal,Icon,Card,Viewport,h} from './widgets.js';
import history from './history.js';
import {inspect} from 'util';
import {useStudents,useStudentWork,useCoursework,useStudentPortfolioManager} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';


function TeacherView (props) {
    // View for an individual course -- this will be the common ancestor
    // we list portfolioManager state into...
    const [course,setCourse] = useState();    
    const [teacherViewMessage,setTeacherViewMessage] = useState();
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

    const CoursesApi = useTeacherCoursesApi({teacher:props.user},
                                      setCourseFromId
                                     );

    return (
        <Viewport.Bottom>
          {!course && <Container>
            <ClassList
              CoursesApi={CoursesApi}
              onCourseSelected={(course)=>{
                  doSetCourse(course);
              }}
            /></Container>
           ||
           <TeacherCourseView setTeacherViewMessage={setTeacherViewMessage} course={course} {...props}/>
          }
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
        </Viewport.Bottom>
    );

}

function TeacherCourseView (props) {


    const [message,setMessage] = useState('');

    const students = useStudents(props)
    const skillHookProps = usePortfolioSkillHook(props);
    const allStudentWork = useStudentWork({...props,teacherMode:true});
    const coursework = useCoursework(props);
    const portfolioManager = useStudentPortfolioManager(props);

    const propsToPassDown = {
        students,
        skillHookProps,
        allStudentWork,
        coursework,
        portfolioManager
    }

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

    const tabList = [
        {routeName:'home',
         label:props.course.name,
         element:home(),
        },
        {routeName:'assignment',
         label:'Assess By Assignments',
         element:<TeacherAssignmentView course={props.course} {...props} {...propsToPassDown}/>
        },
        {routeName:'portfolio',
         label:'Assess Portfolios',
         element:<TeacherPortfolioView course={props.course} {...props} {...propsToPassDown}
                                      onSelected={()=>updateRoute('portfolio')}
                 />},
        {routeName:'build',
         label:'Build Skill Portfolio',
         element:<PortfolioBuilder course={props.course} {...props} {...propsToPassDown}
                                  onSelected={()=>updateRoute('build')}
                 />,
        },
        {routeName:'map',
         label:'Map Skills to Assignments',
         element:<AssignmentMapper course={props.course} {...props} {...propsToPassDown}
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

    

    function home () {
        return (
            <Container>
              <Card>
                <h.h2>Stuff we can do...</h.h2>
                <Button onClick={()=>sharePortfolio()}>Share Portfolio w/ Class</Button>
              </Card>
              <PortfolioCreator {...props} students={students} portfolioManager={portfolioManager}/>
            </Container>
        )
    }

    function updateRoute (routeName) {
        history.push(`/teacher/${props.course.id}/${routeName}/`);
    }

    return (
        <div className='body'>
          <div style={{height:'100%'}}>
            <Viewport.Two>
              <Tabs className="is-centered" groupedMode={true}
                    initialTab={initialTabIndex}
              >
                <>{tabList.map(
                    (tabInfo)=><span>{tabInfo.label}</span>
                )}
                </>
                <>
                  {tabList.map(
                      (tabInfo)=>(
                          <div onSelected={()=>updateRoute(tabInfo.routeName)}>
                            {tabInfo.element}
                          </div>
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
          </div>
        </div>
    );

}

export default TeacherView;
