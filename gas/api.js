var functions = {}; var tests = {}

function get_user () {
    // Basically a hello world: let's just see if we can
    // get the username or not.
    return Session.getActiveUser().getEmail();
}
functions.get_user = get_user;

function showWelcomePage () {
    // return an HTML welcome page.
    return HtmlService.createTemplateFromFile('welcome.html')
        .evaluate();
}

function get_sheet (id,tab) {
    console.log('get_sheet(%s)',id);
    try {
        var ssheet = SpreadsheetApp.openById(id);
    }
    catch (err) {
        console.log('Bad spreadsheet ID: %s',id);
        throw err;
    }
    if (!tab) {
        var sheet = ssheet.getActiveSheet();
    }
    else {
        var sheet = ssheet.getSheetByName(tab);
    }
    return sheet.getDataRange().getValues();
}

function get_sheet_json (id, tab) {
    var data = get_sheet(id,tab);
    var headers = data[0];
    var json = [];
    for (var rn=1; rn<data.length; rn++) {
        var obj = {}
        headers.forEach(
            function (h,cn) {
                obj[h] = data[rn][cn];
            }
        );
        json.push(obj)
    }
    return json;
}

function test_get_sheet () {
    var results = get_sheet('1RP7wlpGOrrfUbdvBXKYvRygomATov6DTp1OocBEinqI');
    Logger.log('Got %s results: %s',results.length,results);
}

functions.get_sheet = get_sheet;
tests.test_get_sheet = test_get_sheet;

function parseQuery (params, json) {
    console.log('parseQuery(%s,%s)',params,json);
    var f = params['function'] && params['function'][0]
    if (f) {
        if (!functions[f]) {
            json['error'] = 'Function '+f+' not found';
            return json;
        }
        console.log('Running function %s(%s,%s,%s,%s)',f, params.arg&&decodeURIComponent(params.arg[0]),
                    params.arg2&&decodeURIComponent(params.arg2[0]),
                    params.arg3&&decodeURIComponent(params.arg3[0]),
                    params.arg4&&decodeURIComponent(params.arg4[0])
                   );
        json['result'] = functions[f](
            params.arg&&decodeURIComponent(params.arg[0]),
            params.arg2&&decodeURIComponent(params.arg2[0]),
            params.arg3&&decodeURIComponent(params.arg3[0]),
            params.arg4&&decodeURIComponent(params.arg4[0])
        );
        console.log('=> RETURNS %s',json['result']);
    }
    else {
        console.log('No function?');
    }
    return json;
}

function doGet (e) {
    if (e.parameters.register) {
        return showWelcomePage();
    }
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
