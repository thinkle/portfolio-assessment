import React,{useState,useEffect} from 'react';
import Portfolio from './Portfolio.js';
import {useStudents,useCoursework,useStudentWork,useStudentPortfolio} from './gapi/hooks.js';
import {Container,Menu,SelectableItem,h,Navbar} from './widgets.js';

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
    
    return (
        <Container>
          <Navbar>
            <Navbar.QuickBrand>Portfolio (Teacher View)</Navbar.QuickBrand>
            <Navbar.Item>
              <StudentPicker students={students} onSelected={setSelectedStudent}/>
            </Navbar.Item>
          </Navbar>
          {selectedStudent &&
           <Portfolio {...props} student={selectedStudent} teacherMode={true}/>
          }
        </Container>
    )

    
    
}

export default TeacherPortfolioView
