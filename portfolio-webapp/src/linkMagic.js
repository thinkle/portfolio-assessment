import React from 'react';

// example: https://drive.google.com/open?id=1riCPWUg9zz4Y4wYS9ccXRGl-N7k9-KgD
const driveMatcher = /https:\/\/drive.google.com\/open[?]id=(.*)/;
const gdrive = {
    isMatch (url) {
        return url.match(driveMatcher);
    },
    makeIframable (url) {
        const [fullurl,fileid] = url.match(driveMatcher);
        return `https://drive.google.com/file/d/${fileid}/preview`
    },
    linkExtras (url) {
        return '';
    },
}



const standaloneMatcher = /\/\/([^.]*)[.-][-]?([^.-]*)[.]repl.co.*/;
const projectMatcher = /\/\/repl.it\/@([^\/]+)\/([^\/]+)/;
const words = ['Assignment','Exercise','CSS','Your','Own','Adventure','Choose']
const repl = {
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
    },
    isMatch (url) {
        return this.isProject(url) || this.isStandalone(url);
    },
    makeIframable (url) {
        if (this.isProject(url)) {
            return this.toStandalone(url);
        }
        else {
            return url;
        }
    },
    linkExtras (href) {
        return (
            <span>
              {this.isStandalone(href) && 
               <span>
                 <tag>Standalone</tag>
                 <tag>
                   <a target="_blank" href={this.toProject(href)}>
                     (Project ~ymmv)
                   </a>
                 </tag>
               </span>
               ||
               this.isProject(href) &&
               <span>
                 <tag>Project</tag>
                 &nbsp;
                 <tag>
                   <a target="_blank" href={this.toStandalone(href)}>(Standalone)</a>
                 </tag>
               </span>
              }
            </span>
        )
    }
}

const trinketMatcher = /https:\/\/trinket.io\/[^e]/
const trinket = {
    isMatch (url) {
        return url.match(trinketMatcher);
    },
    makeIframable (url) {
        return url.replace('trinket.io/','trinket.io/embed/').replace('library','python').replace('/trinkets/','/');
    }
}

const matchers = [repl,gdrive,trinket]

function MagicLink (props) {
    const extras = []
    if (props.href) {
        matchers.forEach(
            (matcher)=>{
                if (matcher.isMatch(props.href)) {
                    var myExtras = matcher.linkExtras && matcher.linkExtras(props.href);
                    if (myExtras) {
                        extras.push(myExtras);
                    }
                }
            });
    }

    return (
        <span className='magic-link-box'>
          <a href={props.href} target="_blank" {...props}>{props.children}</a>
          {replitMagic()}
          {extras.map((e)=>e)}
        </span>
    )

    function replitMagic () {
        
    }
}

function makeIframable (url) {
    if (!url) {return url}
    for (var matcher  of matchers) {
        if (matcher.isMatch(url)) {
            if (matcher.makeIframable) {
                return matcher.makeIframable(url);
            }
        }
    }
    return url;
}

MagicLink.repl = repl;
MagicLink.gdrive = gdrive;
MagicLink.trinket = trinket;
export default MagicLink;
export {makeIframable}
