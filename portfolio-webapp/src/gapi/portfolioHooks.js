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
    const updatedTimeMap = objProp(...useState({}));
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
                var portf = await sp.get_portfolio_data();
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
            // update original
            origPortfolioMap.updateKey(id,portf.data)
            // update current
            portfolioMap.updateKey(id,portf.data)
            // update saved state
            updatedTimeMap.updateKey(id,portf.updatedTimes);
            savedStateMap.updateKey(id,true);
            // Finally, call our callback :)
            busyMap.updateKey(id,false);      
            if (callback) {callback(portf.data);}
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
            await sp.set_portfolio_and_assessments({
                data:portfolioMap.map[key],
                updatedTimes:updatedTimeMap.map[key],
            });
            origPortfolioMap.updateKey(key,portfolioMap.map[key]);
            savedStateMap.updateKey(key,true);
            var newTimes = await sp.get_updated_time();
            updatedTimeMap.updateKey(key,{...newTimes});
            console.log('Done saving!');
        }
        catch (err) {
            errorMap.updateKey(key,err);
            console.log('ERROR!');
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



function useStudentPortfolio (params) {
    console.log('useStudentPortfolio got params: ',params);
    const {course, student, includeAssessments, dontFetch} = params;
    const [busy,setBusy] = useState(false);
    const [origPortfolio,setOrigPortfolio] = useState([]);
    const [portfolio,_setPortfolio] = useState([]); // we don't return the "pure" setPortfolio because we wrap it
    const [saved,setSaved] = useState(true); // updated by comparing portfolio and original...
    const [doFetch,setDoFetch] = useState(!dontFetch)
    const [updatedTimes,setUpdatedTimes] = useState({});
    const sp = Api.StudentPortfolio(course,student);

    useEffect( ()=>{

        async function getPortfolio () {
            var newPortfolioData;
            try {
                console.log('hooks:useStudentPortfolio - getting portfolio data');
                setBusy(true);
                newPortfolioData = await sp.get_portfolio_data();
                console.log('hooks:useStudentPortfolio - got portfolio data',newPortfolioData);
            }
            catch (err) {
                setBusy(false);
                console.log('hooks:useStudentPortfolio: Error fetching portfolio',err);
                console.log('hooks:useStudentPortfolio: ignoring...');
            }
            if (newPortfolioData) {
                setOrigPortfolio(newPortfolioData.data);
                _setPortfolio(newPortfolioData.data);
                setUpdatedTimes(newPortfolioData.updatedTimes);
                setSaved(true)
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
            var result = await Api.StudentPortfolio(course,student).set_portfolio_and_assessments({
                data:portfolio,
                updatedTimes:updatedTimes,
            }
                                                                                                 );
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
