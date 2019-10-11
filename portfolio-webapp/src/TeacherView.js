import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import CourseworkList from './CourseworkList.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import StudentPortfolio from './gapi/StudentPortfolio.js';
import TeacherPortfolioView from './TeacherPortfolioView.js';
import TeacherAssignmentView from './TeacherAssignmentView.js';
import AssignmentMapper from './AssignmentMapper.js';
import Api from './gapi/gapi.js';
import {useTeacherCoursesApi} from './gapi/hooks.js';
import Brand from './brand.js';
import {Container,Menu,Navbar,Tabs,Button,Modal,Icon,Card,Viewport} from './widgets.js';
import history from './history.js';
import {inspect} from 'util';

function TeacherView (props) {

    const [course,setCourse] = useState();
    const [message,setMessage] = useState('');
    
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
            var resp = await Api.PortfolioDesc(course).share_with_class({otherProps:propsToShare}); // make sure the doc is shared...
            setMessage(`Shared portfolio with class group ${course.courseGroupEmail}. ${inspect(resp)}`);
        }
        catch (err) {
            setMessage(`Ran into trouble I am afraid... ${inspect(err)}`);
            console.log(err);
            
        }
    }

    const tabList = [
        {routeName:'assignment',
         label:'Assess By Assignments',
         element:<TeacherAssignmentView course={course} {...props}/>
        },
        {routeName:'portfolio',
         label:'Assess Portfolios',
         element:<TeacherPortfolioView course={course} {...props}
                                      onSelected={()=>updateRoute('portfolio')}
                 />},
        {routeName:'build',
         label:'Build Skill Portfolio',
         element:<PortfolioBuilder course={course} {...props}
                                  onSelected={()=>updateRoute('build')}
                 />,
        },
        {routeName:'map',
         label:'Map Skills to Assignments',
         element:<AssignmentMapper course={course} {...props}
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

    
    function doSetCourse (course) {
        if (course) {
            history.push(`/teacher/${course.id}/`);
        }
        else {
            history.push(`/teacher/`);
        }
        setCourse(course);
    }

    function updateRoute (routeName) {
        if (course) {
            history.push(`/teacher/${course.id}/${routeName}/`);
        }
        else {
            history.push(`/teacher${routeName}/`);
        }
    }

    return (
        <Viewport.Bottom>
          <div className='body'>
            {
                course && tabs() ||
                    <Container>
                      <ClassList
                        CoursesApi={CoursesApi}
                        onCourseSelected={(course)=>{
                            doSetCourse(course);
                        }}
                      /></Container>
                    
            }
          </div>
          <Navbar>
            <Navbar.QuickBrand>
              {Brand.name}: Teacher Mode
            </Navbar.QuickBrand>
            <Navbar.Item>
              User: {JSON.stringify(props.user)}
            </Navbar.Item>
            <Navbar.Item>
              {course && <Button onClick={()=>sharePortfolio()}>Share Portfolio w/ Class</Button>}
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
    )

    function tabs () {
        return (
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
                {/* <span> */}
                {/*   Assess Student Portfolios */}
                {/* </span> */}
                {/* <span> */}
                {/*   Assess Assignments */}

                {/* </span> */}
                {/* <TeacherAssignmentView course={course} {...props} */}
                {/*                        onSelected={()=>updateRoute('assignment')} */}
                {/* /> */}
                {/* <span> */}
                {/*   Build Skill Portfolio */}
                {/* </span> */}
                {/* <span> */}
                {/*   Map Skills to Assignments */}
                {/* </span> */}
                {/* <AssignmentMapper course={course} {...props} */}
                {/*                   onSelected={()=>updateRoute('map')}/> */}
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
        );

    }
}

export default TeacherView;
