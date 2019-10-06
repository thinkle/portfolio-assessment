import {useState,useEffect} from 'react';
import Api from './gapi.js';
import {getProp,objProp,arrayProp,replaceItemInArray} from '../utils.js';



function useStudentPortfolioManager (params) {
    var defaultCourse
    if (params.course) {
        defaultCourse = params.course;
    }
    const busyMap = objProp(...useState({}))
    const portfolioMap = objProp(...useState({}))
    const origPortfolioMap = objProp(...useState({}));
    const savedStateMap = objProp(...useState({}));
    const doFetchNowMap = objProp(...useState({}));
    const spObjectMap = objProp(...useState({}));
    const errorMap = objProp(...useState({}));

    useEffect ( ()=> {

        async function goFetchPortfolio (id, callback) {
            const sp = spObjectMap.map[id]
            console.log('goFetchPortfolio with object',sp);
            if (!sp) {
                throw `fetchPortfolio called but spObject not set? ${id}`
            }
            try {
                busyMap.updateKey(id,true)
                var newPortfolioData = await sp.get_portfolio();
            }
            catch (err) {
                if (err.error = Api.StudentPortfolio.NO_PORTFOLIO_ERROR) {
                    console.log('No portfolio for student yet',id);
                }
                else {
                    errorMap.updateKey(id,err);
                    console.log('ERROR FETCHING PORTFOLIO',id,err);
                }
                busyMap.updateKey(id,false);
                return; // we're done if there's no portfolio data
            }
            busyMap.updateKey(id,false);
            if (newPortfolioData) {
                var assessments;
                busyMap.updateKey(id,true);
                try {
                    var assessments = await sp.get_assessments();
                }
                catch (err) {
                    if (err.error == Api.StudentPortfolio.NO_PORTFOLIO_ERROR) {
                        console.log('No assessments for student yet',id);
                    }
                    else {
                        console.log('ERROR FETCHING ASSESSMENTS',id,err);
                        errorMap.updateKey(id,err);
                    }
                }
            }
            try {
                var portf = Api.StudentPortfolio.parsePortfolio(newPortfolioData,assessments);
            }
            catch (err) {
                console.log('portfolioHooks: Error parsing portfolio',id,err);
                errorMap.updateKey(id,err);
            }
            // update original
            origPortfolioMap.updateKey(id,portf)
            // update current
            portfolioMap.updateKey(id,portf)
            // update saved state
            savedStateMap.updateKey(id,true);
            // Finally, call our callback :)
            busyMap.updateKey(id,false);            
            if (callback) {callback(portf);}
        }

        for (var key in doFetchNowMap.map) {
            const doFetch = doFetchNowMap.map[key];
            if (doFetch) {
                console.log('We have one to fetch!',key,doFetch);
                goFetchPortfolio(key,doFetch.callback);
                doFetchNowMap.updateKey(key,false);
            }
        }
        
    },
                [doFetchNowMap]
              );

    function makeID (course, student) {
        return course.id + '-' + student.userId
    }

    function hasPortfolio (student, course=defaultCourse) {
        return portfolioMap.map[makeID(course,student)]
    }

    function fetchPortfolio (student, course=defaultCourse, callback) {
        spObjectMap.updateKey(makeID(course,student),Api.StudentPortfolio(course,student));
        doFetchNowMap.updateKey(makeID(course,student),{doIt:true,callback:callback});
    }

    function setPortfolio (student, portfolio, course=defaultCourse) {
        var id = makeID(course,student);
        portfolioMap.updateKey(id,portfolio);
        if (JSON.stringify(portfolio)==JSON.stringify(origPortfolioMap.map[id])) {
            savedStateMap.updateKey(id,true);
        }
        else {
            savedStateMap.updateKey(id,false);
        }
    }

    async function savePortfolio (student, course=defaultCourse, callback) {
        var key = makeID(course,student);
        busyMap.updateKey(key,true)
        var sp = spObjectMap.map[key];
        if (!sp) {
            throw 'WTF? No object';
        }
        try {
            sp.set_portfolio_and_assessments(portfolioMap.map[key]);
            origPortfolioMap.updateKey(key,portfolioMap.map[key]);
            savedStateMap.updateKey(key,true);
        }
        catch (err) {
            errorMap.updateKey(key,err);
        }
        busyMap.updateKey(key,false)
    }

    function getPortfolio (student, course=defaultCourse, callback) {
        var result = portfolioMap.map[makeID(course,student)]
        if (!result) {
            console.log('getPortfolio comes up empty -- fetch it!');
            callback([]); // first one...
            fetchPortfolio(student,course,callback); // second one will be triggered when we fetch it!
            return []
        }
        else {
            if (callback) {callback(result)}
            return result
        }

    }

    function isBusy (student,course=defaultCourse) {
        if (course) {
            return busyMap.map[makeID(course,student)]
        }
        else {
            for (var val in Object.values(busyMap.map)) {
                if (val) {return true}
            }
        }
    }

    function getError (student,course=defaultCourse) {
        if (course) {
            return errorMap.map[makeID(course,student)]
        }
    }

    function getAllErrors () {
        var errors = []
        for (var id in errorMap.map) {
            if (errorMap.map[id]) {
                errors.push({id:id,error:errorMap.map[id]});
            }
        }
        return errors
    }

    return {
        fetchPortfolio,
        hasPortfolio,
        setPortfolio,
        savePortfolio,
        getPortfolio,
        getError,
        getAllErrors,

        getId (student, course=defaultCourse) {
            return makeID(course,student);
        },

        updateExemplarsForStudent (exemplars, student, course=defaultCourse) {
            var copy = updatePortfolioWithExemplars(portfolioMap.map[makeID(course,student)],exemplars)
            setPortfolio(student,copy,course);
            return copy;
        },
        
        // These last properties should mainly be used in the list for effects built using this hook...
        portfolioState:portfolioMap,
        savedState:savedStateMap,
        busyState:busyMap,
        errorState:errorMap,
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
        updateExemplars (exemplars) {
            var copy = updatePortfolioWithExemplars(portfolio,exemplars);
            setPortfolio(copy);
        },
        fetch () {
            setDoFetch(true)
        }
    }
    
}

function updatePortfolioWithExemplars (portfolio, exemplars) {
    if (portfolio) {
        var newPortfolio = [...portfolio];
    }
    else {
        var newPortfolio = [];
    }
    exemplars.forEach(
            (exemplar)=>{
                // deep copy portfolio...
                // and insert exemplar into it...
                if (exemplar.id) {
                    replaceItemInArray(newPortfolio,exemplar,'id',true)
                }
                else {
                    newPortfolio.push(exemplar);
                }
            });
    console.log('Built new portfolio structure: ',newPortfolio);
    return newPortfolio
}


export {useStudentPortfolio,useStudentPortfolioManager}
