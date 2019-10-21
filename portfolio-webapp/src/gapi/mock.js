// basically we will have...

//window.gapi.client.sheets.spreadsheet.get(...some args)
// and then we want to return a promise that resolves with
// [{result:...}]...
//
//
// for this to work we need data of the structure...
// call name, args (JSON), response (JSON), return (JSON) (if not a promise?)

import _ from 'lodash';

function Mock (data) {

    // crawl
    const root = {};
    
    data.forEach(
        (callInfo) => {
            if (!_.get(root,callInfo.name)) {
                const callData = [callInfo];
                _.set(root,
                      callInfo.name,
                      mockFunctionFactory(callData)
                     );
                _.get(root,callInfo.name).callData = callData;
            }
            else {
                _.get(root,callInfo.name).callData.push(callInfo);
            }
        });

    return root;

}

function argsize (item) {
    if (_.isString(item)) {
        return 1;
    }
    if (_.isObjectLike(item)) {
        var propcount = 0;
        for (var key in item) {
            propcount += 1;
        }
        return propcount;
    }
    else {
        return 1;
    }
}

function mockFunctionFactory (callList) {
    return function () {
        callList = _.sortBy(callList,
                            [(o)=>(o.args.length * -1)],
                            [(o)=>(_.sum(o.args, argsize))],
                );
        for (let callInfo of callList) {
            if (argsAreSame(callInfo.args,arguments)) {
                if (callInfo.response) {
                    return new Promise((resolve,reject)=>{
                        resolve(callInfo.response);
                    });
                }
                else if (callInfo.retVal) {
                    return callInfo.retVal;
                }
            }
        }

        return new Promise((resolve,reject)=>{
            reject({
                type:'mockError',
                info:"Arguments don't match any of our data",
                callList:callList,
                arguments:arguments
            });
        });
    }
}

function argsAreSame (model, input) {
    for (let i=0; i<model.length; i++) {
        const modelArg = model[i];
        const inputArg = input[i];
        if (! _.isEqual(modelArg,inputArg)) {
            return false
        }
    }
    return true;
}

export default Mock;
