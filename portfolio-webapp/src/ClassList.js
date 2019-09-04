import React, {useState, useEffect} from 'react';
import fetchJsonp from 'fetch-jsonp';
import Api from './api.js';

function ClassList (props) {
    
    const [courses, setCourses] = useState([]);
    const [errors, setErrors] = useState(false);
    useEffect(()=>{
        Api.runFunction('get_teacher_classes','thinkle@innovationcharter.org')
            .then(function (result) {
                setCourses(result);
            })
            .catch(function (ex) {
                console.log('parsing failed',ex)
            });
        // async function fetchCourses () {
        //     const resp = await fetchJsonp(
        //         url);
        //     resp.json()
        //     .then(resp=>setCourses(resp))
        //     .catch(err => setErrors(err))
        // }
        // fetchCourses()
    },
              [] // array of properties whose change triggers effect to rerun
             );
        
    return (
        <div>
        {errors && <div><p>ERRORS!</p><pre>{errors}</pre></div>}
        {(courses.length==0 && !errors && 'Fetching data from google apps...' || '')}
        <ul>
          {courses.map((c)=>(<li
                               key={c.id}
                               className='button'
                               onClick={()=>props.onCourseSelected(c)}
                             >{c.name}</li>))}
        </ul>
        </div>
    );
}

export default ClassList;
