import React,{useState,useEffect,useRef} from 'react';
import Portfolio from './Portfolio.js';
import {useStudents,useStudentWork,useCoursework,useStudentPortfolio} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';
import {Loader,Container,Menu,SelectableItem,h,Button,Icon,Navbar} from './widgets.js';
import {getProp,getById} from './utils.js';
import StudentPicker from './StudentPicker.js';
import history from './history.js';


function TeacherPortfolioView (props) {
    const students = useStudents(props)
    const [selectedStudent,setSelectedStudent] = useState();
    const skillHookProps = usePortfolioSkillHook(props);
    const allStudentWork = useStudentWork({...props,teacherMode:true});
    const coursework = useCoursework(props);
    const [initialStateReady,setInitialStateReady] = useState(false);

    console.log('TeacherPortfolioView rerender',
                props,
                selectedStudent,
                skillHookProps,
                allStudentWork,
                coursework,
                initialStateReady);

    useEffect( ()=>{
        if (!initialStateReady) {
            if (students.length > 0) {
                if (props.taskParam) {
                    console.log('Set student from url!');
                    setSelectedStudent(getById(students,props.taskParam,'userId'));
                }
                console.log('we are ready!');
                setInitialStateReady(true);
                if (props.onReady) {props.onReady()}
            }
        }
    },[students])

    function doSetSelectedStudent (student) {
        console.log('portfolioView set URL!');
        history.push(`/teacher/${props.course.id}/portfolio/${student.userId}`)
        setSelectedStudent(student);
    }

    return (
        !initialStateReady && <Loader>Loading Students...</Loader> ||
        <Container>
          <Navbar className="navbar2">
            <Navbar.QuickBrand>Portfolio (Teacher View)</Navbar.QuickBrand>
            <Navbar.Item>
              <StudentPicker students={students} onSelected={doSetSelectedStudent} selected={selectedStudent}/>
            </Navbar.Item>
          </Navbar>
          {students.map(
              (student)=>(
                  <div style={{
                      display:selectedStudent==student && 'block' || 'none'
                  }}
                       key={student.userId}
                  >
                  <Portfolio.Lazy
                    {...props}
                    {...skillHookProps}
                    student={student}
                    teacherMode={true}
                    studentMode={false}
                    coursework={coursework}
                    studentwork={allStudentWork.filter((item)=>item.userId = student.userId)}
                    fetchNow={student==selectedStudent}                    
                  />
                  </div>
              ))}
        </Container>
    )

}


export default TeacherPortfolioView
