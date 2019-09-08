function PortfolioDesc (courseId) {
    console.log("PortfolioDesc(%s)",courseId);

    var headers = ['strand','skill','points','dueDate','assignedDate'];
    var descriptorHeaders = ['item','descriptor'];
    var dm = DocumentManager();
    
    var fileId = dm.getCourseSheet(
        'portfolio-desc',
        courseId,
        'Portfolio Description',
        ['skills','descriptors']
    );

    return {

        get_sheet_url : function () {
            return SpreadsheetApp.openById(fileId).getUrl()
        },
        
        get_skills_list : function () {
            return get_sheet_json(fileId,'skills');
        },
        
        set_skills_list : function (skillsList) {
            SheetManager(fileId)
                .setupTab([headers],'skills')
                .addRowsFromJSON(skillsList,'skills');
            return {success:true, sheetId:fileId,courseId:courseId}
        },

        get_skills_url : function () {
            return SpreadsheetApp.openById(fileId).getUrl()
        },
        
        append_to_skills_list : function (skillsList) {
            SheetManager(fileId)
                .addRowsFromJSON(skillsList,'skills');
            return {success:true, sheetId:fileId,courseId:courseId}
        },

        set_descriptors : function (descriptors) {
            SheetManager(fileId)
                .setupTab([descriptorHeaders],'descriptors')
                .addRowsFromJSON(descriptors,'descriptors');
            return {success:true,sheetId:fileId,courseId:courseId}
        },

        append_to_descriptors : function (descriptors) {
            SheetManager(fileId)
                .addRowsFromJSON(descriptors,'descriptors');
            return {success:true,sheetId:fileId,courseId:courseId}
        },

        get_descriptors_url : function () {return this.get_skills_url()},

        get_descriptors : function () {
            return get_sheet_json(fileId,'descriptors');
        },

        get_portfolio : function () {
            return {
                skills : this.get_skills_list(),
                descriptors : this.get_descriptors(),
                courseId : courseId,
                sheetId : fileId,
            }
        },

        set_aspen_assignments : function (rows) {
            var headers = ['GB column name','Assignment name','Category','Date assigned','Date due','Total points','Extra credit points','Grade Scale','Grade Term'];
            var exportSheetId = dm.getCourseSheet(
                'portfolio-desc-export',courseId,'Portfolio Assignments for Aspen'
            );
            SheetManager(exportSheetId)
                .setupTab([headers])
                .addRowsFromJSON(rows);
        },

        append_to_aspen_assignments : function (rows) {
            var exportSheetId = dm.getCourseSheet(
                'portfolio-desc-export',courseId,'Portfolio Assignments for Aspen'
            );
            SheetManager(exportSheetId)
                .addRowsFromJSON(rows);
        },

        get_aspen_assignments_url : function () {
            var exportSheetId = dm.getCourseSheet(
                'portfolio-desc-export',courseId,'Portfolio Assignments for Aspen'
            );
            return SpreadsheetApp.openById(exportSheetId).getUrl();
        },

    }

}

functions.get_sheet_url = function (courseId) {
    return PortfolioDesc(courseId).get_sheet_url();
}

functions.get_portfolio_desc = function (courseId) {
    return PortfolioDesc(courseId).get_portfolio();
}

function parseJson (itm) {
    try {
        return JSON.parse(itm)
    }
    catch (err) {
        console.log('Error parsing JSON');
        console.log('Item was: ');
        console.log(itm);
        throw err;
    }
}

// Make getter and setter functions
var lsts = ['skills_list','descriptors','aspen_assignments']
lsts.forEach(
    function (lstName) {
        functions['get_'+lstName] = function (courseId) {
            return PortfolioDesc(courseId)['get_'+lstName]
        }
        functions['set_'+lstName] = function (lst,courseId) {
            return PortfolioDesc(courseId)['set_'+lstName](parseJson(lst))
        }
        functions['append_to_'+lstName] = function (lst, courseId) {
            return PortfolioDesc(courseId)['append_to_'+lstName](parseJson(lst))
        }
        functions['get_'+lstName+'_url'] = function (courseId) {
            return PortfolioDesc(courseId)['get_'+lstName+'_url']()
        }
    }
);

function test_new_set_skills_list () {
    PortfolioDesc('test2').set_skills_list(
        [
            {strand:'Modeling',skill:'New Skill',dueDate:new Date(2019,9,1),points:100},
            {strand:'Modeling',skill:'New Skill',dueDate:new Date(2019,9,1),points:100},
            {strand:'Modeling',skill:'DRY',dueDate:new Date(2019,9,1),points:100},
            {strand:'Modeling',skill:'DRY',dueDate:new Date(2019,10,10),points:100},
            {strand:'Modeling',skill:'DRY',dueDate:new Date(2019,11,11),points:100},
            {strand:'Modeling',skill:'WET',dueDate:new Date(2019,9,1),points:100},
            {strand:'Modeling',skill:'WET',dueDate:new Date(2019,10,10),points:100},
            {strand:'Modeling',skill:'WET',dueDate:new Date(2019,11,11),points:100},
            {strand:'EU',skill:'Function Def',dueDate:new Date(2019,9,1),points:100},
            {strand:'EU',skill:'Function Def',dueDate:new Date(2019,10,10),points:100},
            {strand:'EU',skill:'Data Types',dueDate:new Date(2019,10,11),points:100},
            {strand:'EU',skill:'Data Types',dueDate:new Date(2020,1,11),points:100},       
        ]
    );
}

function resetPDProps () {
    PropertiesService.getUserProperties().deleteProperty('portfolio-desc-test');
    PropertiesService.getUserProperties().deleteProperty('portfolio-desc-test2');
}
