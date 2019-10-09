import DocumentManager from './DocumentManager';
import Sheets from './SheetBasics.js';
import SheetManager from './SheetManager.js';

const DOES_NOT_EXIST = 1;
function StudentPortfolio (course, student) {
    const PORTPROP = 'student-portfolio'
    const GRADEPROP = 'portfolio-assessment'
    const dm = DocumentManager();
    const ASSCACHE = `student-portfolio-assessments-${course.id}-${student.userId}`
    const EXCACHE = `student-portfolio-exemplars-${course.id}-${student.userId}`
    const ASSCACHETIME = `student-portfolio-assessments-${course.id}-${student.userId}-update-time`
    const EXCACHETIME = `student-portfolio-exemplars-${course.id}-${student.userId}-update-time`

    var updatedTimes = {}

    async function set_portfolio_and_assessments (portData) {
        console.log('set_portfolio_and_assessments',portData);
        var portfolioEntries = portData.data;
        var fetchedTimes = {...portData.updatedTimes};
        const latestGoogleTimes = await get_updated_time();
        const [portfolio,assessments] = splitPortfolioAndAssessmentData(portfolioEntries);
        console.log('Check times: latest vs fetched',latestGoogleTimes,fetchedTimes);
        // Exemplars...
        if (latestGoogleTimes.exemplars > fetchedTimes.exemplars) {
            console.log('Crap, this was updated while we were playing with it...')
            console.log('PANIC!!!!!')
            throw 'Not yet implemented... :( :( :(';
        }
        else {
            console.log('Pushing portfolio data',portfolio);
            var portfolioResult = await set_portfolio(portfolio);
            console.log('Pushing assessments data',assessments);
        }
        // Assessments... (fix me - don't try for students).
        if (latestGoogleTimes.assessments > fetchedTimes.assessments) {
            console.log('Crap, assessments updated while we were playing - bad bad bad');
            throw 'oops - not implemeneted';
        }
        else {
            try {
                var assessmentResult = await set_assessments(assessments);
            }
            catch (err) {
                if (err.result && err.result.status=='PERMISSON_DENIED') {
                    console.log('No permission to write assessments - are we in student mode?');
                }
                else {
                    throw err;
                }
            }
        }
        console.log('success! returning results.');
        return [portfolioResult,assessmentResult];
    }

    async function set_portfolio (portfolioEntries) {
        var data = [{
            rowData:Sheets.jsonToRowData(portfolioEntries),
            title:'exemplars'
        }]

        var sheetId = await dm.getSheetId(course.id,PORTPROP,student.userId);
        if (sheetId) {
            return SheetManager(sheetId).updateData(data);
        }
        else {
            return dm.createStudentSheet(
                course, student, PORTPROP,
                `Portfolio Exemplars: ${course.name} ${student.profile.name.fullName}`,
                data,
                true,
            );
        }
    }
    
    async function set_assessments (assessments) {
        var data = [{
            rowData:Sheets.jsonToRowData(assessments),
            title:'assessments'
        }]
        var sheetId = await dm.getSheetId(course.id,GRADEPROP,student.userId);
        if (sheetId) {
            return SheetManager(sheetId).updateData(data);
        }
        else {
            return dm.createStudentSheet(
                course,student,GRADEPROP,
                `Portfolio Assessments: ${course.name} ${student.profile.name.fullName}`,
                data,
            );
        }
    }

    async function get_portfolio () {
        try {
            var cacheTime = JSON.parse(window.localStorage.getItem(EXCACHETIME))
        }
        catch (err) {
            console.log('Error parsing cache time...',window.localStorage.getItem(EXCACHETIME));
            cacheTime = 0;
        }
        if (!cacheTime || cacheTime < updatedTimes.exemplars) {
            var data = await get_portfolio_from_google();
            // Set cache!
            try {
                window.localStorage.setItem(EXCACHE,JSON.stringify(data));
                window.localStorage.setItem(EXCACHETIME,JSON.stringify(updatedTimes.exemplars||new Date()));
            }
            catch (err) {
                console.log('ERROR storing cache',EXCACHE,err);
            }
            return data;
        }
        else {
            console.log('using cache',EXCACHE);
            try {
                var data = JSON.parse(window.localStorage.getItem(EXCACHE))
            }
            catch (err) {
                console.log('Error parsing cached data',err,EXCACHE);
                console.log('Clearing cache...');
                window.localStorage.removeItem(EXCACHE)
                window.localStorage.removeItem(EXCACHETIME)
                console.log('Try again...');
                return get_portfolio(); // give it another go!
            }
            return data;            
        }
    }

    async function get_portfolio_from_google () {
        var id = await dm.getSheetId(course.id,PORTPROP,student.userId);
        if (id) {
            console.log('StudentPortfolio: exemplar data in file with ID: %s',id);
            var sheets = await SheetManager(id).getSheetsDataJson();
            return sheets.exemplars;
        }
        else {
            throw {
                error : DOES_NOT_EXIST,
                message:`No portfolio found for ${course.id}, ${PORTPROP},${student.userId}`
            }
        }
    }
    async function get_assessments () {
        try {
            var cacheTime = JSON.parse(window.localStorage.getItem(ASSCACHETIME));
        }
        catch (err) {
            console.log('Error parsing cache time',ASSCACHETIME,window.localStorage.getItem(ASSCACHETIME));
            cacheTime = 0;
        }
        if (!cacheTime || cacheTime < updatedTimes.assessments) {
            var data = await get_assessments_from_google();
            // set cache
            try {
                window.localStorage.setItem(ASSCACHE,JSON.stringify(data));
                window.localStorage.setItem(ASSCACHETIME,JSON.stringify(updatedTimes.assessments||new Date()));
            }
            catch (err) {
                console.log('ERROR storign cache',ASSCACHE,err);
            }
            return data;
        }
        else {
            console.log('using cache',ASSCACHE)
            try {
                var data = JSON.parse(window.localStorage.getItem(ASSCACHE))
            }
            catch (err) {
                console.log('Error parsing cached data',err,ASSCACHE);
                console.log('Clearing cache...');
                window.localStorage.removeItem(ASSCACHE)
                window.localStorage.removeItem(ASSCACHETIME)
                console.log('Try again...');
                return get_assessments(); // give it another go!
            }
            return data;
        }
    }
    
    async function get_assessments_from_google () {
        var id = await dm.getSheetId(course.id,GRADEPROP,student.userId);
        if (id) {
            console.log('StudentPortfolio: assessment data in file with ID: %s',id);
            var sheets = await SheetManager(id).getSheetsDataJson();
            return sheets.assessments;
        }
        else {
            throw {
                error : DOES_NOT_EXIST,
                message:`No portfolio found for ${course.id}, ${GRADEPROP},${student.userId}`
            }
        }
    }

    async function get_portfolio_with_assessments () {
        var assessments = await this.get_assessments();
        var exemplars = await this.get_portfolio();
        return {
            assessments,exemplars
        }
    }

    async function get_portfolio_data () {
        await get_updated_time(); // get our update times... 
        var portfolio = await get_portfolio(); // either from cache or google depending
        try {
            var assessments = await get_assessments(); // either from cache or google depending
        }
        catch (err) {
            if (err.error==DOES_NOT_EXIST) {
                var assessments = [];
            }
            else {
                throw err;
            }
        }
        var portData = parsePortfolio(portfolio,assessments);
        portData.updatedTimes = updatedTimes;
        return {
            data:portData,
            updatedTimes:{...updatedTimes}
        }
    }

    /* Update our local updatedTimes variable and also return it */
    async function get_updated_time () {
        updatedTimes.assessments = await dm.getUpdateTime(course.id,GRADEPROP,student.userId);
        updatedTimes.exemplars =  await dm.getUpdateTime(course.id,PORTPROP,student.userId);
        return updatedTimes;
    }

    async function get_urls () {
        return {
            assessments : await dm.getSheetUrl(course.id,GRADEPROP,student.userId),
            exemplars : await dm.getSheetUrl(course.id,PORTPROP,student.userId)
        }
    }

    return {
        //get_portfolio,// prefer get_portfolio_data
        set_portfolio_and_assessments,
        get_portfolio_data,
        //set_portfolio,set_assessments,get_portfolio_with_assessments,
        //get_assessments,
        get_updated_time,
        get_urls,
    }

}

