import Sheets from './SheetBasics.js';

var gapi, drive, sheets;
function getApi () {
    gapi = window.gapi;
    drive = gapi.client.drive;
    sheets = gapi.client.sheets;
}



function DocumentManager () {
    getApi();

    return {
        createSheet : function (title, sheetsData) {
            console.log('createSheet(%s)',JSON.stringify(sheetsData));
            return new Promise((resolve,reject)=>{
                var spreadsheetObj = Sheets.getSpreadsheetBody({title,sheetsData})
                console.log('Spreadsheet object: %s',spreadsheetObj);
                console.log(JSON.stringify(spreadsheetObj));
                sheets.spreadsheets.create(
                    spreadsheetObj
                ).then(
                    (response)=>{
                        console.log('Complete! %s',JSON.stringify(response.result));
                        resolve (response.result);
                    })
                    .catch((err)=>{
                        console.log('Error creating spreadsheet: %s',err);
                        reject(err)
                    })
            }); // end promise
        },
        
    }
}

export default DocumentManager;
