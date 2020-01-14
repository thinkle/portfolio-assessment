import {useState,useEffect} from 'react';
import Api from './gapi.js';
import {timestamp,getProp,objProp,arrayProp,replaceItemInArray} from '../utils.js';

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
    const urlMap = objProp(...useState({}));

    useEffect( ()=>{
        console.log('REGISTER UNLOAD!')
        window.addEventListener('beforeunload',
                                function (e) {
                                    console.log('Beore Unload!');
                                    var message;
                                    var nunsaved = 0;
                                    savedStateMap.values().forEach((v)=>{
                                        if (!v) {
                                            nunsaved += 1;
                                        }
                                    });
                                    if (nunsaved > 0) {
                                        message = `${nunsaved} unsaved portfolio(s). Are you sure you want to reload the page? All changes will be lost`
                                    }
                                    if (!message) {
                                        message = undefined;
                                    }
                                    e.returnValue = message;
                                    console.log('message:',message);
                                    // Fix me ! This is *always* preventing unload
                                    return message;
                                });
    },[]);

    const checkForUpdatesToFetch = () => {
        //console.log('PH: Effect triggered!',timestamp())
        var timeouts = []

        async function goFetchPortfolio (id, callback) {
            const sp = spObjectMap.map[id]
            console.log('PH:goFetchPortfolio with object',sp);
            console.log('PH:State of the fetchies...',doFetchNowMap.map);
            if (!sp) {
                throw `fetchPortfolio called but spObject not set? ${id}`
            }
            try {
                busyMap.updateKey(id,true)
                console.log('PH:Firing off API Call to get portfolio data',timestamp(),id,callback)
                var portf = await sp.get_portfolio_data();
            }                        
            catch (err) {
                if (err.error == Api.StudentPortfolio.NO_PORTFOLIO_ERROR) {
                    console.log('PH:No portfolio for student yet',id);
                    if (callback) {callback([])}
                }
                else {
                    errorMap.updateKey(id,err);
                    console.log('PH:ERROR FETCHING PORTFOLIO',id,err);
                    callback([]); // for now...
                }
                busyMap.updateKey(id,false);
                return; // we're done if there's no portfolio data
            }
            try {
                const urls = await sp.get_urls()
                urlMap.updateKey(id,urls)
            }
            catch (err) {
                console.log('PH: ERROR UPDATING URLS');
                throw err;
            }
            // update original
            origPortfolioMap.updateKey(id,portf.data)
            // update current
            portfolioMap.updateKey(id,portf.data)
            // update saved state
            updatedTimeMap.updateKey(id,portf.updatedTimes);
            savedStateMap.updateKey(id,true);
            // Finally, call our callback :)
            console.log('PH:Set key not busy',id);
            busyMap.updateKey(id,false);      
            if (callback) {callback(portf.data);}
        }
        const toFetch = [];
        const toUpdate = {}
        for (var key in doFetchNowMap.map) {
            if (doFetchNowMap.map[key]) {
                toFetch.push({key:key,callback:doFetchNowMap.map[key].callback});
            }
            toUpdate[key] = false;
        }
        if (toFetch.length) {
            console.log('PH: %s to fetch, we will do one now',toFetch.length);
            const theFirstOne = toFetch[0]
            goFetchPortfolio(theFirstOne.key,theFirstOne.callback)
            for (let i=1; i<toFetch.length; i++) {
                let nextOne = toFetch[i];
                console.log('Set up timeout # ',i,'in',i*600,'ms');
                timeouts.push(
                    window.setTimeout(
                        function () {
                            console.log('Launching timeout #',i);
                            goFetchPortfolio(nextOne.key,nextOne.callback)
                        },
                        i * 2000
                    )
                );
            }
            doFetchNowMap.updateKeys(toUpdate);
        }
        return (()=>{
            //console.log('PH: Clearing timeouts');
            //timeouts.forEach((t)=>window.clearTimeout(t))
        });
        
    }

    useEffect(checkForUpdatesToFetch ,[doFetchNowMap]);

    function makeID (course, student) {
        return course.id + '-' + student.userId
    }

    function hasPortfolio (student, course=defaultCourse) {
        return portfolioMap.map[makeID(course,student)]
    }

    function getMany (students, course=defaultCourse, callback) {

        const newBusyMap = {};
        const newObjectMap = {};
        const newFetchMap = {};
        students.forEach(
            (student)=>{
                const id = makeID(course,student);
                if (portfolioMap.map[id]) {
                    window.setTimeout(callback(portfolioMap.map[id],student))
                }
                newBusyMap[id] = true;
                newObjectMap[id] = Api.StudentPortfolio(course,student);
                newFetchMap[id] = {doIt:true,callback:(data)=>callback(data,student)}
            }
        );
        busyMap.updateKeys(newBusyMap);
        spObjectMap.updateKeys(newObjectMap);
        doFetchNowMap.updateKeys(newFetchMap);
    }

    async function touchPortfolio (student, callback, errorCallback) {
        if (portfolioMap.map[makeID(defaultCourse,student)]) {
            const error ={
                student:student,
                error:'Already has a portfolio?',
                portfolio:portfolioMap.map[makeID(defaultCourse,student)]}
            console.log('Touch Portfolio had error',error);
            errorCallback(error);
        }
        else {

            try {
                var sp = Api.StudentPortfolio(defaultCourse,student,false)
                var result = await sp.set_portfolio_and_assessments(
                    {data: [{skill:'hello',reflection:'world'}],
                     updatedTimes:{
                         assessments:new Date(),
                         exemplars:new Date()
                     }},
                    false,
                    true
                );
                callback(result);
            }
            catch (err) {
                console.log('Error: ',err);
                errorCallback(err)
            }
        }
    }

    function fetchPortfolio (student, course=defaultCourse, callback) {
        const id = makeID(course,student);
        busyMap.updateKey(id,true)
        const sp = Api.StudentPortfolio(course,student)
        spObjectMap.updateKey(id,sp);
        doFetchNowMap.updateKey(id,{doIt:true,callback:callback});
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

    function saveOverPortfolio (student, course, callback, studentMode) {
        return savePortfolio(student,course,callback,studentMode,true);
    }

    async function savePortfolio (student, course=defaultCourse, callback=undefined, studentMode=false, force=false) {
        var key = makeID(course,student);
        console.log('PH:Set key busy',key);
        busyMap.updateKey(key,true)
        var sp = spObjectMap.map[key];
        if (!sp) {
            console.log( 'WTF? No object');
            sp = Api.StudentPortfolio(course,student);
        }
        try {
            const {updatedTimes,portfolioData} = await sp.set_portfolio_and_assessments(
                {
                    data:portfolioMap.map[key],
                    updatedTimes:updatedTimeMap.map[key],
                },
                studentMode,
                force
            );
            origPortfolioMap.updateKey(key,portfolioData);
            portfolioMap.updateKey(key,portfolioData);
            savedStateMap.updateKey(key,true);
            updatedTimeMap.updateKey(key,{...updatedTimes});
            console.log('PH:Done saving!');
        }
        catch (err) {
            errorMap.updateKey(key,err);
            console.log('PH:ERROR!',err);
        }
        console.log('PH:Set key not busy',key);
        busyMap.updateKey(key,false)
    }

    function getPortfolio (student, course=defaultCourse, callback) {
        const id = makeID(course,student)
        var result = portfolioMap.map[id]
        if (!result) {
            console.log('PH:getPortfolio comes up empty -- fetch it!');
            fetchPortfolio(student,course,callback);
            return []
        }
        else {
            console.log('PH:We have a result already!');
            // set our sp in case we want to save...
            spObjectMap.updateKey(id,Api.StudentPortfolio(course,student));
            if (callback) {callback(result)}
            return result
        }

    }

    function isBusy (student,course=defaultCourse) {
        console.log('PH:Check isbusy?',busyMap,makeID(course,student),busyMap.map[makeID(course,student)]);
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

    function getUrls (student, course=defaultCourse) {
        return urlMap.map[makeID(course,student)]
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
        getMany,
        hasPortfolio,
        touchPortfolio,
        setPortfolio,
        savePortfolio,
        saveOverPortfolio,
        getPortfolio,
        getError,
        getAllErrors,
        isBusy,
        spObjectMap,
        getUrls,

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
    console.log('PH:useStudentPortfolio got params: ',params);
    const {course, student, includeAssessments, dontFetch, studentMode} = params;
    const [busy,setBusy] = useState(false);
    const [error,setError] = useState();
    const [origPortfolio,setOrigPortfolio] = useState([]);
    const [portfolio,_setPortfolio] = useState([]); // we don't return the "pure" setPortfolio because we wrap it
    const [saved,setSaved] = useState(true); // updated by comparing portfolio and original...
    const [doFetch,setDoFetch] = useState(!dontFetch)
    const [updatedTimes,setUpdatedTimes] = useState({});
    const [urls,setUrls] = useState();
    const sp = Api.StudentPortfolio(course,student);

    useEffect( ()=>{
        console.log("REGISTER UNLOAD")
        window.addEventListener('beforeunload',
                                function (e) {
                                    // Fix me: always stopping reload...
                                    var message;
                                    if (!saved) {
                                        message = 'Portfolio not yet saved, are you sure you want to reload the page? All changes will be lost.'
                                    }
                                    e.returnValue = message;
                                    return message;
                                })
    },[])
    
    useEffect( ()=>{

        async function getPortfolio () {
            var newPortfolioData;
            try {
                console.log('PH:hooks:useStudentPortfolio - getting portfolio data');
                setBusy(true);
                newPortfolioData = await sp.get_portfolio_data();
                console.log('PH:hooks:useStudentPortfolio - got portfolio data',newPortfolioData);
            }
            catch (err) {
                setBusy(false);
                console.log('PH:hooks:useStudentPortfolio: Error fetching portfolio',err);
                console.log('PH:hooks:useStudentPortfolio: ignoring...');
            }
            if (newPortfolioData) {
                setOrigPortfolio(newPortfolioData.data);
                _setPortfolio(newPortfolioData.data);
                setUpdatedTimes(newPortfolioData.updatedTimes);
                setSaved(true)
                setBusy(false);
            }
            var urls = await sp.get_urls();
            setUrls(urls);
        }

        if (doFetch) {
            getPortfolio(); // do it!
        }
        else {
            console.log('PH:hooks: useStudentPortfolio holding off fetching for now...');
        }
        
    },
               [course,student,doFetch]
             );


    async function saveOverPortfolio () {return savePortfolio(true)}

    async function savePortfolio (force=false) {
        setError('');
        console.log('savePortfolio student',studentMode,'force',force,portfolio);
        setBusy(true);
        try {
            var result = await Api.StudentPortfolio(course,student).set_portfolio_and_assessments(
                {
                    data:portfolio,
                    updatedTimes:updatedTimes,
                },
                studentMode,
                force
            );
        }
        catch (err) {
            setBusy(false);
            setError(err);
            console.log('Error saving: ',err);//
            //throw err;
            return
        }
        setBusy(false);
        setSaved(true);
        setUpdatedTimes(result.updatedTimes);
        setOrigPortfolio(result.portfolioData);
        return result;
    }

    async function updateAndSaveExemplars (exemplars) {
        var copy = updatePortfolioWithExemplars(portfolio,exemplars);
        _setPortfolio(copy);
        setBusy(true);
        try {
            var result = await Api.StudentPortfolio(course,student).set_portfolio_and_assessments(
                {
                    data : copy,
                    updatedTimes : updatedTimes,
                },
                studentMode,
                false
            );
        }
        catch (err) {
            setBusy(false);
            setError(err);
            console.log('Error with updateAndSave',err);
            throw err;
            return;
        }
        setBusy(false);
        setSaved(true);
        setUpdatedTimes(result.updatedTimes);
        setOrigPortfolio(result.portfolioData);
        _setPortfolio(result.portfolioData);
        return result
    }

    function setPortfolio (newPortfolio) {
        _setPortfolio(newPortfolio);
        if (JSON.stringify(newPortfolio)==JSON.stringify(origPortfolio)) {
            setSaved(true)
        }
        else {
            console.log('PH:hooks:not the same: saved=false');
            setSaved(false);
        }
    }

    return {
        busy, saved, error, urls, // read-only
        portfolio, setPortfolio, savePortfolio, saveOverPortfolio,  // read/write/save
        updateAndSaveExemplars,
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
                else if (exemplar.skill) {
                    newPortfolio.push(exemplar);
                }
            });
    console.log('PH:Built new portfolio structure: ',newPortfolio);
    return newPortfolio
}


export {useStudentPortfolio,useStudentPortfolioManager}
