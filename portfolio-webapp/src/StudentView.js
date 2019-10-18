import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import CourseworkList from './CourseworkList.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import {Link} from 'react-router-dom';
import {Viewport,Container,Card,Menu,Navbar,Tabs,Loader,Button} from './widgets.js';
import {useStudentCoursesApi,useStudentProfileApi} from './gapi/hooks.js';
import {useStudentPortfolio,useCoursework,useStudentWork} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';
import {getProp,classNames} from './utils.js';
import history from './history.js';
import Portfolio from './Portfolio.js';
import ErrorBoundary from './error.js';
import StudentAssignmentView from './StudentAssignmentView.js';
const PORT = 'portfolio'
const ASGN = 'assignment'

function StudentView (props) {

    const [course,setCourse] = useState();
    const CoursesApi = useStudentCoursesApi({},setCourseFromId);
    const StudentApi = useStudentProfileApi();
    const base = `/student/${getProp(course,'id')}/`

    function setCourseFromId () {
        if (props.courseId) {
            var myCourses = CoursesApi.value.filter((c)=>c.id==props.courseId)
            if (myCourses.length==1) {
                console.log('Set course');
                setCourse(myCourses[0]);
            }
            else {
                console.log('Error: course not found? or multiple found?')
                console.log(props.courseId,myCourses,CoursesApi)
            }
        }
    }

    return (<React.Fragment>
        {!course &&
            <Container>
              <ClassList CoursesApi={CoursesApi} onCourseSelected={(newCourse)=>{
                  setCourse(newCourse);
                  history.push(`/student/${newCourse.id}/`);
              }}/>
            </Container>
         ||
         <Viewport.Three>
           {StudentApi && StudentApi.value && <StudentCourseView
             {...props}
             StudentApi={StudentApi}
             course={course}
             student={{
                 userId:StudentApi.value.id,
                 profile:StudentApi.value
             }}

                                              />}
           <Navbar>
             <Navbar.Item>
               Signed in as {StudentApi.value && StudentApi.value.name.fullName}
             </Navbar.Item>
             <Navbar.Item>
               {course && <strong>{course.name}</strong>}
             </Navbar.Item>
             
             <Navbar.Item>
               <Button onClick={()=>setCourse()}>Switch Course</Button>
             </Navbar.Item>
           </Navbar>
         </Viewport.Three>
        }
            </React.Fragment>
    );
}


function StudentCourseView (props) {
    var task = props.task || 'portfolio'
    const base = `/student/${getProp(props.course,'id')}/`

    const coursework = useCoursework(props);
    const studentwork = useStudentWork(props);
    const studentPortfolioProps = useStudentPortfolio({...props,studentMode:true});
    const skillHookProps = usePortfolioSkillHook(props);


    return <>
             <Tabs.TabsTop className="is-centered">
               <ul>
                 <li className={classNames({
                     'is-active':task==PORT
                 })}><Link to={base+PORT}>Edit Portfolio (by skills)</Link></li>
                 <li className={classNames({
                     'is-active':task==ASGN
                 })}
                 ><Link to={base+ASGN}>Add Assignment</Link></li>
               </ul>
             </Tabs.TabsTop>
             <div>
               {task==PORT &&
                <ErrorBoundary>
                   <Portfolio.Bare
                     {...props}
                     {...skillHookProps}
                     {...studentPortfolioProps}
                     coursework={coursework}
                     studentwork={studentwork}
                     studentMode={true}
                     teacherMode={false}/> 
                </ErrorBoundary>                
               }
               {task==ASGN &&
                <StudentAssignmentView
                  course={props.course}
                  student={{userId:props.StudentApi.value.id,
                            profile:props.StudentApi.value
                           }}
                  coursework={coursework}
                  studentwork={studentwork}
                  {...studentPortfolioProps}
                  {...skillHookProps}
                  studentMode={true}
                  teacherMode={false}
                />
               }
             </div>
           </>
}


export default StudentView;
