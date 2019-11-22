import mockSheets from './mockSheets.js';
import {inspect} from 'util';

function sleep (n) {
    return new Promise ((resolve,reject)=>{
        window.setTimeout(()=>resolve(),n)
    });
}



function SheetManager (sheetId) {

    return {
        async getJson (tab) {
            return mockSheets[sheetId][tab].json
        },
        async getSheetsData () {
            return mockSheets[sheetId].data
        },
        async getSheetData (tab) {
            return mockSheets[sheetId][tab].data
        },
        async getSheetDataJson (tab) {
            return mockSheets[sheetId].json[tab]
        },
        async getSheetsDataJson () {
            return mockSheets[sheetId].json
        },
        async updateData (sheets) {            
            sheets.forEach(
                (sheet)=>{
                    mockSheets[sheetId].json[sheet.title] = sheet.rowData
                }
            );
            await sleep(100)
            mockSheets[sheetId].updated = new Date();
            console.log('Time updated=>',mockSheets[sheetId].updated);
            console.log('SheetManager: updateData!',inspect(mockSheets[sheetId]));
        },
        async getUrl () {
            return 'sheetUrl.org'
        }
    }

}

export default SheetManager;
