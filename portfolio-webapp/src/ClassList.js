import React, {useState, useEffect} from 'react';
import fetchJsonp from 'fetch-jsonp';
import Api from './api.js';

function ClassList (props) {
    const [fetching, setFetching] = useState(true);
    const [courses, setCourses] = useState([]);
    const [errors, setErrors] = useState(false);
    var customCourseWidget;
    useEffect(()=>{
        Api.runFunction('get_teacher_classes',props.user)
            .then(function (result) {
                setCourses(result);
                setFetching(false);
            })
            .catch(function (ex) {
                console.log('parsing failed',ex)
                setErrors(JSON.stringify(ex))
                setFetching(false);
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
              [props.user] // array of properties whose change triggers effect to rerun
             );
        
    return (
        <div className="card">
          <div className="card-header">
            {props.cardHeader || 'Choose Course'}
          </div>
          {errors && <div><p>ERRORS!</p><pre>{errors}</pre></div>}
          {(fetching && 
            <div>
              <progress max="100" className="progress"/>
              <span>Fetching data from google apps...</span>
            </div>
            || ''
           )}
          <div className="menu">
            <ul className="menu-list">
              {courses && courses.map((c)=>(<li key={c.id} >
                                           <a className='button'
                                              onClick={()=>props.onCourseSelected(c)}>
                                             {c.name}
                                           </a>
                                         </li>)
                                     )
              }
              <li>
                <div className='card'>
                  <div className="card-body">
                    <label className=''>Enter custom course:
                      <input className="input" type="text" ref={(n)=>customCourseWidget=n}/>
                    </label>
                    <button
                      className='button'
                      onClick={()=>{
                          console.log('Use value: %s from widget %s',
                                      customCourseWidget.value,
                                      customCourseWidget);
                          props.onCourseSelected(customCourseWidget.value);
                      }}
                    >Use custom course</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
    );
}

export default ClassList;
