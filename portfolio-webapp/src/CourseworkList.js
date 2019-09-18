import Api from './gapi/gapi.js';
import React,{useState,useEffect} from 'react';
import {Card,Button,Buttons,Icon,Menu} from './widgets.js';
import {classNames} from './utils.js';
import {useCoursework} from './gapi/hooks.js';
import './CourseworkList.sass';
import Material from './Material.js';


/* {"courseId":"20912946613","id":"20912946869","title":"First Assignment","description":"Join our repl.it class, then complete the first assignment.","materials":[{"link":{"url":"https://repl.it/student_embed/assignment/3742434/dfb24e0e0639a073ef8d255e7ace8049","title":"Repl.it - Sign Up","thumbnailUrl":"https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://repl.it/student_embed/assignment/3742434/dfb24e0e0639a073ef8d255e7ace8049&a=AIYkKU9LdVccnjMRTnHcsQ-ISwd0xex1LA"}},{"link":{"url":"https://repl.it/classroom/invite/degZygG","title":"Repl.it - Sign Up","thumbnailUrl":"https://www.google.com/webpagethumbnail?c=73&s=105:70&f=0&d=https://repl.it/classroom/invite/degZygG&a=AIYkKU_rsghVXu8vLZ0Oj2HzEApWbEOhTg"}}],"state":"PUBLISHED","alternateLink":"https://classroom.google.com/c/MjA5MTI5NDY2MTNa/a/MjA5MTI5NDY4Njla/details","creationTime":"2019-08-29T10:52:37.783Z","updateTime":"2019-09-12T10:51:52.219Z","dueDate":{"year":2019,"month":9,"day":6},"dueTime":{"hours":3,"minutes":59},"maxPoints":100,"workType":"ASSIGNMENT","submissionModificationMode":"MODIFIABLE_UNTIL_TURNED_IN","assigneeMode":"ALL_STUDENTS","creatorUserId":"113561106451202000689"} */

function CourseworkItem (props) {
    const [showMaterials,setShowMaterials] = useState();
    var item = props.item;
    return (
        <div className={classNames({
            'coursework-item':true,
            table:true,
            selectable:props.selectable
        })} key={item.id}>
          <div>
            {item.dueDate &&
             <span>
               {item.dueDate.month}/{item.dueDate.day}
             </span>
            }
          </div>
          <div>
            {props.selectable && 
             <a onClick={props.onClick}>{item.title}</a>
             ||
             <a href={item.alternateLink} target="_blank">{item.title}</a>
            }
          </div>
          <div>
            <span onClick={()=>setShowMaterials(!showMaterials)}>Materials</span>
              {item.materials && item.materials.map(
                  (material)=><Material
                                onThumbClick={()=>setShowMaterials(true)}
                                onClick={props.onMaterialSelected}
                                thumbnailMode={!showMaterials}
                                material={material}/>
               )
              }              
          </div>
          {/* <td> */}
          {/*   <br/><div style={{overflow:'scroll'}}>{JSON.stringify(item)}</div> */}
          {/* </td> */}
          {props.selectable &&
           <React.Fragment>
             <div>
               <Button icon={Icon.check} onClick={()=>props.onClick&&props.onClick()}>Select</Button>
             </div>
             <div>
               <a target="_blank" href={item.alternateLink}>
                 <Icon icon={Icon.external}/>
                 <span className='tooltip'>Open in Classroom</span>
               </a>
             </div>
           </React.Fragment>
          }
        </div>    )
}

function CourseworkList (props) {
    
    const [active,setActive] = useState(false);
    const coursework = useCoursework({course:props.course, coursework:props.coursework})

    var className = classNames({...props.classNames, 
                                courseworkMenuContainer:true,
                                active:active});
    
    if (props.menu) {
        return (
            <Menu classNames={{courseworkMenuContainer:true}}
                  items={coursework}
                  title={props.menuTitle||'Select Coursework'}
                  renderItem={(itm)=>(<span>{itm.title} {itm.dueDate && <span className='due'>({itm.dueDate.month}/{itm.dueDate.day})</span>}</span>)}
                  onSelected={(itm)=>{
                      props.onSelected && props.onSelected(itm)
                  }
                             }
            />
        )
    }
    else {
        return makeCourseworkList();
    }

    function makeCourseworkList () {

        return (<div className='courseworkList'>
              {coursework && coursework.map((item)=>(
                  <CourseworkItem
                    selectable={true}
                    item={item}
                    onClick={()=>{
                        if (props.onSelected) {
                            setActive(false);
                            props.onSelected(item);
                        }
                    }}
                  />
              )
                             )}
            </div>
               );
    }
    
}

CourseworkList.CourseworkItem = CourseworkItem;
CourseworkList.Material = Material;

export default CourseworkList;
