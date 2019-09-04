import React,{useState} from 'react';
import ClassList from './ClassList.js';
import PortfolioBuilder from './PortfolioBuilder.js';

const COURSECHOOSER = 0;
const BUILDPORTFOLIO = 1;

function TeacherView (props) {

    const [page,setPage] = useState(COURSECHOOSER);
    const [course,setCourse] = useState();


    return (
        <div className='container has-navbar-fixed-top'>
          <div className='navbar is-fixed-top'>
            <div className="navbar-brand">
              <span className="navbar-item">PortfolioTool: Teacher Mode</span>
            </div>
            {course&&(
                <a  className="navbar-item" href={course.alternateLink}>{course.name}</a>
            )}
            {page!==COURSECHOOSER && <a className="navbar-item" onClick={()=>setPage(COURSECHOOSER)}>Switch course</a>}
          </div>
           <div className='body'>
             {
                 page===COURSECHOOSER
                     && courseChooser()
                     ||
                     page==BUILDPORTFOLIO
                     && portfolioBuilder()
             } 
           </div>
        </div>
    );

    function courseChooser () {
        return (<ClassList
                  onCourseSelected={(course)=>{
                      setCourse(course);
                      setPage(BUILDPORTFOLIO)
                  }}
        />
               );
    }

    function portfolioBuilder () {
        return (<PortfolioBuilder courseId={course.id}/>);
    }
    
}

export default TeacherView;
