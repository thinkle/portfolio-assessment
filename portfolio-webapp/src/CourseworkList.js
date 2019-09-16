import Api from './gapi/gapi.js';
import React,{useState,useEffect} from 'react';
import {Card,Button,Buttons,Icon} from './widgets.js';
import {classNames} from './utils.js';
import './CourseworkList.sass';


function Material (props) {

    var material = props.material;

    if (props.thumbnailMode) {
        return <span className='material' onClick={props.onThumbClick}>
                 {getMaterial()}
               </span>
    }
    else {
        return (<div className='material' onClick={(itm)=>props.onClick && props.onClick(itm)}>
                  {getMaterial()}
                </div>)
    }

    function getMaterial () {
        if (material.link) {
            var itm = material.link
            return (
                <div>
                  <img src={itm.thumbnailUrl}/>
                  <a href={itm.url} target="_blank">
                    {itm.title}
                    <Icon icon={Icon.external}/>
                  </a>
                </div>
            )
        }
        else if (material.driveFile) {
            var itm = material.driveFile.driveFile
            return (
                <div>
                  <img src={itm.thumbnailUrl}/>
                  <a href={itm.alternativeLink} target="_blank">{itm.title}</a>
                  {itm.shareMode} {itm.shareMode=='VIEW' && 'Students get copy?'} 
                </div>
            );
        }
        else {
            return (<div>Unknown material: {JSON.stringify(material)}</div>)
        }
    }
}

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

function useCourseworkState (course,courseworkFromProps) {
    if (courseworkFromProps) {
        console.log('useCourseworkState got prop, no need to manage state')
        console.log(courseworkFromProps);
    }
    const [coursework,setCoursework] = useState(courseworkFromProps||[]);
    if (courseworkFromProps && courseworkFromProps != coursework) {
        setCoursework(courseworkFromProps);
    }
    useEffect(
        () => {
            if (!courseworkFromProps) {
                async function getGW () {
                    var coursework = await Api.Classroom.get_coursework(course);
                    setCoursework(coursework);
                }
                getGW();
            }
        },
        [course,courseworkFromProps]
    );

    return [coursework,setCoursework]
}

function CourseworkList (props) {
    
    const [active,setActive] = useState(false);
    const [coursework,setCoursework] = useCourseworkState(props.course, props.coursework)


    if (props.menu) {
        return (
            <div className={classNames({
                courseworkMenuContainer:true,
                active:active})}>
              <Button className='courseworkMenuTrigger' onClick={()=>setActive(!active)}>
                <Icon icon={Icon.down} classNames={{reverse:active,unreverse:!active}}/>
                <span>{props.menuTitle || 'Select Coursework'}</span>
              </Button>
              <div className="menuWrap">
                {makeCourseworkList()}
              </div>
            </div>
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
CourseworkList.useCourseworkState = useCourseworkState;

export default CourseworkList;
