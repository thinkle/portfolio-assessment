import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import Api from './api.js';

const COURSECHOOSER = 0;
const BUILDPORTFOLIO = 1;

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
                })
        },[]);

    return (
        <div className='container has-navbar-fixed-top'>
          <div className='navbar is-fixed-top'>
            <div className="navbar-brand">
              <span className="navbar-item">PortfolioTool: Teacher Mode</span>
            </div>
            {course&&(
                <a  className="navbar-item" href={course.alternateLink}>{course.name}</a>
            )}
            {page!==COURSECHOOSER &&  <a className="navbar-item" onClick={()=>setPage(COURSECHOOSER)}>Switch course</a>}
          </div>
           <div className='body'>
             {
                 (page===COURSECHOOSER
                  && user && courseChooser())
                     ||
                     (page==BUILDPORTFOLIO
                      && portfolioBuilder())
             } 
           </div>
        </div>
    );

    function courseChooser () {
        return (<ClassList
                  user={user}
                  onCourseSelected={(course)=>{
                      setCourse(course);
                      setPage(BUILDPORTFOLIO)
                  }}
        />
               );
    }

    function portfolioBuilder () {
        return (<PortfolioBuilder courseId={course.id} courseTitle={course.name}/>);
    }
    
}

export default TeacherView;
