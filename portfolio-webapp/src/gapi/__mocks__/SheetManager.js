import mockSheets from './mockSheets.js';

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
            mockSheets[sheetId].updated = new Date();
            console.log('Time updated=>',mockSheets[sheetId].updated);
            console.log('SheetManager: updateData!',mockSheets[sheetId]);
        },
        async getUrl () {
            return 'sheetUrl.org'
        }
    }

}

export default SheetManager;
