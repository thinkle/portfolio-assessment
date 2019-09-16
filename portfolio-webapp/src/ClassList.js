import React, {useState, useEffect} from 'react';
import fetchJsonp from 'fetch-jsonp';
import Api from './gapi/gapi.js';
import {classNames} from './utils.js';
import {Modal} from './widgets.js';
import googleLogo from "./images/32x32.png";

function ClassList (props) {
    const [fetching, setFetching] = useState(true);
    const coursesCacheName = 'teacher-courses-'+props.user;
    const [courses, setCourses] = useState(
        Api.getLocalCachedProp(coursesCacheName)
            ||
            []
    );
    const [errors, setErrors] = useState(false);
    const [customCourses,setCustomCourses] = useState(
        Api.getLocalCachedProp('custom-courses-'+props.user)||[]
    );
    
    const [showCustomModal,setShowCustomModal] = useState(false);
    var customCourseWidget;
    useEffect(()=>{
        Api.Classroom.get_teacher_classes(props.user)
            .then(function (result) {
                setCourses(result);
                Api.cacheResult(
                    coursesCacheName,                    
                    result
                );
                setFetching(false);
            })
            .catch(function (ex) {
                console.log('parsing failed',ex)
                setErrors(JSON.stringify(ex))
                setFetching(false);
            });
        Api.getProp('custom-courses-'+props.user)
            .then((result)=>setCustomCourses(result));
    },
              [props.user] // array of properties whose change triggers effect to rerun
             );
        
    return (
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-header-title">{props.cardHeader || 'Choose Course'}</h3>
            </div>
            <div className="card-content">
              {errors && <div><p>ERRORS!</p><pre>{errors}</pre></div>}
              {(fetching && 
                <div>
                  <progress max="100" className="progress"/>
                  <span>Fetching data from google apps...</span>
                </div>
                || ''
               )}
              <div className="">
                {courses &&
                 
                 <div className="section">
                   <h3 className="level level-left">
                     <span className="icon">
                       <img src={googleLogo} width="32"/>
                     </span>
                     <span className="brand">Google Classroom classes</span>
                   </h3>
                   <div className="level">
                     {
                         courses.map((c)=>(
                             <a key={c.id} className='button is-medium level-item space-right classroom-green-button'
                                onClick={()=>props.onCourseSelected(c)}>
                               {c.name}
                             </a>
                         )
                                    )
                     }
                   </div>
                 </div>
                }
                <div className="section">
                  <h3>Other Courses</h3>
                  <div className="buttons">
        {customCourses && customCourses.map(
                    (course)=>(
                        <a className='button is-medium is-secondary'
                          onClick={()=>props.onCourseSelected({
                              name:course
                          })}>{course}
                        </a>
                    ))
                }
                <a className="button is-medium is-primary"
                   onClick={setShowCustomModal}
                >
                  Add New Course
                </a></div></div>
              </div>
            </div>
          </div>

          <Modal active={showCustomModal} onClose={()=>setShowCustomModal(false)}
          >
            <label className=''>Enter custom course:
              <input className="input" type="text" ref={(n)=>customCourseWidget=n}/>
            </label>
            <div className="level level-right top-pad">
              <div className="level-item level-right">
                <button className='button is-secondary space-right'
                        onClick={()=>setShowCustomModal(false)}>
                  Cancel
                </button>
                <button
                  className='button is-primary'
                  onClick={()=>{
                      console.log('Use value: %s from widget %s',
                                  customCourseWidget.value,
                                  customCourseWidget);
                      if (customCourses) {
                          var newCourses = customCourses.slice(0)
                      }
                      else {
                          var newCourses = [];
                      }
                      newCourses.push(customCourseWidget.value);
                      Api.setProp('custom-courses-'+props.user,newCourses).then(()=>console.log('Set custom prop!'));
                      setCustomCourses(newCourses);
                      props.onCourseSelected(customCourseWidget.value);
                  }}
                >Add course</button>
              </div>
            </div>
          </Modal>
        </div>
    );
}

export default ClassList;
