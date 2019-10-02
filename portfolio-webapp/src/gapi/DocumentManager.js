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


function FileUpdater (fileId) {
    
    var request = {fileId:fileId}
    
    return {
        addToFolder (folder) {
            request.addParents = folder;
            return this;
        },
        addAppProp (prop, val) {
            if (!request.appProperties) {
                request.appProperties = {}
            }
            request.appProperties[prop] = val
            return this;
        },
        addCourse (courseId) {
            this.addAppProp('courseId',courseId);
            return this;
        },
        addStudent (studentId) {
            this.addAppProp('studentId',studentId);
            return this;
        },
        execute () {
            return gdrive.files.update(request)
        }
    }
}


function DocumentManager () {
    getGapi();
    const rootFolderTitle = 'Portfolio Assessment Documents';

    function createFolder (title, parent, appProperties) {
        var fileMetadata = {
            name : title,
            mimeType : 'application/vnd.google-apps.folder'
        }
        if (parent) {
            fileMetadata.parents = [parent];
        }
        if (appProperties) {
            fileMetadata.appProperties = appProperties;
        }
        return gdrive.files.create({
            resource : fileMetadata,
            fields : 'id'
        });
    }

    
    return {

        async addMetadata () {
            //var id = await Api.getProp('root-folder-id');
            const completed = []
            var prefs = await Api.getPrefs().getProps();
            for (var key in prefs) {
                var fileId = prefs[key]
                let appProperties = {prop:key}
                if (key.indexOf('portfolio-desc') > -1) {
                    var names = key.split('-');
                    if (names.length==4) {
                        if (names[2]=='export') {
                            appProperties.role = 'portfolio-desc-export'
                        }
                        appProperties.courseId = names[3] // portfolio-desc-export-123124
                    }
                    else {
                        appProperties.role = 'portfolio-desc'
                        appProperties.courseId = names[2] // portfolio-desc-123124
                    }
                }
                if (typeof fileId == 'string' && 
                    fileId.length > 10 &&
                    appProperties.prop.indexOf('-')>-1) {
                    console.log('Try updating metadata!',fileId,appProperties)
                    await gdrive.files.update({fileId : fileId,
                                               appProperties : appProperties});
                }
                else {
                    console.log("Skip %s:%s, doesn't look like a file",key,fileId);
                }
                completed.push({fileId : fileId,
                                appProperties : appProperties});
            }
            return completed;
        },

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

        async createStudentSheet (course, student, prop, title, sheets, studentWrite) {
            var spreadsheetObj = Sheets.getSpreadsheetBody({title,sheetsData:sheets});
            console.log('Creating student sheet with spreadsheetObj',spreadsheetObj);
            console.log(title,prop);
            var response = await gsheets.spreadsheets.create(spreadsheetObj);
            console.log('Created resulted in!',response);
            var ssheet = response.result;
            await Api.setProp(propname(course.id,prop,student.userId),ssheet.spreadsheetId);
            var courseFolder = await this.getCourseFolder(course);
            await FileUpdater(ssheet.spreadsheetId)
                .addToFolder(courseFolder)
                .addCourse(course.id) // ID
                .addStudent(student.userId)
                .execute()

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
        
        async createSheet (title, sheetsData) {
            var spreadsheetObj = Sheets.getSpreadsheetBody({title,sheetsData})
            console.log('Spreadsheet object: %s',spreadsheetObj);
            console.log(JSON.stringify(spreadsheetObj));
            var response = await gsheets.spreadsheets.create(
                spreadsheetObj
            )
            console.log('Complete! %s',JSON.stringify(response.result));
            var rootId = await this.getRootFolderId()
            await FileUpdater(response.result.id)
                .addToFolder(rootId)
                .execute()
            return response.result;
        },

        async createSheetForProp (course, prop,title, sheets) {
            var spreadsheetObj = Sheets.getSpreadsheetBody({title,sheetsData:sheets});
            var response = await gsheets.spreadsheets.create(
                    spreadsheetObj
            )
            console.log('Created sheet! %s',JSON.stringify(response.result));
            console.log('ID=%s',response.result.id);
            await Api.setProp(propname(course.id,prop),response.result.spreadsheetId)
            var courseFolder = await this.getCourseFolder(course);
            FileUpdater(response.result.spreadsheetId)
                .addToFolder(courseFolder)
                .addCourse(course.id)
                .execute()
            return response.result;
        },

        async getSheetId (courseId, prop, studentId) {
            const fullprop = propname(courseId,prop,studentId)
            var id = await Api.getProp(fullprop) // is a promise
            console.log('getSheetId: We had property',fullprop,'=>',id);
            if (!id) {
                console.log('Search drive for file...');
                var response = await gapi.client.drive.files.list(
                    {spaces:'drive',
                     q:`appProperties has {key="prop" and value="${fullprop}"}`
                    }
                );
                if (response.result.files.length==1) {
                    console.log('Found a result: ',response.result.files[0])
                    Api.setProp(fullprop,response.result.files[0].id);
                    return response.result.files[0].id
                }
                else if (response.result.files.length > 0) {
                    console.log(`WARNING: ${response.result.files.length} results found for file for prop ${fullprop}:`,response.result.files);
                    return response.result.files[0].id;
                }
            }
            else {
                return id;
            }
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
