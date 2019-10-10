import React,{useState,useEffect,useRef} from 'react';
import Portfolio from './Portfolio.js';
import {useStudents,useStudentWork,useCoursework,useStudentPortfolio} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';
import {Container,Menu,SelectableItem,h,Navbar} from './widgets.js';
import {getProp} from './utils.js';

function StudentPicker (props) {

    return (<SelectableItem
              items={props.students}
              onSelected={props.onSelected}
              title='Select Student'
              renderItem={
                  (student)=><span>{student.profile.name.fullName}</span>
              }
            />)
}



function TeacherPortfolioView (props) {
    const students = useStudents(props)
    const [selectedStudent,setSelectedStudent] = useState();
    const skillHookProps = usePortfolioSkillHook(props);
    const allStudentWork = useStudentWork({...props,teacherMode:true});
    const coursework = useCoursework(props);
    
    
    return (
        <Container>
          <Navbar>
            <Navbar.QuickBrand>Portfolio (Teacher View)</Navbar.QuickBrand>
            <Navbar.Item>
              <StudentPicker students={students} onSelected={setSelectedStudent}/>
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
