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
    if (cell.effectiveFormat.numberFormat &&
        cell.effectiveFormat.numberFormat.type == 'DATE') {
        return getJsDateFromExcel(cell.userEnteredValue.numberValue);
    }
    else if (cell.userEnteredValue.numberValue) {
        return cell.userEnteredValue.numberValue
    }
    else {
        return cell.userEnteredValue.stringValue;
    }
}

function toCellData (v) {
    return {
        userEnteredValue : getValue(v),
        userEnteredFormat : getFormat(v),
    }

    function getValue (v) {
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
            else {
                return {
                    numberValue : v
                }
            };
        }
    }

    function getFormat (v) {
        if (v.toLocaleDateString) {
            console.log('learn to fomrat dates, wouldja?');
            return {
                numberFormat : {
                    type : 'DATE',
                }
            }
        }
    }
    
}

function getRowData (row) {
    console.log('handle row data: %s',row);
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
        console.log('Handle sheet %s: %s',title,JSON.stringify(data))
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
            headers = Object.keys(jsonArray[0]);
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
        return row.values.map(fromCellData)
    },

    getRowData,
    
}

export default Sheets
