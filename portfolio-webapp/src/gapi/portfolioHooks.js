import {useState,useEffect} from 'react';
import Api from './gapi.js';
import {getProp} from '../utils.js';

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

export {useStudentPortfolio}
