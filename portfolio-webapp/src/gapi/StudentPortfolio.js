import DocumentManager from './DocumentManager';
import Sheets from './SheetBasics.js';
import SheetManager from './SheetManager.js';

function StudentPortfolio (course, student) {
    const PORTPROP = 'student-portfolio'
    const GRADEPROP = 'portfolio-assessment'
    const dm = DocumentManager();

    async function set_portfolio_and_assessments (portfolioEntries) {
        const [portfolio,assessments] = splitPortfolioAndAssessmentData(portfolioEntries);
        console.log('Pushing portfolio data',portfolio);
        var portfolioResult = await set_portfolio(portfolio);
        console.log('Pushing assessments data',assessments);
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
        var id = await dm.getSheetId(course.id,PORTPROP,student.userId);
        if (id) {
            console.log('StudentPortfolio: exemplar data in file with ID: %s',id);
            var sheets = await SheetManager(id).getSheetsDataJson();
            return sheets.exemplars;
        }
        else {
            throw `No portfolio found for ${course.id}, ${PORTPROP},${student.userId}`
        }
    }

    async function get_assessments () {
        var id = await dm.getSheetId(course.id,GRADEPROP,student.userId);
        if (id) {
            console.log('StudentPortfolio: assessment data in file with ID: %s',id);
            var sheets = await SheetManager(id).getSheetsDataJson();
            return sheets.assessments;
        }
        else {
            throw `No portfolio found for ${course.id}, ${GRADEPROP},${student.userId}`
        }
    }

    async function get_portfolio_with_assessments () {
        var assessments = await this.get_assessments();
        var exemplars = await this.get_portfolio();
        return {
            assessments,exemplars
        }
    }

    return {
        get_portfolio,set_portfolio_and_assessments,
        set_portfolio,set_assessments,get_portfolio_with_assessments,
        get_assessments
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

export default StudentPortfolio;
