import {useState,useEffect} from 'react';
import Api from './gapi.js';
import {getProp} from '../utils.js';
import makeCachingApiHook,{t} from './cachingHook.js';


//var useCoursework = makeApiHook(Api.Classroom.get_coursework,[]);
const useCourseworkApi = makeCachingApiHook({
    getter : Api.Classroom.get_coursework,
    makeCacheName : (params)=>`coursework-${getProp(params,'course.id')}`,
    defaultVal : [],
    refetchAfter : 30*t.MINUTES
});
const useCoursework = (params) => useCourseworkApi(params).value

const useStudentWorkApi = makeCachingApiHook({
    getter : Api.Classroom.get_student_work,
    makeCacheName : (params)=>`studentwork-${getProp(params,'course.id')}-${params.teacherMode&&params.student&&params.student.userId||params.teacherMode&&'all'||'me'}`,
    defaultVal : [],
    refetchAfter : 30*t.MINUTES
});
//const useStudentWork = makeApiHook(Api.Classroom.get_student_work,[]);
const useStudentWork = (params)=>useStudentWorkApi(params).value;

const useStudentsApi = makeCachingApiHook({
    getter : Api.Classroom.get_students,
    makeCacheName : (params) => `students-${getProp(params,'course.id')}`,
    defaultVal : [],
    refetchAfter : 1*t.DAYS
});
const useStudents = (params) => useStudentsApi(params).value;
//const useStudents = makeApiHook(Api.Classroom.get_students,[]);

const useCoursesApi = makeCachingApiHook({
    getter : Api.Classroom.get_teacher_classes,
    makeCacheName : (params) => `teacher-courses-${params.teacher}`,
    defaultVal : [],
    refetchAfter : 1*t.DAYS,
});


export {useCoursework,useStudents,useStudentWork,useCourseworkApi,useStudentsApi, useCoursesApi}
