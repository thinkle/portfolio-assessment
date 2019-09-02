import React, {useState, useEffect} from 'react';
import fetchJsonp from 'fetch-jsonp';
import Api from './api.js';

function ClassList () {
//    const url = 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbwU-L5LTC68yB4IE0Dm0a6SzaZUi9l04w0DL-RN3n0OfN2iCZM/exec?function=get_teacher_classes&arg=thinkle@innovationcharter.org&callback=?';
//    const url = 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbwU-L5LTC68yB4IE0Dm0a6SzaZUi9l04w0DL-RN3n0OfN2iCZM/exec?function=get_teacher_classes&arg=thinkle@innovationcharter.org&callback=?';
    //const url = 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbwU-L5LTC68yB4IE0Dm0a6SzaZUi9l04w0DL-RN3n0OfN2iCZM/exec?function=get_teacher_classes&arg=thinkle@innovationcharter.org'
    //const url = Api.getUrl('get_teacher_classes','thinkle@innovationcharter.org');

    
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
        {courses.map((c)=>(<li>{c.name}</li>))}
        </ul>
        </div>
    );
}

export default ClassList;
