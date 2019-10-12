import React,{useState,useEffect} from 'react';
import {Button,Dropdown,Field,Icon,Control,Panel} from './widgets.js';
import {getProp,classNames} from './utils.js';

function StudentPicker (props) {

    function doChangeStudent (student) {
        props.onSelected(student);
    }

    function prevStudent () {
        var n = props.students.indexOf(props.selected);
        if (n <= 0) {
            n = props.students.length - 1
        }
        if (n >= 0 ) {
            doChangeStudent(props.students[n-1]);
        }
    }

    function nextStudent () {
        var n = props.students.indexOf(props.selected);
        if (n == (props.students.length-1)) {
            n = -1;
        }
        if (props.students.length) {
            doChangeStudent(props.students[n+1]);
        }
    }


    return (
            <Field className="has-add-ons">
              <Button
                icon={Icon.left}
                onClick={prevStudent}
              />
              <Dropdown
                className="student-name-picker"
                initialValue={props.selected}
                items={props.students}
                title="Choose student"
                renderItem={(itm)=><span>{getProp(itm,'profile.name.fullName')}</span>}
                onSelected={doChangeStudent}
              />
              <Button
                icon={Icon.right}
                onClick={nextStudent}
              />
            </Field>
    );
}

function StudentMultiPicker (props) {
    // props we want are...
    // selected = []
    // students = []
    // onAdd = method
    // onRemove = method
    const [updated,setUpdated] = useState(1)

    useEffect(()=>{
        setUpdated(updated + 1)
    },
              [props.selected,props.students]
             );
             
    
    return <Panel key={updated}>
             {props.students.map(
                 (student)=> {
                     var active = props.selected.indexOf(student)>-1;
                     return (<Panel.Label
                               className={classNames({
                                   active : active
                               })}
                               key={student.userId + '-' + active}
                             >
                               <input
                                 type="checkbox"
                                 active={active}
                                 checked={active}
                                 onChange={
                                     (event)=>{
                                         console.log('onChange fired!')
                                         if (active) {
                                             console.log('Remove',student)
                                             props.onRemove(student);
                                         }
                                         else {
                                             console.log('Add',student)
                                             props.onAdd(student);
                                         }
                                     }
                                 }
                               />
                               {getProp(student,'profile.name.fullName')}
                             </Panel.Label>);
                 })}        
           </Panel>
}

StudentPicker.Multi = StudentMultiPicker;

export default StudentPicker;