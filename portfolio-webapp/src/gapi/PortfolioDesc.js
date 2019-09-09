import DocumentManager from './DocumentManager.js';
import Sheets from './SheetBasics.js';
import SheetManager from './SheetManager.js';

const ASPENEX = 'portfolio-desc-export'
const PDESC = 'portfolio-desc'

function PortfolioDesc (courseId) {

    const dm = DocumentManager();

    function get_portfolio_desc () {
        
    }

    function get_portfolio_url () {
        return dm.getSheetUrl(courseId,PDESC);
    }

    function get_aspen_assignments_url () {
        return dm.getSheetUrl(courseId,ASPENEX);
    }

    function set_portfolio_desc ({skills,descriptors}) {
    }

    async function set_aspen_assignments (assignmentList) {
        var headers = ['GB column name','Assignment name','Category','Date assigned','Date due','Total points','Extra credit points','Grade Scale','Grade Term'];
        var rowData = Sheets.jsonToRowData(assignmentList,headers);
        var sheetId = await DocumentManager.getSheetId(courseId,ASPENEX);
        if (sheetId) {
            SheetManager(sheetId).updateData(
                [{rowData:rowData,name:'Aspen Export'}]
            );
        }
        else {
            DocumentManager.createSheetForProp(
                courseId,ASPENEX,
                [{name:'Aspen Export',rowData}]
            );
        }
    }

    return {
        get_portfolio_desc,
        set_portfolio_desc,
        set_aspen_assignments,
        get_portfolio_url, // was get_sheets_url
        get_aspen_assignments_url,
    }

}

export default PortfolioDesc;
