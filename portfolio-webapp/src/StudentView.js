import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import CourseworkList from './CourseworkList.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import {Link} from 'react-router-dom';
import {Viewport,Container,Card,Menu,Navbar,Tabs,Loader,Button} from './widgets.js';
import {useStudentCoursesApi,useStudentProfileApi} from './gapi/hooks.js';
import {getProp,classNames} from './utils.js';
import history from './history.js';
import Portfolio from './Portfolio.js';
import ErrorBoundary from './error.js';

const PORT = 'portfolio'
const ASGN = 'assignment'

function StudentView (props) {

    const [course,setCourse] = useState();
    const CoursesApi = useStudentCoursesApi({},setCourseFromId);
    const StudentApi = useStudentProfileApi();
    const base = `/student/${getProp(course,'id')}/`
    var task = props.task || 'portfolio'

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
              (StudentApi.value && 
               <ErrorBoundary>
                 <Portfolio
                   course={course}
                   student={{
                       userId:StudentApi.value.id,
                       profile:StudentApi.value
                   }}
                   studentMode={true}
                   teacherMode={false}/> 
               </ErrorBoundary>
               || <Loader>Loading student profile...</Loader>)
             }
             {task==ASGN &&
              <Container><Card>Assignment View for students, coming soon... for now, add assignments by editing your portfolio and clicking "Add Exemplar" next to any skill.</Card></Container>}
           </div>
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

export default StudentView;
