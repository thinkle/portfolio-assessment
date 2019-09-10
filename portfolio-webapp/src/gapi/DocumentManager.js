import Sheets from './SheetBasics.js';
import SheetManager from './SheetManager.js';
import Api from './gapi.js';

var gapi, gdrive, gsheets;
function getGapi () {
    gapi = window.gapi;
    gdrive = gapi.client.drive;
    gsheets = gapi.client.sheets;
}

function propname (courseId, prop) {
    return `${prop}-${courseId}`;
}

function DocumentManager () {
    getGapi();

    return {
        createSheet (title, sheetsData) {
            console.log('createSheet(%s)',JSON.stringify(sheetsData));
            return new Promise((resolve,reject)=>{
                var spreadsheetObj = Sheets.getSpreadsheetBody({title,sheetsData})
                console.log('Spreadsheet object: %s',spreadsheetObj);
                console.log(JSON.stringify(spreadsheetObj));
                gsheets.spreadsheets.create(
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

        createSheetForProp (course, prop,title, sheets) {
            return new Promise((resolve,reject)=>{
                var spreadsheetObj = Sheets.getSpreadsheetBody({title,sheetsData:sheets});
                gsheets.spreadsheets.create(
                    spreadsheetObj
                )
                    .then(
                        (response)=>{
                            console.log('Created sheet! %s',JSON.stringify(response.result));
                            console.log('ID=%s',response.result.id);
                            Api.setProp(propname(course.id,prop),response.result.spreadsheetId)
                                .then(resolve(response.result))
                                .catch((err)=>{
                                    console.log('Unable to store prop %s with result %s',propname(course.id,prop),response.result);
                                    reject(err)
                                });
                        }
                    )
                    .catch((err)=>{
                        console.log('Error creating spreadsheet');
                        console.log('Data was: ')
                        console.log('%s %s %s',course.id,prop,title);
                        console.log('sheets: %s',JSON.stringify(sheets))
                        console.log('spreadsheetObj: %s',JSON.stringify(spreadsheetObj));
                        reject(err)
                    });
            }); // end Promise
        },

        getSheetId (courseId, prop) {
            const propname = prop+'-'+courseId;
            return Api.getProp(propname) // is a promise
        },

        getSheetUrl (courseId, prop) {
            const propname = prop+'-'+courseId;
            return new Promise((resolve,reject)=>{
                Api.getProp(propname)
                    .then((id)=>{
                        if (id) {
                            return SheetManager(id).getUrl().then(resolve)
                        }
                        else {
                            resolve() // empty
                        }
                    })
                    .catch(reject);
            });
        },

        
        
        
    }
}

export default DocumentManager;
