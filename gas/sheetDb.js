/**
Convenience methods
**/
function getClassTitle (classId) {
    var googleClassroom;
    try {
        googleClassroom = Classroom.Courses.get(classId)
    }
    catch (err) {
        console.log('No google classroom found for ID %s',classId);
    }
    if (googleClassroom) {
        return googleClassroom.name;
    }
    else {
        return classId;
    }
}

function createRootFolder () {
    var folder = DriveApp.createFolder('Portfolio Assessment Documents');
    return folder.getId();      
}


// Simple system to adjust values based on data type
var typeAdjust = {
    'date' : function (v) {return v && new Date(v) || ''},
    'points' : function (v) {return Number(v)},
}

function castVal (name, v) {
    for (var keyword in typeAdjust) {
        if (name.toLowerCase().indexOf(keyword.toLowerCase())>-1) {
            v = typeAdjust[keyword](v);
        }
    }
    if (v===undefined) {
        return ''
    }
    return v
}




/** Our main objects are DocumentManager and SheetManager **/
function DocumentManager () {

    var rootFolderId = get_user_prop('portfolio-root-folder');

    if (!rootFolderId) {
        rootFolderId = createRootFolder()
        set_user_prop('portfolio-root-folder',rootFolderId)
    }

    function getCourseSheet (prop, courseId, title, tabs) {
        var propname = prop+'-'+courseId
        var fileId = get_user_prop(propname);
        if (fileId) {
            try {
                DriveApp.getFile(fileId)
            }
            catch (err) {
                console.log('Invalid ID set for %s-%s: %s',prop,courseId,fileId);
            }
            return fileId
        }
        else {
            fileId = this.createSheet(
                getClassTitle(courseId)+' '+'Portfolio Descripton',
                tabs
            );
            set_user_prop(propname,fileId);
        }
    }

    function rootFolder () {
        return DriveApp.getFolderById(rootFolderId);
    }

    
    
    function createClassFolder (classId) {
        var title = getClassTitle(classId)+' Portfolio Docs';
        console.log('Creating folder ',title);
        var folder = DriveApp.createFolder(title)
        DriveApp.getRootFolder().removeFolder(folder);    
        rootFolder().addFolder(folder);
        console.log('Created folder %s: ID %s, title %s',
                    folder,title,folder.getId());
        return folder.getId();
    }
    
    function classFolder (id) {
        var prop  = 'class-folder-'+id
        var folderId = get_user_prop(prop);
        if (!folderId) {
            folderId = createClassFolder(id)
            set_user_prop(prop,folderId)
        }
        try {
            return DriveApp.getFolderById(folderId);
        }
        catch (err) {
            Logger.log('Unable to open folder %s',folderId);
            console.log('Unable to open folder %s',folderId);
        }
    }

    function createSheet (title, tabs, classId) {
        // implement
        if (classId) {
            var parentFolder = classFolder(classId);
        }
        else {
            var parentFolder = rootFolder();
        }
        // Create sheet...
        var ss = SpreadsheetApp.create(title)
        // organize in folder...
        parentFolder.addFile(DriveApp.getFileById(ss.getId()));
        
        if (tabs) {
            tabs.forEach(
                function (t) {ss.insertSheet(t)}
            );
            ss.deleteSheet(ss.getSheetByName('Sheet1')); // remove default sheet
        }
        
        return ss.getId()
    }

    return {
        rootFolder : rootFolder,
        createSheet : createSheet,
        getCourseSheet : getCourseSheet,
    }
    
}

function SheetManager (sheetId) {
    return {
        getSpreadsheet : function () {
            return SpreadsheetApp.openById(sheetId);
        },
        
        getSheet : function (tab) {
            if (tab) {
                return this.getSpreadsheet().getSheetByName(tab);
            }
            else {
                return this.getSpreadsheet().getActiveSheet();
            }
        },
        
        setupTab : function (data, tab) {
            var sheet = this.getSheet(tab);
            sheet.clear();
            data.forEach(function (row) {
                sheet.appendRow(row); // FIXME a little inefficient/lazy of me :(
            });
            return this; // for chaining
        },
        
        addRowsFromJSON : function (rows, tab) {
            var sheet = this.getSheet(tab);
            var headers = sheet.getDataRange().getValues()[0] // first row
            rows.forEach(
                function (json) {
                    sheet.appendRow(headers.map(function (h) {
                        return castVal(h,json[h])
                    }));
                }
            );
            return this; // for chaining
        }
    }
}
/***********************
* Testing convenience  *
***********************/
function resetProp () {
    PropertiesService.getUserProperties().deleteProperty('class-folder-20912946613');
}

function testDocManager () {
    var dm = DocumentManager();
    var newSheetId = dm.createSheet('Test',['Tab1','Tab2'],20912946613);
    SheetManager(newSheetId)
        .setupTab([['Hello','World'],[1,2]],'Tab1')
        .setupTab([['Again I say','Hello!'],[3,4]],'Tab2')
        .addRowsFromJSON(
            [{
                'Hello':'A row via JSON',
                'World':123.124125125
            }],'Tab1');
    
    SheetManager(dm.createSheet('Test without tabs',undefined,20912946613))
        .setupTab([['Hello','Tabless','World']])
        .addRowsFromJSON([{
            Hello:17,
            Tabless:34,
            World:51
        }]);
}
