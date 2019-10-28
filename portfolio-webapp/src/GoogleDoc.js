// Convenient methods for creating a google doc :)
import React from 'react';
const TWIDTH = 468
const pad = '10pt'
const borderColor = '#e09f3e'
const head = {
    fontFamily: 'Raleway',
}
    
const s = {
    header : {backgroundColor:'#002290',color:'#fff3b0'},
    s1 : {fontSize:'36pt',...head,color:'#6e0e0a'},
    s2 : {fontSize:'22pt',...head,color:'#335c67'},
    s3 : {fontSize:'18pt',...head,color:'#335c67'},
    s4 : {fontSize:'14pt',...head,color:'#335c67'},
    s5 : {fontSize:'11pt',...head,color:'#335c67'},
    s6 : {fontSize:'10pt',...head,color:'#335c67'},
    oddRow : {backgroundColor: '#fff8d1',color:'#222'},
    evenRow : {backgroundColor: '#fff8d1',color:'#222'},
    grade : {color: '#6e0e0a'},
    // Note: google tables are a maximum of 468pt (6.5") wide on import
    // seems to be an insurpassable barrier in their import for unexplained reasons
    left : {width: `${TWIDTH * 0.37}pt`},
    right : {width: `${TWIDTH * 0.63}pt`},
    lsmall : {width: `${TWIDTH * 0.63 * 0.37}pt`},
    rsmall : {width: `${TWIDTH * 0.63 * 0.63}pt`},
    small : {fontSize: '8pt', color: '#3F717F'},
    extraSpacerTop : {
        // google docs requires a paragraph before a table -- this
        // spacer makes the paragraph line up with the table
        paddingTop : pad, 
    },
    extraSpacerSides : {
        marginLeft : pad,
        marginRight: pad
    },
    cell : {
        padding : pad,
        //border : `1px solid ${borderColor}`,
    },
    bbottom : {
        borderBottom : `1px solid ${borderColor}`
    },
    bleft : {
        borderLeft : `1px solid ${borderColor}`
    },
    bright : {
        borderRight : `1px solid ${borderColor}`
    },
    cellTight : {
        //border: `1px solid ${borderColor}`
    },
    minimal: {
        border : '0px solid #fff',
        padding : '9pt'
    },
    tbl : {
        borderCollapse:  true,
        //width: '540pt',
    },
    baseStyle : {
        fontSize : '10pt',
        fontFamily : 'Basic',
        color: '#101d21'
    },
}

s.cellLeft = {...s.left,...s.cell}
s.cellRight = {...s.right,...s.cell}

const d = {}

function inferDefault (name) {
    if (name.indexOf('cell')>-1) {
        return 'td'
    }
    else if (name.indexOf('row')>-1) {
        return 'tr'
    }
    else if (name.indexOf('tbl')>-1) {
        return 'table'
    }
    else {
        return 'div'
    }
}

function makeElements (name,styleNames,defaultEl) {
    if (!defaultEl) {
        defaultEl = inferDefault(name)
    }
    var style = {}
    styleNames.forEach(
        (sn)=>style={...style,...s[sn]}
    );
    const elements = ['div','span','tr','td','table'];
    d[name] = makeElement(defaultEl);
    elements.forEach(
        (el) => {
            if (!d[name]) {
                d[name] = {}
            }
            d[name][el] = makeElement(el);
        }
    );

    function makeElement (el) {
        const f = function (props) {
            return React.createElement(
                el,
                {...props,style},props.children
            );
        }
        f.displayName = name+el
        return f;
    }

}

for (var key in s) {
    makeElements(key,[key]);
}

d.thead = makeElements('theader',['s1','header'],'tr')

export default d;
