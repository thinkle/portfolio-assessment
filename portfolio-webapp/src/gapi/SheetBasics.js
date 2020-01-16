/* https://gist.github.com/christopherscott/2782634 */
function getJsDateFromExcel (excelDate) {
    return new Date(Math.round(
        (excelDate - (25567 + 2))
            *86400 
    ) *1000 // seconds
                   );
}
function getExcelDateFromJs (jsDate) {
    var time = jsDate.getTime();
    return ((time / (1000 * 86400)) + (25567+2))
}


function fromCellData (cell) {
    
    if (!cell.effectiveValue) {
       return undefined;
    }
    if (cell.effectiveFormat.numberFormat &&
        cell.effectiveFormat.numberFormat.type == 'DATE') {
        return getJsDateFromExcel(cell.effectiveValue.numberValue);
    }
    else if (cell.effectiveValue.numberValue) {
        return cell.effectiveValue.numberValue
    }
    else {
        return cell.effectiveValue.stringValue;
    }
}

function toCellData (v) {
    return {
        userEnteredValue : getValue(v),
        userEnteredFormat : getFormat(v),
    }

    function getValue (v) {
        if (v===undefined) {
            return {stringValue:""}
        }
        if (v.toLocaleDateString) {
            // We are a date!
            return {numberValue:getExcelDateFromJs(v)};
        }
        else {
            if (typeof v == 'string') {
                return {
                    stringValue : v
                }
            }
            else if (typeof v == 'number') {
                return {
                    numberValue : v
                }
            }
            else {
                console.log('WARNING: adding unknown type to spreadsheet',typeof v, v);
                return {
                    stringValue : JSON.stringify(v)
                }
            }
        }
    }

    function getFormat (v) {
        if (v && v.toLocaleDateString) {
            return {
                numberFormat : {
                    type : 'DATE',
                }
            }
        }
    }
    
}

function getRowData (row) {
    return {
        values : row.map(toCellData),
    }
}

var Sheets = {

    getSpreadsheetBody ({title, sheetsData}) {
        return {
            properties : {
                title : title,
            },
            sheets : sheetsData.map(this.getSheetBody)
        }
    },
   
    getSheetBody ({title,rowData,data}) {
        return {
            properties : {
                title:title
            },
            data : [
                {
                    startRow:0,
                    startColumn:0,
                    rowData : rowData||data.map(
                        getRowData
                    )
                }
            ]
        }
    },

    jsonToRowData (jsonArray, headers=undefined) {
        if (!headers) {
            headers = []
            for (var row of jsonArray) {
                for (var key in row) {
                    if (headers.indexOf(key)==-1) {
                        headers.push(key);
                    }
                }
            }
            headers.sort(); // alphabetical!
        }
        const rowData = [getRowData(headers)]
        for (var rn=0; rn<jsonArray.length; rn++) {
            var jsonRow = jsonArray[rn]
            var vanillaRow = headers.map((h)=>jsonRow[h]);
            rowData.push(getRowData(vanillaRow))
        }
        return rowData;
    },


    fromRowToJS (row) {
        if (!row.values) {
            return {}
        }
        return row.values.map(fromCellData)
    },

    getRowData,
    
}

export default Sheets
