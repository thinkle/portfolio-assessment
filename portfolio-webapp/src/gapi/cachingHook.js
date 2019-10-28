import {useState,useEffect} from 'react';
import Api from './gapi.js';
import {getProp} from '../utils.js';

function makeCachingApiHook ({getter, makeCacheName, defaultVal, dontFetch, alwaysRefetch, refetchAfter}) {

    return function (params, onValueChange) {
        const cacheName = makeCacheName(params)
        const [state,setState] = useState(defaultVal);
        const [fetching,setFetching] = useState(false);
        const [error,setError] = useState();
        const [doFetchNow,setFetchNow] = useState(false)
        var haveLocal = false;
        const renderTime = new Date().getTime();
        
        function setCache (val) {
            console.log('hooks: setting cache: ',cacheName,val);
            window.localStorage.setItem(cacheName,JSON.stringify(val));
            window.localStorage.setItem('time-'+cacheName,new Date().getTime());
        }

        function getLastCacheTime () {
            return Number(window.localStorage.getItem('time-'+cacheName))
        }

        function getCache () {
            console.log('hooks: fetching cache: ',cacheName);
            var val = window.localStorage.getItem(cacheName)
            if (val) {
                haveLocal = true;
                return JSON.parse(val);
            }
        }

        useEffect(            
            ()=>{

                async function doFetchFromApi () {
                    console.log('hooks: fetch from API!',cacheName);
                    setFetching(true);
                    try {
                        var newVal = await getter(params);
                    }
                    catch (err) {
                        setError(err);
                        return;
                    }
                    if (newVal !== state) {
                        setState(newVal);
                        setCache(newVal);
                    }
                    else {
                        console.log('hooks:No change in data we fetched!');
                    }
                    setFetching(false);
                }

                var cachedVal = getCache();
                if (cachedVal) {
                    setState(cachedVal);
                }

                if (doFetchNow) {
                    doFetchFromApi();
                    setFetchNow(false);
                }
                if (!haveLocal) {
                    console.log('hooks:No local copy: must fetch!',cacheName);
                    doFetchFromApi();
                }
                else if (haveLocal && alwaysRefetch) {
                    console.log('hooks: Have a local copy, refetch once for good measure...',cacheName);
                    doFetchFromApi();
                }
                else {
                    // we have a local, but how long has gone by...
                    const elapsedTime = renderTime - getLastCacheTime()
                    if (elapsedTime < refetchAfter) {
                        console.log(`hooks: No need to refetch -- still ${t.format(refetchAfter-elapsedTime)}  left`,cacheName);
                    }
                    else {
                        console.log(`hooks: Cache is stale: refetching!`,cacheName);
                        doFetchFromApi();
                    }
                }
            },
            [doFetchNow]
        );

        useEffect(
            ()=>{
                onValueChange &&
                    onValueChange(state)
            },[state]
        );


        return {
            value:state,
            clearCache () {setCache()},
            fetch ()  {setFetchNow(true)},
            fetching,
            error,
        }

    }
}

const t = {}

t.SECONDS = 1000;
t.MINUTES = 60*1000;
t.HOURS = 60*t.MINUTES;
t.DAYS = 24 * t.HOURS;
t.format = (s) => {
    var output = '';
    var remainingTime = s;
    for (let unit of ['days','hours','minutes','seconds']) {
        let timeQuantity = t[unit.toUpperCase()]
        var amt = Math.floor(remainingTime / timeQuantity );
        remainingTime = remainingTime % timeQuantity; // remainder to be dealt with...
        if (amt) {
            if (output) {
                output += ', ';
            }
            output += `${amt} ${unit}`
        }
    }
    return output;
}
        

export default makeCachingApiHook;
export {t}
