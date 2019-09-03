function get_skills_list (metadata) {
    // Fix me :)
    metadata = JSON.parse(metadata);
    return get_sheet(metadata.sheetid);
}

var headerMap = {
    'strand':'Category',
    'points':'Total points',
    'skill':'Skill',
    'dueDate':'Date Due',
}

var typeAdjust = {
    'dueDate' : function (v) {return new Date(v)},
    'Date assigned' : function (v) {return new Date(v)},
    'Date' : function (v) {return new Date(v)},
}

function castVal (name, v) {
    if (typeAdjust[name]) {
        return typeAdjust[name](v)
    }
    else {
        return v
    }
}

function set_skills_list (skillsList, metadata) {
    metadata = JSON.parse(metadata);
    skillsList = JSON.parse(skillsList);
    var ss =  SpreadsheetApp.openById(metadata.sheetid);
    var sheet = ss.getActiveSheet();
    var output = []; 
    var fields = Object.keys(skillsList[0]);
    fields.sort();
    var headers = fields.map(function (f) {return headerMap[f]||f});
    console.log('fields are: %s',fields)
    output.push(headers);
    skillsList.forEach(
        function (data) {
            output.push(fields.map(function (f) {return castVal(f,data[f])}));
        })
    sheet.clear();
    sheet.getRange(1,1,output.length,headers.length).setValues(output);
    return {operation:'complete'}
}

function append_to_skills_list (skillsList, metadata) {
    metadata = JSON.parse(metadata);
    skillsList = JSON.parse(skillsList);
    headerMap = {
        'strand':'Category',
        'points':'Total points',
        'skill':'Skill',
        'dueDate':'Date Due',
    }
    var ss =  SpreadsheetApp.openById(metadata.sheetid);
    var sheet = ss.getActiveSheet();
    var output = []; 
    var fields = Object.keys(skillsList[0]);
    fields.sort();
    var headers = fields.map(function (f) {return headerMap[f]||f});
    console.log('Headers are: %s',headers)
    output.push(headers);
    skillsList.forEach(
        function (data) {
            sheet.appendRow(fields.map(function (f) {return castVal(f,data[f])}));
        })
    return {operation:'complete'}
}


function test_set_skills_list () {
    set_skills_list(
        [
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
        ],
        {sheetid:'1eQ06dgoeRDNdV8Zn7d2BaD0Pj1IbUPxX_FfBSbYqmwQ'}
    )
}

functions.get_skills_list = get_skills_list;
functions.set_skills_list = set_skills_list;
functions.append_to_skills_list = append_to_skills_list
