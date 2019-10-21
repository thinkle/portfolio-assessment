import {inspect} from 'util';
import download from 'downloadjs';
import Flatted from 'flatted';

function inspectDeep (obj) {
    return inspect(obj,{depth:null})
}

function Spy (object, spyName=null, parent=null) {

    console.log('SPY:New School Proxy Spy!',spyName,object,parent);
    if (object && object.__spy) {
        console.log('SPY:Spy on a spy?',object);
        return object
    }

    if (typeof object != 'object' || !object) {
        return object; // don't bother spying on null, etc
    }

    const accessed = {}
    const calls = {}
    const children = {}
    const cachedSpies = {}

    function MaybeSpy (object,name,parent) {
        if (cachedSpies[name]) {
            return cachedSpies[name]
        }
        else {
            const spy = Spy(object,name,parent);
            cachedSpies[name] = spy;
            return spy;
        }
    }

    if (parent) {
        if (!spyName) {
            spyName = 'anon'+Math.random()
        }
        parent[spyName] = {
            accessed,calls,children,spyName,
            parent,dumpCalls,
        }
    }

    const handler = {

        get (target, prop, receiver) {

            if (prop=='__spy') {
                return {spyName,accessed,calls,children,dump,dumpCalls,dumpCallbacks,printCalls,flatten}
            }

            var baseVal = target[prop]
            var val = baseVal;
            if (typeof baseVal == 'object') {
                val = MaybeSpy(baseVal,spyName + '.' + prop,children);
            }
            else if (typeof baseVal == 'function') {
                console.log('SPY:Function accessed as prop!')
                val = new Proxy(baseVal,makeFunctionHandler(spyName+'.'+prop))
            }
            if (!accessed.hasOwnProperty(prop)) {
                accessed[prop] = {prop,baseVal,val,count:1}
            }
            else {
                try {
                    accessed[prop].count += 1;
                    if (val != accessed.val) {
                        if (!accessed.oldVals) {
                            accessed.oldVals = []
                        }
                        accessed[prop].oldVals.push(accessed.val);
                        accessed[prop].val = val;
                    }
                }
                catch (err) {
                    console.log('Unable to log access of property',prop,target);
                }
            }
            return val;
        },
    }
    function makeFunctionHandler (prop, metadata) {
        return {
            apply (target, thisArg, args) {
                console.log('SPY:Apply invoked!');
                const meta = {
                    spyName : prop,
                    thisArg : thisArg,
                    args: args,
                    ...metadata
                }
                if (meta.isCallbackFor) {
                    if (!meta.isCallbackFor.callbacks) {
                        meta.isCallbackFor['callbacks'] = {}
                    }
                    meta.isCallbackFor.callbacks[prop] = meta;                    
                }
                return spyOnFunction(target,thisArg,args,prop,meta,calls,children,meta.isCallbackFor)
            }
        }
    }


    function dumpCallbacks () {

        return listCallbacks({children,calls})

        function listCallbacks ({children,calls,list=[]}) {
            for (let fname in calls) {
                var callArray = calls[fname];
                callArray.forEach(
                    (call) => {
                        if (call.spyName.match(/[.]\w\w[.]/)) {
                            console.log('Skip google weirdo',call.spyName);
                            return;
                        }
                        if (call.callbacks) {
                            list.push(call);
                            console.log(call.name,'callbacks');
                            for (var callbackName in call.callbacks) {
                                if (callbackName.match(/[.]\w\w[.]/)) {
                                    console.log('Skip google weirdness: ',callbackName);
                                }
                                else {
                                    list.push(
                                        call.callbacks[callbackName]
                                    );
                                }
                            }
                        }
                        else if (call.returnSpies) {
                            for (var spyname in call.returnSpies) {
                                listCallbacks(
                                    {...call.returnSpies[spyname],
                                     list}
                                )
                            }
                        }
                    }
                );
            }
            for (let childname in children) {
                listCallbacks({...children[childname],list})
            }
            return list;
        }
    }

    function dumpAll () {
        
    }

    function dumpCalls () {
        const dump = [];
        
        
        for (let fname in calls) {
            var callArray = calls[fname];
            callArray = calls[fname];
            callArray.forEach(
                (call,i) => {
                    if (call.spyName.match(/[.]\w\w[.]/)) {
                        console.log('Skip google weirdness',call.spyName);
                        return
                    }
                    const callObj = {
                        name : call.spyName,
                        args : call.args,
                    }
                    if (call.spyPromise) {
                        for (var key in call.returnSpies) {
                            if (key.indexOf(call.name)>-1) {
                                try {
                                    const callbacks = call.returnSpies[key].calls.then[0].callbacks;
                                    if (!callbacks) {
                                        callObj.response = undefined;
                                    }
                                    else {
                                        callObj.response = Object.values(callbacks)[0].args
                                    }
                                }
                                catch (err) {
                                    console.log('SPY ERROR Uh oh: trouble getting promise for ',call);
                                }
                            }
                        }
                    }
                    else {
                        callObj.retVal = call.retVal;
                    }
                    dump.push(callObj);
                }
            );

        } // end for fname in calls

        for (let child of Object.values(children)) {
            let childCalls = child.dumpCalls();
            for (let call of childCalls) {
                dump.push(call);
            }
        }
        
        return dump;
    }


    function flatten (obj) {
        return Flatted.stringify(obj);
    }

    function printCalls () {
        const allTheCalls = dumpCalls();
        var out = []
        allTheCalls.forEach(
            (call)=>{
                try {
                    out.push(JSON.stringify(call))
                }
                catch (err) {
                    console.log('Unable ot stringify ',call,err);
                }
            }
        );
        out = `[${out.join(',\n\t')}]`
        //console.log(out);
        download(out,'output.json','text/plain');
        return out
    }
    //     //return Flatted.stringify(dumpCalls())
    //     var indentLevel = 0

    //     function indent (s) {
            
    //         for (var i=0; i<indentLevel; i++) {
    //             s = '\t'+s
    //         }
    //         return '\n'+s;
    //     }

    //     var out = ''
    //     for (let method in calls) {
    //         out += '\n\n'
    //         out += indent('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    //         out += indent(`method ${method} called ${calls[method].length} times`);
    //         const methodCalls = calls[method]
    //         indentLevel += 1;
    //         methodCalls.forEach(
    //             (call,i)=>{
    //                 out += '\n'
    //                 out += indent('\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/ ')
    //                 out+= indent(`${i}: ${call.name}(${inspectDeep(call.args)})`);
    //                 if (call.spyPromise) {
    //                     for (var key in call.returnSpies) {
    //                         if (key.indexOf(call.name)>-1) {
    //                             const callbacks = call.returnSpies[key].calls.then[0].callbacks;
    //                             out += indent('.........................................')
    //                             out+=indent('!ASYNC! .then(~~callback~~)')
    //                             indentLevel += 1;
    //                             if (!callbacks) {
    //                                 out += indent(`no callback? ${inspectDeep(call.returnSpies[key])}`);
    //                             }
    //                             else {
    //                                 out += indent(`!! callback(${inspectDeep(Object.values(callbacks)[0].args)})`);
    //                             }
    //                             out += indent('.........................................')
    //                             indentLevel -= 1;
    //                         }
    //                     }
    //                 }
    //                 else {
    //                     out += indent(`  =>${inspectDeep(call.retVal)}`);
    //                 }
                                 
    //             }
    //         );
    //         indentLevel -= 1;
    //     }
    //     return out;
    // }

    function dump () {

        return describeNode({accessed,calls,children,spyName})

        function describeNode ({accessed, calls, children, name}) {
            console.log('Describe',name,accessed,calls,children);
            var start = ''
            if (name) {
                start = `${name} : `
            }
            return `
            ${start}{
               ${enumerateAccessed()}
            }
            `;

            function enumerateAccessed () {
                var out = ''
                for (var prop in accessed) {
                    if (accessed.hasOwnProperty(prop)) {
                        if (prop in calls) {
                            out += describeCall(prop);
                        }
                        else {
                            out += describeProp(prop);
                        }
                        out += '\n\t'
                    }
                }
                return out;
            }

            function describeProp (prop) {
                if (!accessed[prop]) {
                    console.log('Ignore',prop);
                    return ''
                }
                else if (children[prop]) {
                    return describeNode(children[prop])
                }
                else if (accessed[prop].val  && accessed[prop].val.__spy) {
                    console.log(`${prop} is a spy! RECURSION!`,prop,accessed[prop])
                    return describeNode(accessed[prop].val.__spy);
                }
                else {
                    return `\t${prop} : ${JSON.stringify(accessed[prop].baseVal)};\n`
                }
            }

            function describeCall (fname) {
                var out = `\t${fname} () {`
                var ifStatement = ''
                calls[fname].forEach(
                    (call) => {
                        var ifCondition = call.args.map(
                            (arg,i)=>`${makeMatcher(i,arg)}`
                        ).join(' && ');
                        if (ifCondition) {
                            out += `if (${ifCondition}) { ${makeReturn()} }`
                        }
                        else {
                            out += `if (arguments.length==${call.args.length}) {${makeReturn()}}`
                        }
                        function makeReturn () {
                            if (call.retVal && call.retVal.__spy) {
                                return `return ${describeNode(call.retVal)}`
                            }
                            else {
                                return `return ${inspectDeep(call.retVal)}`
                            }
                        }
                        function makeMatcher (argnum,arg) {
                            if (typeof arg == 'string' || typeof arg == 'number') {
                                return `arguments[${argnum}]==${JSON.stringify(arg)}`;
                            }
                            else {
                                return `typeof arguments[${argnum}] == "${typeof arg}"`
                            }
                        }
                        
                    }
                )
                out += '\t}'
                return out;
            }
            
        }
        
    }

    
    function spyOnFunction (f, thisArg, args, name, meta, calls, children, doPrint) {
        meta.name = name;
        const names = meta.name.split('.');
        meta.shortname = names[names.length - 1]
        args = args.map(
            (argument,i)=>{
                if (typeof argument == 'function') {
                    // spy on child?
                    let newFuncName = name+'Callback'+i;
                    return new Proxy(argument,makeFunctionHandler(newFuncName,{
                        isCallbackFor:meta,
                        argumentNumber : i,
                    }));
                }
                else if (typeof argument == 'object' && argument.hasOwnProperty) {
                    // modify in place...
                    for (var key in argument) {
                        if (argument.hasOwnProperty(key)) {
                            if (typeof argument[key] == 'function') {
                                let newFuncName = `${name}Callback${i}${key}`
                                argument[key] = new Proxy(argument[key],
                                                          makeFunctionHandler(
                                                              newFuncName,
                                                              {isCallbackFor:meta,
                                                               argumentNumber:i,
                                                               callbackName:key,
                                                              }));
                            }
                        }
                    }
                    return argument;
                }
                else {
                    return argument
                }
            }
        );
        meta.retVal = f.apply(thisArg,args);
        meta.argsDelivered = args;
        if (doPrint) {console.log('>>>SPY: CALLBACK!',name,'=>(',meta.args,')','meta',meta,'ch:',children,'parent',parent,'<<<')}
        if (!calls.hasOwnProperty(meta.shortname)) {
            calls[meta.shortname] = []
        }
        calls[meta.shortname].push(meta);
        meta.retName = name+'-returned-'+calls[meta.shortname].length // for further spying
        if (meta.retVal && meta.retVal.then) {
            meta.returnSpies = {
                functionThatReturnedThisPromise: meta,
            }
            meta.spyPromise = new MaybeSpy(meta.retVal,meta.retName,meta.returnSpies);
            return meta.spyPromise;
        }
        else {
            return meta.retVal;
        }
        //}                           
    }


    return new Proxy(object, handler);
}





