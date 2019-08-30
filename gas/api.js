var functions = {}; var tests = {}

function get_teacher_classes (teacher) {
    
    var resp = Classroom.Courses.list({teacherId:'thinkle@innovationcharter.org',
                            courseStates : ['ACTIVE'],
                                       pageSize: 25}); // assume <25 classes (lazy)
    return resp.courses
}

function test_get_teacher_classes () {
    results = get_teacher_classes('thinkle@innovationcharter.org')
    Logger.log('Got %s results: %s',results.length, results);
}

functions.get_teacher_classes = get_teacher_classes
tests.get_teacher_classes = test_get_teacher_classes

function parseQuery (params, json) {
    console.log('parseQuery(%s,%s)',params,json);
    var f = params['function'] && params['function'][0]
    if (f) {
        if (!functions[f]) {
            json['error'] = 'Function '+f+' not found';
            return json;
        }
      console.log('Running function %s',f);
        json['result'] = functions[f](
            params.arg,
            params.arg2,
            params.arg3,
            params.arg4
        );
    }
    console.log('No function?');
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
    return JSONOutput
}


function doPost (e) {
    var cb = e.parameters.callback
    var output = cb+'('+JSON.stringify({
        query : e.parameters
    })+')';
    var JSONOutput = ContentService.createTextOutput(output);
    JSONOutput.setMimeType(ContentService.MimeType.JAVASCRIPT);
    return JSONOutput
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
