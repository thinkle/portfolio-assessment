import DocumentManager from './DocumentManager.js';
import Sheets from './SheetBasics.js';
import SheetManager from './SheetManager.js';

const ASPENEX = 'portfolio-desc-export'
const PDESC = 'portfolio-desc'

function PortfolioDesc (course) {

    const dm = DocumentManager();

    function get_portfolio_desc () {
        return new Promise((resolve,reject)=>{
            dm.getSheetId(course.id,PDESC)
                .then((id)=>{
                    if (id) {
                        SheetManager(id).getSheetsDataJson().
                            then(resolve)
                            .catch(reject);
                    }
                    else {
                        console.log('Do we create one?');
                        resolve();
                    }
                })
                .catch((err)=>{
                    console.log('Unable to find sheet property?');
                    reject(err)
                });
        }); // end promise
    }

    function get_portfolio_url () {
        return dm.getSheetUrl(course.id,PDESC);
    }

    function get_aspen_assignments_url () {
        return dm.getSheetUrl(course.id,ASPENEX);
    }

    async function set_portfolio_desc ({skills,descriptors}) {
        console.log('set_portfolio_desc!');
        console.log('set portfolio desc!',skills.length,descriptors.length)
        console.log('Got skills: %s',JSON.stringify(skills));
        console.log('Got descriptors: %s',JSON.stringify(descriptors));
        var skillsRowData = Sheets.jsonToRowData(skills);
        var descriptorsRowData = Sheets.jsonToRowData(descriptors);
        var data = [{rowData:skillsRowData,title:'skills'},
                 {rowData:descriptorsRowData,title:'descriptors'}
                   ]
        console.log('Fetching existing sheet ID?');
        var sheetId = await dm.getSheetId(course.id,PDESC);
        if (sheetId) {
            console.log('Sheet exists: update!');
            return SheetManager(sheetId).updateData(data);
        }        

        else {
            console.log('Sheet does not exist: create from scratch!');
            dm.createSheetForProp(
                course,
                PDESC,
                `${course.title} Portfolio Assessment Description`,
                data)
        }
    }

    async function set_aspen_assignments (assignmentList) {
        var headers = ['GB column name','Assignment name','Category','Date assigned','Date due','Total points','Extra credit points','Grade Scale','Grade Term'];
        var rowData = Sheets.jsonToRowData(assignmentList,headers);
        var sheetId = await dm.getSheetId(course.id,ASPENEX);
        if (sheetId) {
            return SheetManager(sheetId).updateData(
                [{rowData:rowData,title:'Aspen Export'}]
            );
        }
        else {
            return dm.createSheetForProp(
                course,
                ASPENEX,
                `${course.title} Aspen Export`,
                [{title:'Aspen Export',rowData}]
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
