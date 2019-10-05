import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import CourseworkList from './CourseworkList.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import TeacherPortfolioView from './TeacherPortfolioView.js';
import TeacherAssignmentView from './TeacherAssignmentView.js';
import AssignmentMapper from './AssignmentMapper.js';
import Api from './gapi/gapi.js';
import Brand from './brand.js';
import {Container,Menu,Navbar,Tabs} from './widgets.js';

const COURSECHOOSER = 0;
const MENU = 1;
function TeacherView (props) {

    const [page,setPage] = useState(COURSECHOOSER);
    const [course,setCourse] = useState();
    const [user,setUser] = useState('');

    useEffect(
        ()=>{
            console.log('Get user...');
            Api.getUser().then(
                (result)=>{
                    console.log('Api.getUser ==> %s',result);
                    setUser(result);
                    console.log('Done setting user');
                })
        },[]);

    return (
        <div className='viewport2 bottom'>
           <div className='body'>
             {user &&
              mainPage()
              || <div>No user??? Please Log In</div>
             }
           </div>
          <Navbar>
            <Navbar.QuickBrand>
              {Brand.name}: Teacher Mode
            </Navbar.QuickBrand>
            <Navbar.Item>
              User: {JSON.stringify(user)}
            </Navbar.Item>
            <Navbar.Item>{course&&(
                <a  target="_blank" className="navbar-item" href={course.alternateLink}>{course.name}</a>
            )}
            </Navbar.Item>
            {page!==COURSECHOOSER &&  <a className="navbar-item" onClick={()=>setPage(COURSECHOOSER)}>Switch course</a>}
          </Navbar>
        </div>
    )

    function mainPage () {
        return (<React.Fragment>{page==COURSECHOOSER &&
         (<ClassList
            user={user}
            onCourseSelected={(course)=>{
                setCourse(course);
                setPage(MENU)
            }}
          />)
                                 ||
                                 tabs()}
                </React.Fragment>);
    }

    function tabs () {
        return (
            <div className="viewport2">
              <Tabs className="is-centered">
                <span>
                  Assess Student Portfolios
                </span>
                <TeacherPortfolioView course={course}/>
                <span>
                  Assess Assignments
                </span>
                <TeacherAssignmentView course={course}/>
                <span>
                  Build Skill Portfolio
                </span>
                <PortfolioBuilder course={course}/>
                <span>
                  Map Skills to Assignments
                </span>
                <AssignmentMapper course={course}/>
              </Tabs>
            </div>
        );

    }
}

export default TeacherView;
