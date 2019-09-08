import Sheets from './SheetBasics.js';
var gapi, sheets;

function getApi () {
    gapi = window.gapi;
    sheets = gapi.client.sheets;
}

function SheetManager (sheetId) {
    getApi();
    function getNoGrid () {
        return sheets.spreadsheets.get({spreadsheetId:sheetId,includeGridData:false})
    }

    function getWithGrid () {
        return sheets.spreadsheets.get({spreadsheetId:sheetId,includeGridData:true})
    }
    
    return {

        setupTab : function (data, tab) {
            
        },
        
        addRowsFromJSON : function (rows, tab) {
        },

        getJson : function (tab) {
            console.log('Get me some json!');
            return new Promise((resolve,reject)=>{
                this.getSheetData(tab)
                    .then((arr)=>{
                        console.log('Got sheet data... convert to JSON');
                        var headers = arr[0];
                        var jsonData = []
                        for (var i=1; i<arr.length; i++) {
                            var jsonRow = {}
                            var row = arr[i];
                            for (var hi=0; hi<headers.length; hi++) {
                                jsonRow[headers[hi]] =row[hi];
                            }
                            jsonData.push(jsonRow);
                        }
                        resolve(jsonData);
                    })
                    .catch((err)=>reject)
            }); // end Promise
        },

        getSheetData : function (tab) {
            console.log('Get some sheet data...');
            return new Promise((resolve,reject)=>{
                getWithGrid()
                    .then((resp)=>{
                        console.log('Got sheet response');
                        var ssheet = resp.result
                        ssheet.sheets.forEach(
                            (sheet) => {
                                if (sheet.properties.title==tab) {
                                    console.log('Found sheet');
                                    console.log('Data: %s %s',typeof sheet,JSON.stringify(sheet));
                                    if (sheet.data.length > 1) {
                                        console.log('weird: got more than one dataset???');
                                    }
                                    resolve(sheet.data[0].rowData.map(Sheets.fromRowToJS));
                                }
                            }
                        );
                    })
                    .catch((err)=>reject(err))
            });
        },

        getUrl : function () {
        },
    }

}

export default SheetManager;
