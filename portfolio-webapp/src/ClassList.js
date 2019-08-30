import React, {useState, useEffect} from 'react';
import fetchJsonp from 'fetch-jsonp';



function ClassList () {
//    const url = 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbwU-L5LTC68yB4IE0Dm0a6SzaZUi9l04w0DL-RN3n0OfN2iCZM/exec?function=get_teacher_classes&arg=thinkle@innovationcharter.org&callback=?';
//    const url = 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbwU-L5LTC68yB4IE0Dm0a6SzaZUi9l04w0DL-RN3n0OfN2iCZM/exec?function=get_teacher_classes&arg=thinkle@innovationcharter.org&callback=?';
    const url = 'https://script.google.com/a/innovationcharter.org/macros/s/AKfycbwU-L5LTC68yB4IE0Dm0a6SzaZUi9l04w0DL-RN3n0OfN2iCZM/exec?function=get_teacher_classes&arg=thinkle@innovationcharter.org'

    
    const [courses, setCourses] = useState([]);
    const [errors, setErrors] = useState(false);
    useEffect(()=>{
        var globFun = document.createElement('script');
        globFun.innerText=`
        function ccallback (data) {
            console.log('Got data: %s',JSON.stringify(data));
            console.log('yippeee...');
            }
        `
        var script = document.createElement('script');
        script.type = 'text/javascript'
        script.src = url+'&callback=ccallback';
        document.body.appendChild(globFun);
        document.body.appendChild(script);

        
        fetchJsonp(url)
        .then(function (response) {
            return response.json()
        })
        .then(function (json) {
            setCourses(json.result);
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
    });
        
    return (
        <div>
        {errors && <div><p>ERRORS!</p><pre>{errors}</pre></div>}
        {(courses.length==0 && !errors && <a href={url}>Fetching data from google apps</a> || '')}
        <ul>
        {courses.map((c)=>(<li>{c.name}</li>))}
        </ul>
        </div>
    );
}

export default ClassList;