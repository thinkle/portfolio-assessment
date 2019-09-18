import {useState,useEffect} from 'react';
import Api from './gapi.js';

function makeApiHook (getter, defaultVal) {

    return function (params, valueFromProps) {

        console.log('apiHook called:',getter,params,valueFromProps);
        const [state,setState] = useState(valueFromProps||defaultVal)
        if (valueFromProps && valueFromProps != state) {
            setState(valueFromProps); // only once
        }

        useEffect(
            ()=>{
                if (!valueFromProps) {
                    async function doFetchFromApi () {
                        var newVal = await getter(params);
                        console.log('Fetched new value: %s with %s',newVal,getter,params);
                        setState(newVal);
                    }
                    doFetchFromApi();                    
                }
            },
            [valueFromProps]
        );
        return state
    }
}

var useCoursework = makeApiHook(Api.Classroom.get_coursework,[]);
var useStudentWork = makeApiHook(Api.Classroom.get_student_work,[]);
var useStudents = makeApiHook(Api.Classroom.get_students,[]);
export {useCoursework,useStudents,useStudentWork}

