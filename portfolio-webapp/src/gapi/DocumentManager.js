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
        getRequest () {
            return request;
        },
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
            console.log("Adding metadata with request",request);
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
                var updater = FileUpdater(fileId)
                updater.addAppProp('prop',key);
                //let appProperties = {prop:key}
                if (key.indexOf('portfolio-desc') > -1) {
                    var names = key.split('-');
                    if (names.length==4) {
                        if (names[2]=='export') {
                            //appProperties.role = 'portfolio-desc-export'
                            updater.addAppProp('role','portfolio-desc-export');
                        }
                        //appProperties.courseId = names[3] // portfolio-desc-export-123124
                        updater.addCourse(names[3]);
                    }
                    else {
                        //appProperties.role = 'portfolio-desc'
                        updater.addAppProp('role','portfolio-desc');
                        updater.addCourse(names[2]);
                        //appProperties.courseId = names[2] // portfolio-desc-123124
                    }
                }
                if (typeof fileId == 'string' && 
                    fileId.length > 10 &&
                    key.indexOf('-')>-1) {
                    //console.log('DM:Try updating metadata!',fileId,appProperties)
                    // await gdrive.files.update({fileId : fileId,
                    //                            appProperties : appProperties});
                    await updater.execute();
                }
                else {
                    //console.log("Skip %s:%s, doesn't look like a file",key,fileId);
                }
                completed.push(updater);
            }
            return completed.map((u)=>u.getRequest());
        },

        async getRootFolderId () {
            var id = await Api.getProp('root-folder-id');
            if (id) {
                return id;
            }
            else {
                //console.log('DM:Creating root folder');
                var newFolder = await createFolder(rootFolderTitle);
                //console.log('DM:Got result: %s',JSON.stringify(newFolder.result));
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

        async shareFileWithClass (fid, course) {
            var group = course.courseGroupEmail;
            //console.log('Sharing with ',course.courseGroupEmail);
            var resp = await gdrive.permissions.create(
                {
                    fileId : fid,
                    sendNotificationEmail : false,
                    resource : {
                        role : 'reader',
                        type : 'group',
                        emailAddress : group
                    }
                });
            var students = await Api.Classroom.get_students({course});
            for (var student of students) {
                console.log('Share with ',student);
                var resp = await gdrive.permissions.create(
                    {
                        fileId : fid,
                        sendNotificationEmail : false,
                        resource : {
                            role : 'reader',
                            type : 'user',
                            emailAddress : student.profile.emailAddress
                        }
                    });
            }
            return resp;
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
            //console.log('DM:Creating student sheet with spreadsheetObj',spreadsheetObj);
            //console.log(title,prop);
            var response = await gsheets.spreadsheets.create(spreadsheetObj);
            console.log('DM:Created resulted in!',response);
            var ssheet = response.result;
            const fullprop = propname(course.id,prop,student.userId)
            await Api.setProp(fullprop,ssheet.spreadsheetId);
            var courseFolder = await this.getCourseFolder(course);
            await FileUpdater(ssheet.spreadsheetId)
                .addToFolder(courseFolder)
                .addCourse(course.id) // ID
                .addStudent(student.userId)
                .addAppProp('prop',fullprop)
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
            //console.log('DM:Spreadsheet object: %s',spreadsheetObj);
            //console.log(JSON.stringify(spreadsheetObj));
            var response = await gsheets.spreadsheets.create(
                spreadsheetObj
            )
            //console.log('DM:Complete! %s',JSON.stringify(response.result));
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
            //console.log('DM:Created sheet! %s',JSON.stringify(response.result));
            //console.log('DM:ID=%s',response.result.id);
            const fullprop = propname(course.id,prop);
            await Api.setProp(fullprop,response.result.spreadsheetId)
            var courseFolder = await this.getCourseFolder(course);
            FileUpdater(response.result.spreadsheetId)
                .addToFolder(courseFolder)
                .addCourse(course.id)
                .addAppProp('prop',fullprop)
                .execute()
            return response.result;
        },

        async getUpdateTime (courseId, prop, studentId) {
            const fullprop = propname(courseId,prop,studentId);
            var id = await Api.getProp(fullprop);
            //console.log('DM:Getting modified time on',fullprop,id);
            if (!id) {
                return // undefined - never updated, doesn't exist
            }
            else {
                var response = await gdrive.files.get({fileId:id,fields:'modifiedTime'})
                //console.log(response);
                return response.result.modifiedTime;
            }
        },

        async getSheetId (courseId, prop, studentId) {
            const fullprop = propname(courseId,prop,studentId)
            var id = await Api.getProp(fullprop) // is a promise
            //console.log('DM:getSheetId: We had property',fullprop,'=>',id);
            if (!id) {
                //console.log('DM:Search drive for file... prop,',fullprop,courseId,prop,studentId);
                try {
                    var response = await gdrive.files.list(
                        {spaces:'drive',
                         corpora:'allDrives',
                         includeItemsFromAllDrives:true,
                         supportsAllDrives:true,
                     q:`appProperties has {key="prop" and value="${fullprop}"}`
                    }
                    );
                }
                catch (err) {
                    console.log('DM: Error searching for file ${fullprop} :(');
                    console.log(err)
                    throw err;
                }
                if (response.result.files.length==1) {
                    console.log('DM:Found a result ${fullprop}: ',response.result.files[0])
                    Api.setProp(fullprop,response.result.files[0].id);
                    return response.result.files[0].id
                }
                else if (response.result.files.length > 0) {
                    console.log(`DM:WARNING: ${response.result.files.length} results found for file for prop ${fullprop}:`,response.result.files);
                    return response.result.files[0].id;
                }
                else {
                    console.log(`DM:No file found ${fullprop}`);
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

DocumentManager.propname = propname;
export default DocumentManager;
