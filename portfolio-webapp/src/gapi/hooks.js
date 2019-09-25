import {useState,useEffect} from 'react';
import Api from './gapi.js';

function makeApiHook (getter, defaultVal) {

    return function (params, valueFromProps) {

        //console.log('apiHook called:',getter,params,valueFromProps);
        const [state,setState] = useState(valueFromProps||defaultVal)
        if (valueFromProps && valueFromProps != state) {
            setState(valueFromProps); // only once
        }

        useEffect(
            ()=>{
                if (!valueFromProps) {
                    async function doFetchFromApi () {
                        console.log('Fetching...');
                        var newVal = await getter(params);
                        console.log('Fetched new value from API: %s with %s',newVal,getter.name,params);
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

function useStudentPortfolio ({course, student, includeAssessments}) {

    const [busy,setBusy] = useState(false);
    const [origPortfolio,setOrigPortfolio] = useState([]);
    const [portfolio,_setPortfolio] = useState([]); // we don't return the "pure" setPortfolio because we wrap it
    const [saved,setSaved] = useState([]); // updated by comparing portfolio and original...

    const sp = Api.StudentPortfolio(course,student);

    useEffect( ()=>{

        async function getPortfolio () {
            try {
                console.log('useStudentPortfolio - getting portfolio data');
                setBusy(true);
                var newPortfolioData = await sp.get_portfolio();
                console.log('useStudentPortfolio - got portfolio data',newPortfolioData);
            }
            catch (err) {
                setBusy(false);
                console.log('useStudentPortfolio: Error fetching portfolio',err);
                console.log('useStudentPortfolio: ignoring...');
            }
            if (newPortfolioData) {
                var assessments;
                console.log('useStudentPortfolio - fetching assessments');
                try {
                    setBusy(true);
                    var assessments = await sp.get_assessments();
                    console.log('useStudentPortfolio - got assessments',assessments);
                }
                catch (err) {
                    setBusy(false);
                    console.log('useStudentPortfolio: Error fetching assessments',err);
                }
                try {
                    setPortfolio(Api.StudentPortfolio.parsePortfolio(newPortfolioData,assessments))
                }
                catch (err) {
                    console.log('useStudentPortfolio: Error parsing portfolio',newPortfolioData,assessments);
                    setBusy(false);
                    throw err;
                }
                setBusy(false);
            }
        }

        getPortfolio(); // do it!
        
    },
               [course,student]
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
        return result;
    }

    function setPortfolio (newPortfolio) {
        _setPortfolio(newPortfolio);
        if (JSON.stringify(newPortfolio)==JSON.stringify(origPortfolio)) {
            setSaved(true)
        }
        else {
            setSaved(false);
        }
    }

    return {
        busy, saved, // read-only
        portfolio, setPortfolio, savePortfolio,  // read/write/save
    }
    
}

var useCoursework = makeApiHook(Api.Classroom.get_coursework,[]);
useCoursework.displayName = 'useCoursework';
var useStudentWork = makeApiHook(Api.Classroom.get_student_work,[]);
useStudentWork.displayName = 'useStudentWork';
var useStudents = makeApiHook(Api.Classroom.get_students,[]);
useStudents.displayName = 'useStudents';

export {useCoursework,useStudents,useStudentWork,useStudentPortfolio}

