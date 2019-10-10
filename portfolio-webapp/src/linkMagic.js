import React from 'react';

function googledrive (link) {
    // example: https://drive.google.com/open?id=1riCPWUg9zz4Y4wYS9ccXRGl-N7k9-KgD
    const driveMatcher = /https:\/\/drive.google.com\/open[?]id=(.*)/;
    return {
        isDrive (url) {
            return url.match(driveMatcher);
        },
        toPreview (url) {
            const [fullurl,fileid] = url.match(driveMatcher);
            return `https://drive.google.com/file/d/${fileid}/preview`
        }
    }
}

function repl (link) {
    const standaloneMatcher = /\/\/([^.]*)[.-][-]?([^.-]*)[.]repl.co.*/;
    const projectMatcher = /\/\/repl.it\/@([^\/]+)\/([^\/]+)/;
    const words = ['Assignment','Exercise','CSS','Your','Own','Adventure','Choose']
    return {
        isProject (url) {return url.match(projectMatcher)},
        isStandalone (url) {return url.match(standaloneMatcher)},
        toStandalone (href) {
            const [url,user,project] = href.match(projectMatcher)
            return `https://${project}.${user}.repl.co/`.toLowerCase()
        },
        toProject (href) {
            var [url,project,user] = href.match(standaloneMatcher)
            project = project[0].toUpperCase() + project.substr(1);
            for (var w of words) {
                project = project.replace(w.toLowerCase(),w);
            }
            return `https://repl.it/@${user}/${project}/`
        }
        
    }
    
}

const r = repl();
const d = googledrive();

function MagicLink (props) {
    var r = repl()
    
    return (
        <span className='magic-link-box'>
          <a href={props.href} target="_blank" {...props}>{props.children}</a>
          {replitMagic()}
          {/* driveMagic() */}
        </span>
    )

    // function driveMagic () {
    //     return (
    //         props.href &&
    //             ''
    //     );
    // }

    function replitMagic () {
        
        return (
            props.href && 
                <span> 
            {r.isStandalone(props.href) && 
             <span>(Standalone) <a target="_blank" href={r.toProject(props.href)}>(Project ~ymmv)</a></span>
            ||
             r.isProject(props.href) &&
             <span>(Project) <a target="_blank" href={r.toStandalone(props.href)}>(Standalone)</a></span>
            }
            </span>
        )
    }
}

function makeIframable (url) {
    if (!url) {return url}
    var r = repl()
    if (r.isProject(url)) {
        return r.toStandalone(url)
    }
    else if (d.isDrive(url)) {
        return d.toPreview(url);
    }
    else {
        return url;
    }
}

MagicLink.repl = r;
MagicLink.gdrive = d;
export default MagicLink;
export {makeIframable}
