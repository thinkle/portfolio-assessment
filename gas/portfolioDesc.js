function PortfolioDesc (classId) {

    var headers = ['strand','skill','points','dueDate','assignedDate'];
    
    var fileId = get_user_prop('portfolio-desc-'+classId);
    if (!fileId) {
        fileId = DocumentManager().createSheet(
            getClassTitle(classId)+' Portfolio Description',
            ['skills','descriptors'],
            classId
        )
        set_user_prop('portfolio-desc-'+classId,fileId);
    }
    
    return {
        get_skills_list : function () {
            return get_sheet(fileId,'skills');
        },
        
        set_skills_list : function (skillsList) {
            SheetManager(fileId)
                .setupTab([headers],'skills')
                .addRowsFromJSON(skillsList,'skills');
            return {success:true, sheetId:fileId,classId:classId}
        },
        append_to_skills_list : function (skillsList) {
            SheetManager(fileId)
                .addRowsFromJSON(skillsList,'skills');
            return {success:true, sheetId:fileId,classId:classId}
        },

        set_descriptors : function (descriptors) {
            SheetManager(fileId)
                .setupTab([descriptorHeaders],'descriptors')
                .addRowsFromJSON(descriptors,'descriptors');
            return {success:true,sheetId:fileId,classId:classId}
        },

        append_to_descriptors : function (descriptors) {
            SheetManager(fileId)
                .addRowsFromJSON(descriptors,'descriptors');
            return {success:true,sheetId:fileId,classId:classId}
        },

        get_descriptors : function () {
            return get_sheet(fileId,'descriptors');
        },

        get_portfolio : function () {
            return {
                skills : this.get_skills_list(),
                descriptors : this.get_descriptors(),
                classId : classId,
                sheetId : fileId,
            }
        }

    }

}

functions.get_portfolio_desc = function (classId) {
    return PortfolioDesc(classId).get_portfolio();
}

functions.get_skills_list = function (classId) {
    return PortfolioDesc(classId).get_skills_list();
}
functions.set_skills_list = function (skillsList, classId) {
    return PortfolioDesc(classId).set_skills_list(JSON.parse(skillsList));
}
functions.append_to_skills_list = function (skillsList, classId) {
    return PortfolioDesc(classId).append_to_skills_list(JSON.parse(skillsList));
}



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
