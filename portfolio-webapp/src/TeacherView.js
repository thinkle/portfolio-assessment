import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import CourseworkList from './CourseworkList.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import Portfolio from './Portfolio.js';
import Api from './gapi/gapi.js';
import Brand from './brand.js';
const COURSECHOOSER = 0;
const BUILDPORTFOLIO = 1;
const MENU = 2;
const COURSEWORK = 3;
const PORTFOLIO = 4;


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
        <div className='container has-navbar-fixed-top'>
          <div className='navbar is-fixed-top'>
            <div className="navbar-brand">
              <span className="navbar-item">{Brand.name}: Teacher Mode</span>
            </div>
            {course&&(
                <a  className="navbar-item" href={course.alternateLink}>{course.name}</a>
            )}
            {page!==COURSECHOOSER &&  <a className="navbar-item" onClick={()=>setPage(COURSECHOOSER)}>Switch course</a>}
          </div>
           <div className='body'>
             {
                 (page===COURSECHOOSER
                  && user && (<ClassList
                               user={user}
                               onCourseSelected={(course)=>{
                                   setCourse(course);
                                   setPage(MENU)
                               }}
                              />)
                  ||
                  (page==MENU && user &&
                   <ul>
                     <a className='button' onClick={()=>setPage(COURSEWORK)}>Show Google Classroom Assignments</a>
                     <a className='button' onClick={()=>setPage(BUILDPORTFOLIO)}>Build Skill Portfolio</a>
                     <a className='button' onClick={()=>setPage(PORTFOLIO)}>Put Work in Portfolio</a>
                   </ul>)
                  ||
                  (page==COURSEWORK && user && <CourseworkList onSelected={(cw)=>console.log(cw)} menu={true} user={user} course={course}/>)
                  ||
                  (page==BUILDPORTFOLIO
                   && <PortfolioBuilder course={course}/>
                  )
                  ||
                  (page==PORTFOLIO
                   && <Portfolio course={course}/>
                  )
                 )}
           </div>
        </div>
             );

    
    
}

export default TeacherView;
