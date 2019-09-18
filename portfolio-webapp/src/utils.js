function objProp (obj, setObj) {
    return {
        forEach : obj.forEach,
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
            var copy = {...obj}
            copy[k] = [...copy[k]]
            copy[k].splice(copy[k].indexOf(itm),1);
            setObj(copy);
        }
    }
}

function arrayProp (arr, setArr) {
    return {
        forEach : arr.forEach,
        map : arr.map,
        filter: arr.filter,
        reduce : arr.reduce,
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
        }
    }
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

export  {classNames, arrayProp, objProp}