function OldSchoolSpy (object, name=null, parent=null) {

    if (object && object.__spy) {
        console.log('SPY:Spy on a spy?',object);
        throw "STOP IT!"
    }
    console.log('SPY:Spy on ',object,typeof object,name,parent)
    if (typeof object != 'object' || !object) {
        return object; // long story pardner...
    }

    const accessed = []
    const calls = {}
    const children = {}

    if (parent) {
        if (!name) {
            name = 'anon'+Math.random()
        }
        parent[name] = {
            accessed,calls,children
        }
    }

    const mock = new Object();

    const properties = {}

    // let's crawl the object?
    console.log('SPY:Crawl object type',typeof object);
    Object.keys(object).forEach(
        function (key) {
            console.log('SPY:Mock key',key);
            properties[key] = {
                get : function () {
                    var baseVal = object[key];
                    var val = baseVal;
                    const item = {key:key,val:baseVal}
                    accessed.push(item);
                    if (typeof baseVal == 'object') {
                        val = Spy(object[key],key,children);
                    }
                    else if (typeof baseVal == 'function') {
                        val = functionLogger(object[key],key);
                    }
                    else {
                        val = baseVal
                    }
                    item.returnedVal = val;
                    return val;
                },
            }
        }
    );

    function functionLogger (f,name) {
        const retVal = f();

        const meta = {
            name : name,
            result : retVal,
        }
        if (!calls.hasOwnProperty(name)) {
            calls[name] = []
        }
        calls[name].push(meta)
        const retName = name+'-return-'+calls[name].length
        meta.returnName = retName;
        if (retVal && retVal.then) {
            meta.returnsPromise = true;
            return new Promise((resolve,reject)=>{
                retVal
                    .then(
                        (val)=>{
                            meta.resolveValue = val;
                            resolve(Spy(val,retName+'-resolve',children));
                        }
                    )
                    .catch(
                        (err)=>{
                            meta.rejectValue = err;
                            reject(err)
                        }
                    );
            });
        }
        else {
            return Spy(retVal,retName,children);
        }
    }

    properties['__spy'] = {get: function() {return {accessed,calls,children}}};

    Object.defineProperties(mock, properties);
    console.log('SPY:Built mock',JSON.stringify(mock),mock);
    return mock;
    
}

export default Spy;
