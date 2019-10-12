function objProp (obj, setObj) {
    return {
        map : obj,
        setMap : setObj,
        updateKeys (props) {
            setObj({...obj,...props});
        },
        updateKey (k,v) {
            setObj({...obj,[k]:v});
        },
        removeKey (k) {
            var copy = {...obj};
            delete copy[k]
            setObj(copy)
        },
        pushToArrayVal (k, itm, unique) {
            var copy = {...obj}
            if (copy[k]) {
                copy[k] = [...copy[k]]
            }
            else {
                copy[k] = []
            }
            if (!unique || copy[k].indexOf(itm)==-1) {
                copy[k].push(itm);
            }
            setObj(copy);
        },
        extendArrayVal (k, itms, unique) {
            var copy = {...obj}
            if (copy[k]) {
                copy[k] = [...copy[k]]
            }
            else {
                copy[k] = []
            }
            itms.forEach((itm)=>{
                if (!unique || copy[k].indexOf(itm)==-1) {
                    copy[k].push(itm)
                }
            }
            );
            setObj(copy);
        },
        removeFromArrayVal (k, itm) {
            var copy = {...obj};
            copy[k] = [...copy[k]];
            copy[k].splice(copy[k].indexOf(itm),1);
            setObj(copy);
        },
        updateArrayItemById (k, v, idprop='id', pushIfNoMatch=false) {
            var copy = {...obj};
            copy[k] = [...copy[k]];
            replaceItemInArray(copy[k],v,idprop,pushIfNoMatch)
            setObj(copy);
        }
    }
}

function arrayProp (arr, setArr) {
    var o = {
        arr : arr,
        remove (itm) {
            var copy = arr.slice();
            copy.splice(copy.indexOf(itm),1);
            setArr(copy);
        },
        push (itm) {
            console.log('push to array: ',itm,arr);
            var copy = arr.slice();
            copy.push(itm);
            setArr(copy);
        },
        updateById (val, idprop='id', pushIfNoMatch=false) {
            var copy = arr.slice();
            replaceItemInArray(copy,val,idprop,pushIfNoMatch);
            setArr(copy);
        },
        indexOf (val) {
            return arr.indexOf(val);
        }
    }

    if (arr) {
        o.forEach = arr.forEach;
        o.map = arr.map;
        o.filter = arr.filter;
        o.reduce = arr.reduce;
    }
    return o;
    
}

function classNames (obj) {
    var out = [];
    for (var className in obj) {
        if (obj[className]) {
            out.push(className);
        }
    }
    return out.join(' ');
}

function getItemById (arr, id, idprop='id') {
    for (let i=0; i<arr.length; i++) {
        const item = arr[i];
        if (item[idprop]==id) {
            return item
        }
    }
}

/*
Allow a . separated list of properties in a string.
Also, return undefined if any parent is undefined. 
*/
function getProp (obj, prop) {
    if (typeof prop != 'string') {
        throw `getProp needs prop to be a string but got ${prop}`
    }
    const props = prop.split('.');
    for (var p of props) {
        if (obj===undefined) { return obj }
        obj = obj[p]
    }
    return obj;
}

function replaceItemInArray (array, targetItem, idprop='id', pushIfNoMatch=false) {
    var replaced = false;
    for (let idx=0; idx<array.length; idx++) {
        const item = array[idx]
        if (item[idprop]==targetItem[idprop]) {
            array[idx] = targetItem;
            replaced = true;
        }
    }
    if (!replaced) {
        if (pushIfNoMatch) {
            array.push(targetItem);
        }
        else {
            throw {
                name : 'Error: item not found',
                id : targetItem[idprop],
                idprop : idprop,
                targetArray : array,
                newValue : targetItem
            }
        }
    }
}

function getById (array, idvalue, idprop='id') {
    for (var itm of array) {
        if (itm[idprop] == idvalue) {
            return itm;
        }
    }
}

function sanitize (content) { // FIXME: Replace with dompurify
    if (!content) {
        return content
    }
    content = content.replace(/<script[^>]>/g,'<div style="display:none" class="sanitizedScript">')
    content = content.replace(/<\/script>/g,'</div>')
    return {__html:content}
}


function gradeToNum (g) {
    var num = Number(g)
    if (!isNaN(num)) {
        return num;
    }
    if (g=='') {
        return 0;
    }
    const base = {
        'A':100,
        'B':85,
        'C':75,
        'D':65,
        'F':55,
        'M':0,
    }
    g = g.toUpperCase();
    if (base[g]) {
        return base[g];
    }
    const grade = g[0];
    const suffix = g.substr(1);
    if (base[grade]) {
        var baseNum = base[grade]
        if (suffix=='+') {
            return baseNum + 3
        }
        else if (suffix=='-') {
            return baseNum - 3
        }
        else {
            console.log('gradeToNum ignoring unknown suffix: ',g,suffix)
            return baseNum;
        }
    }
    else {
        return -1 // default to -1 -- unknown
    }
}

function timestamp () {
    var d = new Date();
    return `${d.toLocaleTimeString()}.${d.getMilliseconds()}`
}


export  {classNames, arrayProp, objProp, getItemById, getProp, replaceItemInArray,getById, sanitize, gradeToNum, timestamp}
