import React from 'react';



function repl (link) {
    var standaloneMatcher = /\/\/([^.]*)[.-][-]?([^.-]*)[.]repl.co.*/;
    var projectMatcher = /\/\/repl.it\/@([^\/]+)\/([^\/]+)/;
    var words = ['Assignment','Exercise','CSS','Your','Own','Adventure','Choose']
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

var r = repl();
console.log(r.toStandalone('https://repl.it/@DeclanDonahue/ChooseYourOwnAdventureAssignment'));
console.log(r.toProject('https://choose-your-own-adventure--hannahsan.repl.co/'));
console.log(r.toProject('https://choose-your-own-adventure--hannahsan.repl.co/'));
console.log(r.toProject('https://chooseyourownadventureassignment.kavyaadabala.repl.co'));

function MagicLink (props) {
    var r = repl()
    
    return (
        <span className='magic-link-box'>
          <a href={props.href} target="_blank" {...props}>{props.children}</a>
          {replitMagic()}
        </span>
    )

    function replitMagic () {
        
        return (
            props.href && 
            <span>
            {r.isStandalone(props.href) && 
                <a target="_blank" href={r.toProject(props.href)}>(Project)</a>
            ||
             r.isProject(props.href) &&
             <a target="_blank" href={r.toStandalone(props.href)}>(Standalone)</a>
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
    else {
        return url;
    }
}

export default MagicLink;
export {makeIframable}
