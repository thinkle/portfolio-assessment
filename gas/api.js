var functions = {}; var tests = {}

function get_teacher_classes (teacher) {
    var resp = Classroom.Courses.list(
        {teacherId:teacher,
         courseStates : ['ACTIVE'],
         pageSize: 25}
    ); // assume <25 classes (lazy)
    return resp.courses
}

function test_get_teacher_classes () {
    var results = get_teacher_classes('thinkle@innovationcharter.org')
    Logger.log('Got %s results: %s',results.length, results);
}

function get_sheet (id) {
    console.log('get_sheet(%s)',id);
    return SpreadsheetApp.openById(id).getActiveSheet().getDataRange().getValues()
}


function test_get_sheet () {
    var results = get_sheet('1RP7wlpGOrrfUbdvBXKYvRygomATov6DTp1OocBEinqI');
    Logger.log('Got %s results: %s',results.length,results);
}

functions.get_teacher_classes = get_teacher_classes;
functions.get_sheet = get_sheet;
tests.get_teacher_classes = test_get_teacher_classes;
tests.test_get_sheet = test_get_sheet;

function parseQuery (params, json) {
    console.log('parseQuery(%s,%s)',params,json);
    var f = params['function'] && params['function'][0]
    if (f) {
        if (!functions[f]) {
            json['error'] = 'Function '+f+' not found';
            return json;
        }
        console.log('Running function %s(%s,%s,%s,%s)',f, params.arg&&params.arg[0],
                    params.arg2&&params.arg2[0],
                    params.arg3&&params.arg3[0],
                    params.arg4&&params.arg4[0]
                   );
        json['result'] = functions[f](
            params.arg&&params.arg[0],
            params.arg2&&params.arg2[0],
            params.arg3&&params.arg3[0],
            params.arg4&&params.arg4[0]
        );
    }
    else {
        console.log('No function?');
    }
    return json;
}

function doGet (e) {
    var output =  {
        query : e.parameters
    };
    var cb = e.parameters.callback
    console.log('Run parseQuery');
    output = parseQuery(e.parameters,output);
    console.log('Done parsing query...');
    //http://googleappscripting.com/doget-dopost-tutorial-examples/
    output = cb+'('+JSON.stringify(output)+')';
    var JSONOutput = ContentService.createTextOutput(output)
    JSONOutput.setMimeType(ContentService.MimeType.JAVASCRIPT);
    return JSONOutput;
}


function doPost (e) {
    console.log('Got doPost %s',e);
    var cb = e.parameters.callback
    var output = cb+'('+JSON.stringify({
        query : e.parameters,
        postData : e.postData,
    })+')';
    console.log('Got doPost??? %s',output);
    var JSONOutput = ContentService.createTextOutput(output);
    JSONOutput.setMimeType(ContentService.MimeType.JAVASCRIPT);
    return JSONOutput
    //return ContentService.createTextOutput("Success") // JSONOutput
}

function testFunctions () {
    results = []
    var failures = 0;
    for (var key in tests) {
        var test = {test:key};
        try {
            test.result = tests[key]();
        }
        catch (err) {
            test.err = err;
            failures += 1;
        }
        results.push(test)
    }
    Logger.log('Ran %s tests: %s failures',results.length,failures);
    Logger.log('Results: %s',JSON.stringify(results));
}
