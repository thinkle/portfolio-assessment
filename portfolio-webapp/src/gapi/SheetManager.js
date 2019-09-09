import Sheets from './SheetBasics.js';
var gapi, gsheets;

function getApi () {
    gapi = window.gapi;
    gsheets = gapi.client.sheets;
}

function SheetManager (sheetId) {
    getApi();
    async function getNoGrid () {
        var response = await gsheets.spreadsheets.get({spreadsheetId:sheetId,includeGridData:false})
        return response.result
    }

    async function getWithGrid () {
        var response = await gsheets.spreadsheets.get({spreadsheetId:sheetId,includeGridData:true})
        return response.result;
    }
    
    return {

        setupTab : function (data, tab) {
            
        },
        
        addRowsFromJSON : function (rows, tab) {
        },

        getJson : function (tab) {
            return new Promise((resolve,reject)=>{
                this.getSheetData(tab)
                    .then((arr)=>{
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
            return new Promise((resolve,reject)=>{
                getWithGrid()
                    .then((resp)=>{
                        var ssheet = resp.result
                        ssheet.sheets.forEach(
                            (sheet) => {
                                if (sheet.properties.title==tab) {
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

        updateData (sheets) {
            var id = 17; // start IDs at 17 (google does 0 or a big number)
            
            return new Promise((resolve,reject)=>{                
                var existingSheets = {}
                var toClear = []


                /** Helper functions... **/
                const makeUpdateRequest = (sheet) => {
                    return {
                        updateCells : {
                            rows:sheet.rowData||sheet.data.map(Sheets.getRowData),
                            fields:'*',
                            start:{
                                sheetId:existingSheets[sheet.title],
                                rowIndex:0,
                                columnIndex:0
                            }
                        }
                    };
                }

                const makeAddSheetRequest = (sheet) => {
                    while (Object.values(existingSheets).indexOf(id)>-1) {
                        id += 1;
                    }
                    existingSheets[sheet.title] = id;
                    id += 1;
                    return {
                        addSheet : {
                            properties : {
                                title : sheet.title,
                                sheetId : existingSheets[sheet.title],
                            }
                        }
                    }
                }

                const clearExistingSheets = () => {
                    return new Promise((resolve,reject)=>{
                        if (toClear.length>0) {
                            var rangeToClear = toClear.pop();
                            gsheets.spreadsheets.values.clear(
                                {spreadsheetId:sheetId,
                                 range:rangeToClear
                                }
                            )
                                .then(()=>clearExistingSheets().then(resolve))
                                .catch(reject)
                        }
                        else {
                            resolve();
                        }
                    });
                }

                const makeRequests = () => {
                    var requests = []
                    sheets.forEach((sheet)=>{
                        // clear each sheet first?
                        if (existingSheets[sheet.title] === undefined) {
                            requests.push(makeAddSheetRequest(sheet))
                        }
                        requests.push(makeUpdateRequest(sheet));
                    });
                    console.log('Making the following requests:');
                    console.log(JSON.stringify(requests));
                    gsheets.spreadsheets.batchUpdate(
                        {
                            spreadsheetId:sheetId,
                            resource : {
                                requests : requests,
                            }
                        }
                    ).then(resolve).catch(reject)
                }
                /** end helper functions **/


                var sheetsToUpdate = {}
                sheets.forEach(
                    (s)=>{sheetsToUpdate[s.title] = s}
                );
                // BODY OF ACTUAL CODE...
                getNoGrid().then(
                    (sheetData)=>{
                        sheetData.sheets.forEach((sheet)=>{
                            existingSheets[sheet.properties.title] = sheet.properties.sheetId
                            if (sheetsToUpdate[sheet.properties.title]!==undefined) {
                                toClear.push(`'${sheet.properties.title}'!1:${sheet.properties.gridProperties.rowCount}`);
                            }
                        });
                        clearExistingSheets()
                            .then(()=>{
                                makeRequests()
                            })
                            .catch((err)=>{
                                console.log('Error clearing existing data');
                                reject(err)
                            });
                    }
                )
                    .catch((err)=>{console.log('Trouble fetching sheet :(');reject(err)});
            });
        },


        getUrl : function () {
        },
    }

}

export default SheetManager;
