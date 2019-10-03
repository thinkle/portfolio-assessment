import {useState,useEffect} from 'react';
import Api from './gapi.js';

function makeCachingApiHook ({getter, makeCacheName, defaultVal, dontFetch, alwaysRefetch, refetchAfter}) {

    return function (params) {
        const cacheName = makeCacheName(params)
        const [state,setState] = useState(defaultVal);
        const [fetching,setFetching] = useState(false);
        const [doFetchNow,setFetchNow] = useState(false)
        var haveLocal = false;
        const renderTime = new Date().getTime();
        
        function setCache (val) {
            console.log('hooks: setting cache: ',cacheName,val);
            window.localStorage.setItem(cacheName,JSON.stringify(val));
            window.localStorage.setItem('time-'+cacheName,new Date().getTime());
        }

        function getLastCacheTime () {
            return Number(window.localStorage.getItem('time-'+cacheName,new Date().getTime()))
        }

        function getCache () {
            console.log('hooks: fetching cache: ',cacheName);
            var val = window.localStorage.getItem(cacheName)
            if (val) {
                haveLocal = true;
                return JSON.parse(val);
            }
        }

        useEffect(            
            ()=>{

                async function doFetchFromApi () {
                    console.log('hooks: fetch from API!',cacheName);
                    var newVal = await getter(params);
                    if (newVal !== state) {
                        setState(newVal);
                        setCache(newVal);
                    }
                    else {
                        console.log('hooks:No change in data we fetched!');
                    }
                }

                var cachedVal = getCache();
                if (cachedVal) {
                    setState(cachedVal);
                }

                if (doFetchNow) {
                    doFetchFromApi();
                    setFetchNow(false);
                }
                if (!haveLocal) {
                    console.log('hooks:No local copy: must fetch!',cacheName);
                    doFetchFromApi();
                }
                else if (haveLocal && alwaysRefetch) {
                    console.log('hooks: Have a local copy, refetch once for good measure...',cacheName);
                    doFetchFromApi();
                }
                else {
                    // we have a local, but how long has gone by...
                    const elapsedTime = getLastCacheTime() - renderTime
                    if (elapsedTime < refetchAfter) {
                        console.log(`hooks: No need to refetch -- still ${(refetchAfter-elapsedTime)/1000} seconds left`,cacheName);
                    }
                    else {
                        console.log(`hooks: Cache is stale: refetching!`,cacheName);
                        doFetchFromApi();
                    }
                }
            },
            [doFetchNow]
        );


        return {
            value:state,
            clearCache () {setCache()},
            fetch ()  {setFetchNow(true)},
        }

    }
}

function makeApiHook (getter, defaultVal) {

    return function (params, valueFromProps) {

        //console.log('hooks:apiHook called:',getter,params,valueFromProps);
        const [state,setState] = useState(valueFromProps||defaultVal)
        if (valueFromProps && valueFromProps != state) {
            setState(valueFromProps); // only once
        }

        useEffect(
            ()=>{
                if (!valueFromProps) {
                    async function doFetchFromApi () {
                        console.log('hooks:Fetching...');
                        var newVal = await getter(params);
                        console.log('hooks:Fetched new value from API: %s with %s',newVal,getter.name,params);
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

function useStudentPortfolio ({course, student, includeAssessments, dontFetch}) {
    const [busy,setBusy] = useState(false);
    const [origPortfolio,setOrigPortfolio] = useState([]);
    const [portfolio,_setPortfolio] = useState([]); // we don't return the "pure" setPortfolio because we wrap it
    const [saved,setSaved] = useState(true); // updated by comparing portfolio and original...
    const [doFetch,setDoFetch] = useState(!dontFetch)
    const sp = Api.StudentPortfolio(course,student);

    useEffect( ()=>{

        async function getPortfolio () {
            try {
                console.log('hooks:useStudentPortfolio - getting portfolio data');
                setBusy(true);
                var newPortfolioData = await sp.get_portfolio();
                console.log('hooks:useStudentPortfolio - got portfolio data',newPortfolioData);
            }
            catch (err) {
                setBusy(false);
                console.log('hooks:useStudentPortfolio: Error fetching portfolio',err);
                console.log('hooks:useStudentPortfolio: ignoring...');
            }
            if (newPortfolioData) {
                var assessments;
                console.log('hooks:useStudentPortfolio - fetching assessments');
                try {
                    setBusy(true);
                    var assessments = await sp.get_assessments();
                    console.log('hooks:useStudentPortfolio - got assessments',assessments);
                }
                catch (err) {
                    setBusy(false);
                    console.log('hooks:useStudentPortfolio: Error fetching assessments',err);
                }
                try {
                    var portf = Api.StudentPortfolio.parsePortfolio(newPortfolioData,assessments)
                    setOrigPortfolio(portf);
                    _setPortfolio(portf);
                    setSaved(true)
                }
                catch (err) {
                    console.log('hooks:useStudentPortfolio: Error parsing portfolio',newPortfolioData,assessments);
                    setBusy(false);
                    throw err;
                }
                setBusy(false);
            }
        }

        if (doFetch) {
            getPortfolio(); // do it!
        }
        else {
            console.log('hooks: useStudentPortfolio holding off fetching for now...');
        }
        
    },
               [course,student,doFetch]
             );


    async function savePortfolio () {
        setBusy(true);
        try {
            var result = await Api.StudentPortfolio(course,student).set_portfolio_and_assessments(portfolio);
        }
        catch (err) {
            setBusy(false);
            throw err;
        }
        setBusy(false);
        setSaved(true);
        setOrigPortfolio(portfolio);
        return result;
    }

    function setPortfolio (newPortfolio) {
        _setPortfolio(newPortfolio);
        if (JSON.stringify(newPortfolio)==JSON.stringify(origPortfolio)) {
            setSaved(true)
        }
        else {
            console.log('hooks:not the same: saved=false');
            setSaved(false);
        }
    }

    return {
        busy, saved, // read-only
        portfolio, setPortfolio, savePortfolio,  // read/write/save
        fetch () {
            setDoFetch(true)
        }
    }
    
}

const MINUTES = 60*1000
const HOURS = 60*MINUTES
const DAYS = 24 * HOURS

//var useCoursework = makeApiHook(Api.Classroom.get_coursework,[]);
const useCourseworkApi = makeCachingApiHook({
    getter : Api.Classroom.get_coursework,
    makeCacheName : (params)=>`coursework-${params.course.id}`,
    defaultVal : [],
    refetchAfter : 30*MINUTES
});
const useCoursework = (params) => useCourseworkApi(params).value

const useStudentWorkApi = makeCachingApiHook({
    getter : Api.Classroom.get_student_work,
    makeCacheName : (params)=>`studentwork-${params.course.id}-${params.teacherMode&&params.student&&params.student.userId||'me'}`,
    defaultVal : [],
    refetchAfter : 30*MINUTES
});
//const useStudentWork = makeApiHook(Api.Classroom.get_student_work,[]);
const useStudentWork = (params)=>useStudentWorkApi(params).value;

const useStudentsApi = makeCachingApiHook({
    getter : Api.Classroom.get_students,
    makeCacheName : (params) => `students-${params.course.id}`,
    defaultVal : [],
    refetchAfter : 7*DAYS
});
const useStudents = (params) => useStudentsApi(params).value;
//const useStudents = makeApiHook(Api.Classroom.get_students,[]);

export {useCoursework,useStudents,useStudentWork,useStudentPortfolio, useCourseworkApi,useStudentsApi}

