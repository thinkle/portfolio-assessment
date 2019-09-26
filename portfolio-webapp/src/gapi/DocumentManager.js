import Sheets from './SheetBasics.js';
import SheetManager from './SheetManager.js';
import Api from './gapi.js';

var gapi, gdrive, gsheets;
function getGapi () {
    gapi = window.gapi;
    gdrive = gapi.client.drive;
    gsheets = gapi.client.sheets;
}

function propname (courseId, prop, student) {
    if (student) {
        return `${prop}-${student}-${courseId}`;
    }
    else {
        return `${prop}-${courseId}`;
    }
}

function DocumentManager () {
    getGapi();
    const rootFolderTitle = 'Portfolio Assessment Documents';

    function createFolder (title, parent) {
        var fileMetadata = {
            name : title,
            mimeType : 'application/vnd.google-apps.folder'
        }
        if (parent) {
            fileMetadata.parents = [parent];
        }
        return gdrive.files.create({
            resource : fileMetadata,
            fields : 'id'
        });
    }

    
    return {

        async getRootFolderId () {
            var id = await Api.getProp('root-folder-id');
            if (id) {
                return id;
            }
            else {
                console.log('Creating root folder');
                var newFolder = await createFolder(rootFolderTitle);
                console.log('Got result: %s',JSON.stringify(newFolder.result));
                Api.setProp('root-folder-id',newFolder.result.id);
                return newFolder.id;
            }
        },

        async createCourseFolder (course) {
            var root = await this.getRootFolderId();
            var fileResp = await createFolder(
                course.name+' Portfolio Assessment Docs',
                root
            )
            
            Api.setProp(course.id+'-folder',fileResp.result.id);
            return fileResp.result.id;
        },

        async getCourseFolder (course) {
            var id = await Api.getProp(course.id+'-folder')
            if (id) {
                return id;
            }
            else {
                id = await this.createCourseFolder(course);
                return id
            }
        },

        addToFolder (id, folder) {
            return gdrive.files.update(
                {
                    fileId : id,
                    addParents : folder,
                }
            );
        },

        async createStudentSheet (course, student, prop, title, sheets, studentWrite) {
            var spreadsheetObj = Sheets.getSpreadsheetBody({title,sheetsData:sheets});
            console.log('Creating student sheet with spreadsheetObj',spreadsheetObj);
            console.log(title,prop);
            var response = await gsheets.spreadsheets.create(spreadsheetObj);
            console.log('Created resulted in!',response);
            var ssheet = response.result;
            await Api.setProp(propname(course.id,prop,student.id),ssheet.spreadsheetId);
            await this.addToCourseFolder(ssheet.spreadsheetId, course);

            const permissionsParams = {
                fileId : ssheet.spreadsheetId,
                sendNotificationEmail : false,
                resource : {
                    role : studentWrite && 'writer' || 'reader',
                    type : 'user',
                    emailAddress : student.profile.emailAddress,
                }
            }
            await gdrive.permissions.create(permissionsParams);
            return ssheet;
        },
        
        async addToCourseFolder (id, course) {
            var folder = await this.getCourseFolder(course);
            console.log('Got course folder: %s',folder);
            var result = await this.addToFolder(id,folder);
            return result
        },

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
                        this.getRootFolderId()
                            .then(
                                (rootId)=>this.addToFolder(response.result.id,rootId)
                                    .then(resolve(response.result))
                            )
                            .catch(reject);
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
                                .then(()=>{
                                    this.addToCourseFolder(response.result.spreadsheetId,course)
                                        .then(resolve(response.result))
                                        .catch((err)=>{
                                            console.log('Error adding to folder :(');
                                            throw err;
                                            reject(err);
                                        });
                                })
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

        getSheetId (courseId, prop, studentId) {
            //hello
            const fullprop = propname(courseId,prop,studentId)
            return Api.getProp(fullprop) // is a promise
        },

        getSheetUrl (courseId, prop, studentId) {
            const fullprop = propname(courseId, prop, studentId);
            return new Promise((resolve,reject)=>{
                Api.getProp(fullprop)
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