/* Add assessment data to portfolios and return as one object */
function parsePortfolio (studentPortfolio, assessments) {
    // student portfolio consists of...
    // Exemplars: {id:..., permalink:..., reflection:..., coursework:..., submission..., skill: ...}
    // Assessments {id:..., note:..., grade:...}
    const portfolio = [];
    const exemplarById = {}
    studentPortfolio.forEach(
        (exemplar)=>{
            var copy = {...exemplar}
            exemplarById[exemplar.id] = copy;
            portfolio.push(copy);
        }
    ); // deepish copy portfolio
    if (assessments) {
        assessments.forEach(
            (assessment) => {
                if (exemplarById[assessment.id]) {
                    exemplarById[assessment.id].assessment = assessment; // done!
                }
                else {
                    console.log('WEIRD: We have an assessment for %s but no exemplar :(',assessment.id);
                }
            }
        );
    }
    return portfolio; 
}

/* Take a portfolio with assessment data and split it into a portfolio
without assessment data + an assessment list linked by ID. 
Add ID's to link them if they are not there already.
*/
function splitPortfolioAndAssessmentData (fullPortfolio) {
    const portfolio = []; const assessments = [];
    const idlist = [];
    fullPortfolio.forEach((exemplar) => exemplar.id&&idlist.push(exemplar.id));
    var topId = Math.max(...idlist);
    if (topId < 0) {
        topId = 0;
    }
    if (isNaN(topId)) {topId = 1};
    fullPortfolio.forEach(
        (exemplar) => {
            const exemplarCopy = {
                id : exemplar.id,
                skill : exemplar.skill.skill || exemplar.skill,
                courseworkId: exemplar.courseworkId, // || exemplar.submission.courseWorkId,
                submissionId : exemplar.submissionId, //|| exemplar.coursework.id,
                permalink : exemplar.permalink,
                reflection : exemplar.reflection,
                revisionCount : exemplar.revisionCount,
            }
            if (!exemplarCopy.id) {
                exemplarCopy.id = topId + 1;
                topId += 1;
                console.log("adding ID to exemplar",exemplarCopy)
            }
            if (exemplar.assessment) {
                var assessmentCopy = {...exemplar.assessment}
                assessmentCopy.id = exemplarCopy.id; // make the IDs equal
                assessments.push(assessmentCopy);
            }
            portfolio.push(exemplarCopy);
        }
    );
    return [portfolio, assessments]
}


StudentPortfolio.parsePortfolio = parsePortfolio; // convenience
StudentPortfolio.splitPortfolioAndAssessmentData = parsePortfolio; // convenience
StudentPortfolio.NO_PORTFOLIO_ERROR = DOES_NOT_EXIST
export default StudentPortfolio;
