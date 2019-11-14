import React,{useState,useEffect} from 'react';
import ClassList from './ClassList.js';
import SkillsList from './SkillsList.js';
import SheetWidget from './SheetWidget.js';
import PortfolioBuilder from './PortfolioBuilder.js';
import ExemplarEditor from './ExemplarEditor.js';
import Editor from './RichText.js';
import Setting from './settings.js';
//import Api from './api.js';
import Api from './gapi/gapi.js';
import Gapi from './gapi/gapiLoader.js';
import DocumentManager from './gapi/DocumentManager.js';
import Sheets from './gapi/SheetBasics.js';
import SheetManager from './gapi/SheetManager.js';
import Prefs from './gapi/Prefs.js';
import AssignmentMapper from './AssignmentMapper.js';
import Portfolio from './Portfolio.js';
import {Modal,Button,Navbar,Buttons,SelectableItem,MultiSelector,Box,h,Container,Viewport,ProgressOverlay} from './widgets.js';
import Menu from './widgets/Menu.js';
import Tabs from './widgets/Tabs.js';
import {arrayProp} from './utils.js';
import DocWriter from './gapi/docWriter.js';
import TeacherAssignmentView from './TeacherAssignmentView.js';
import PortfolioExporter from './PortfolioExporter.js';
import RubricExporter from './RubricExporter.js';

const skills = [{"skill":"Correct tag syntax","strand":"EU","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":100,"skill":"Correct tag syntax","strand":"EU"}],"descriptor":"<ul><li>Correct start and end tags used.</li><li>You use nested tags, such as lists and list items.</li><li>You use headers and paragraphs correctly.</li><li>You use attribute values correctly inside of start tags.</li></ul>"},{"skill":"Tables & Lists","strand":"EU","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":100,"skill":"Tables & Lists","strand":"EU"}],"descriptor":"<ul><li>You create lists correctly.</li><li>You create ordered and unordered lists.</li><li>You create tables correctly in HTML.</li><li>you customize the style of lists and tables effectively.</li></ul>"},{"skill":"Use of Images","strand":"EU","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":100,"skill":"Use of Images","strand":"EU"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Use of Images","strand":"EU"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Use of Images","strand":"EU"}],"descriptor":"<ul><li>You use images effectively to aid your designs.</li><li>You are thoughtful in how image and text interact.</li><li>You are thoughtful in how colors in images interact with colors throughout the rest of your designs.</li></ul>"},{"skill":"Alignment (design principle)","strand":"EU","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Alignment (design principle)","strand":"EU"},{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Alignment (design principle)","strand":"EU"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Alignment (design principle)","strand":"EU"}],"descriptor":"<ul><li>The page makes a clean grid.</li><li>Alignments are either respected or broken intentionally and with gusto.</li><li>Page is easy to scan.</li></ul>"},{"skill":"Contrast (design principle)","strand":"EU","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Contrast (design principle)","strand":"EU"},{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Contrast (design principle)","strand":"EU"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Contrast (design principle)","strand":"EU"}],"descriptor":"<ul><li>Important elements stand out on the page.</li><li>Contrasts are clear and intentional.</li><li>Contrast is created effectively.</li><li>You use bold elements such as bright colors or large fonts sparingly so as to be effective in creating contrast.</li></ul>"},{"skill":"CSS selectors","strand":"EU","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"CSS selectors","strand":"EU"}],"descriptor":"<ul><li>You use classes and CSS class selectors correctly in your code.</li><li>You use IDs correctly in your code.</li><li>You use a variety of CSS selectors to simplify your code, including selectors for descendent elements, for classes and for IDs</li><li>(A) You use advanced selectors such as nth-child for particularly sophisticated effects.</li><li>(A) You use selectors such as :hover to create special effects.</li></ul>"},{"skill":"Grouping (design principle)","strand":"EU","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Grouping (design principle)","strand":"EU"},{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Grouping (design principle)","strand":"EU"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Grouping (design principle)","strand":"EU"}],"descriptor":"<ul><li>Like items are groups with like</li><li>White space is effectively used to separate different elements on the page.</li><li>White space is used for emphasis and contrast.</li></ul>"},{"skill":"Honors Design","strand":"EU","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Honors Design","strand":"EU"},{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Honors Design","strand":"EU"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Honors Design","strand":"EU"}],"descriptor":"<ul><li>You show a design that shows exceptional attention to layout.</li><li>You do an excellent job in using color.</li><li>You use typography in a superb way.</li><li>You create unique, creative effective design elements for your pages.</li></ul>"},{"skill":"Repetition (design principle)","strand":"EU","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Repetition (design principle)","strand":"EU"},{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Repetition (design principle)","strand":"EU"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Repetition (design principle)","strand":"EU"}],"descriptor":"<ul><li>Like elements are formatted similarly</li><li>Design has a clear and clean rhythm</li><li>Fonts are used thoughtfully to create a meaningful pattern</li><li>Color is used thoughtfully to create a meaningful pattern</li></ul>"},{"skill":"Typography and Fonts","strand":"EU","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Typography and Fonts","strand":"EU"}],"descriptor":"<ul><li>You choose fonts that fit the look and feel of your design effectively.</li><li>You use fonts with appropriate readability for the text type you are using them for (brand, logo, menu, paragraphs).</li><li>You effectively match or contrast typographic features throughout your site (weight, serif, slant, etc.)</li></ul>"},{"skill":"Use of Color","strand":"EU","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Use of Color","strand":"EU"}],"descriptor":"<p>You use color effectively in your design</p><ul><li>You choose colors that complement each other.</li><li>You avoid using multiple highly saturated colors (clashing)</li><li>You create designs that are still legible to the color-blind</li><li>You make sure text is readable throughout your page.</li><li>You use color to create contrast, rhythm and emphasis on the page.</li></ul>"},{"skill":"CSS Layout","strand":"EX","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":100,"skill":"CSS Layout","strand":"EX"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"CSS Layout","strand":"EX"}],"descriptor":"<p>You create effective layouts using CSS, including several of the following</p><ul><li>Using the box model correctly</li><li>Using the CSS grid</li><li>Using CSS floats</li><li>Using flexbox</li><li>Using a mixture of block, inline and inline-block elements.</li><li>Using absolute or fixed positioning.</li></ul>"},{"skill":"Honors Experimentation","strand":"EX","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":100,"skill":"Honors Experimentation","strand":"EX"},{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Honors Experimentation","strand":"EX"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Honors Experimentation","strand":"EX"}],"descriptor":"<ul><li>You get new and exceptionally challenging functionality working on your page.</li><li>You do a thorough job documenting original research.</li><li>You test your site thoroughly to make sure every page works across different devices. </li></ul>"},{"skill":"Research","strand":"EX","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":100,"skill":"Research","strand":"EX"},{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Research","strand":"EX"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Research","strand":"EX"}],"descriptor":"<ul><li>You research new technology and incorporate it into your site.</li><li>You do effective independent research to solve a technological and/or design problem.</li><li>You use comments to document your research.</li><li>You adapt what you learned through research to use in your site, going beyond simply cutting and pasting solutions.</li></ul>"},{"skill":"Valid Page","strand":"EX","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":100,"skill":"Valid Page","strand":"EX"},{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Valid Page","strand":"EX"}],"descriptor":"<ul><li>You create a valid page</li><li>You run your page through an online validator and remove all errors.</li></ul>"},{"skill":"Working Links","strand":"EX","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":100,"skill":"Working Links","strand":"EX"},{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Working Links","strand":"EX"}],"descriptor":"<ul><li>You create working internal links</li><li>You create working external links</li><li>You create correct references to resources such as sounds and images.</li></ul>"},{"skill":"Adaptive CSS","strand":"EX","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Adaptive CSS","strand":"EX"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Adaptive CSS","strand":"EX"}],"descriptor":"<ul><li>You create styles that work on a variety of device sizes.</li><li>You write special code to make your page adapt to different screen sizes.</li><li>You use media queries in your CSS.</li><li>You use font-sizes that are effective on mobile as well as computer displays.</li><li>You create navigational elements that work on a variety of devices.</li></ul>"},{"skill":"Branding","strand":"EX","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Branding","strand":"EX"}],"descriptor":"<ul><li>You create a site that has a strong brand identity.</li><li>You make effective use of a brand logo and colors.</li><li>You match a brand identity in all elements of the site (font, colors, graphic elements)</li></ul>"},{"skill":"Custom Font","strand":"EX","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Custom Font","strand":"EX"}],"descriptor":"<ul><li>You successfully use a custom font on a webpage (either imported from google fonts or installed directly on the site).</li><li>You use different variations of the font effectively (e.g. different weights or slants)</li></ul>"},{"skill":"Documentation","strand":"EX","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Documentation","strand":"EX"}],"descriptor":"<ul><li>You document your code clearly using comments in HTML, CSS and possibly also JQuery.</li><li>Your documentation makes your code easy to edit and understand.</li><li>You divide your code into easy-to-understand parts.</li><li>You name things like classes, IDs and javascript functions in such a way as to be \"self-documenting\" (i.e. self-explanatory)</li></ul>"},{"skill":"Menu navigation","strand":"EX","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Menu navigation","strand":"EX"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Menu navigation","strand":"EX"}],"descriptor":"<ul><li>You create a clean and easy to use menu to navigate a site.</li><li>You limit your menu items to make your site easy to use.</li><li>You design a multi-level menu to help navigate a site with more than one level of depth.</li></ul>"},{"skill":"Mobile design","strand":"EX","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Mobile design","strand":"EX"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Mobile design","strand":"EX"}],"descriptor":"<p>You design an effective \"mobile-first\" site.</p><ul><li>You use fonts that work well on mobile.</li><li>The look and feel of your site works well on a variety of phones.</li><li>Your site is easy to navigate using mobile (touch) controls.</li></ul>"},{"skill":"JQuery animation","strand":"EX","exemplars":[{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"JQuery animation","strand":"EX"}],"descriptor":"<ul><li>You create a variety of animations on the page using JQuery.</li><li>You create animations in response to user events.</li><li>You use animations to create interactive elements on the page, such as dropdown menus or tabs.</li></ul>"},{"skill":"JQuery UI","strand":"EX","exemplars":[{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"JQuery UI","strand":"EX"}],"descriptor":"<ul><li>You use animation to enhance the usability of your site.</li><li>You use animations to create a clear guide to how functions work on your site (such as opening/closing items).</li><li>You use subtle animations to create \"affordances\" on the page.</li></ul>"},{"skill":"Honors Modeling","strand":"MO","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":100,"skill":"Honors Modeling","strand":"MO"},{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":100,"skill":"Honors Modeling","strand":"MO"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Honors Modeling","strand":"MO"}],"descriptor":"<ul><li>You show exceptionally clean, well organized code.</li><li>You organize code in a way that makes it easy to solve design and coding problems.</li><li>You think in a logical, modular fashion in creating your pages.</li></ul>"},{"skill":"Page structure","strand":"MO","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":200,"skill":"Page structure","strand":"MO"}],"descriptor":"<ul><li>You use the html, head and body elements correctly.</li><li>You break your body down into clear, meaningful top-level sections (i.e. header, menu, content).</li></ul>"},{"skill":"Semantic Markup","strand":"MO","exemplars":[{"assignedDate":"2019-08-31T00:00:00.000Z","dueDate":"2019-10-15T00:00:00.000Z","points":150,"skill":"Semantic Markup","strand":"MO"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":150,"skill":"Semantic Markup","strand":"MO"}],"descriptor":"<ul><li>The HTML code of your site makes it clear what different parts of the page *are*.</li><li>You label elements of the site based on their functionality and purpose, not their look and feel (i.e. \"menu\" or \"caption\" not \"top\" or \"small italic text\").</li><li>Your code is designed so that changing the look and feel of the site is easy to do without changing the HTML itself.</li></ul>"},{"skill":"Modular design","strand":"MO","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":200,"skill":"Modular design","strand":"MO"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":200,"skill":"Modular design","strand":"MO"}],"descriptor":"<ul><li>You design reusable pieces of code that can be included in other projects (such as CSS and JavaScript for a menu that you could include in any project).</li><li>You separate out code into \"modules\" that can be reused and recombined.</li><li>You use outside modules or libraries (such as bootstrap or JQuery) to help simplify and improve your own code.</li></ul>"},{"skill":"Separation of Concerns","strand":"MO","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":150,"skill":"Separation of Concerns","strand":"MO"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":150,"skill":"Separation of Concerns","strand":"MO"}],"descriptor":"<ul><li>You successfully separate different elements of the code throughout your HTML, CSS and JavaScript, so that like elements are organized together.</li><li>You divide your code by functionality (e.g. code for menu animations vs. code for the color scheme vs. code for typography).</li><li>You use effective coding techniques to avoid unnecessary repetition.</li><li>Making changes to your site involves making minimal changes to your code, ideally focused in one area of your code at a time (e.g. it only requires changing a few lines of code to e.g. change the font).</li><li>You create sufficiently complex designs to require organizing your code around multiple layers of functionality (e.g. code that drives menus, code for color schemes, code for animations, etc.)</li></ul>"},{"skill":"Structure for Layout","strand":"MO","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":150,"skill":"Structure for Layout","strand":"MO"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":150,"skill":"Structure for Layout","strand":"MO"}],"descriptor":"<p>You show strong understanding of the different layout algorithms used by the browser and choose effectively among them to create designs of your choosing.</p><p><br></p><p>You are able to look at a variety of layouts and think of them in terms of proportions, grids, and alignments as needed in order to create the layouts using HTML and CSS.</p>"},{"skill":"UI Design","strand":"MO","exemplars":[{"assignedDate":"2019-10-06T00:00:00.000Z","dueDate":"2019-11-10T00:00:00.000Z","points":200,"skill":"UI Design","strand":"MO"},{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":200,"skill":"UI Design","strand":"MO"}],"descriptor":"<ul><li>You design a web-page that is easy to use.</li><li>Your page has clear affordances.</li><li>You use grouping and contrast to make it easy for a user to know how to navigate the site.</li></ul>"},{"skill":"Event-Driven JQuery","strand":"MO","exemplars":[{"assignedDate":"2019-12-01T00:00:00.000Z","dueDate":"2020-01-05T00:00:00.000Z","points":100,"skill":"Event-Driven JQuery","strand":"MO"}],"descriptor":"<ul><li>You use \"callbacks\" to let user events drive actions on your page in JQuery.</li><li>You structure your code in terms of functions that happen in response to user actions.</li></ul>"},{"skill":"Effective Communication","strand":"Outcomes","exemplars":[{"assignedDate":"2019-10-16T00:00:00.000Z","dueDate":"2020-01-15T00:00:00.000Z","points":1,"skill":"Effective Communication","strand":"Outcomes"}],"descriptor":"<ul><li>Students use systems thinking tools to make their understanding and knowledge visible.</li><li>Students listen actively and speak confidently to familiar and unfamiliar audiences.</li><li>Students read critically and write effectively to create and communicate meaning.</li><li>Students leverage technology to develop and communicate ideas.</li></ul>"},{"skill":"Problem Solving","strand":"Outcomes","exemplars":[{"assignedDate":"2019-10-16T00:00:00.000Z","dueDate":"2020-01-15T00:00:00.000Z","points":1,"skill":"Problem Solving","strand":"Outcomes"}],"descriptor":"<ul><li>Students use systems thinking tools to identify elements and connections within complex problems.</li><li>Students make interdisciplinary connections between and among academic disciplines.</li><li>Students make practical applications of their skills and learning to the world beyond the classroom.</li><li>Students can effectively generate and evaluate solutions.</li></ul>"},{"skill":"Self Direction","strand":"Outcomes","exemplars":[{"assignedDate":"2019-10-16T00:00:00.000Z","dueDate":"2020-01-15T00:00:00.000Z","points":1,"skill":"Self Direction","strand":"Outcomes"}],"descriptor":"<ul><li>Students use systems thinking tools to analyze their growth over time.</li><li>Students reflect on their own learning in order to both leverage their strengths and manage their personal challenges.</li><li>Students work independently by setting and meeting deadlines as well as manage timelines of intermediate steps.</li><li>Students assess and take risks as part of continuous growth in learning.</li></ul>"},{"skill":"Community Membership","strand":"Outcomes","exemplars":[{"assignedDate":"2019-10-16T00:00:00.000Z","dueDate":"2020-01-15T00:00:00.000Z","points":1,"skill":"Community Membership","strand":"Outcomes"}],"descriptor":"<ul><li>Students use systems thinking tools to model roles, relationships, and influences within community systems.</li><li>Students work collaboratively, using other people's roles and ideas to improve results.</li><li>Students demonstrate respect for and responsibility to their communities.</li><li>Students pursue cultural proficiency within themselves and their communities.</li></ul>"},{"skill":"Systems Thinking","strand":"Outcomes","exemplars":[{"assignedDate":"2019-01-16T00:00:00.000Z","dueDate":"2020-01-15T00:00:00.000Z","points":1,"skill":"Systems Thinking","strand":"Outcomes"}],"descriptor":"<ul><li>You used systems thinking tools or forms of analysis such as...</li><li class=\"ql-indent-1\">Stock/Flow Diagrams</li><li class=\"ql-indent-1\">Feedback Loops</li><li class=\"ql-indent-1\">Iceberg diagrams</li></ul>"}]

function TestView () {
    const [page,setPage] = useState('gapi')
    const [prop,setProp] = useState(undefined);
    var setting = Setting({name:'test-123',
                           data : {
                               testId : 'dummy-placeholder-value',
                               now : new Date(),
                               numerals : 24,
                               decimals: 3.33333333333333333
                           }})
    const [testId,setTestId] = useState(setting.data.testId);
    const [testUrl,setTestUrl] = useState('');
    const [testData,setTestData] = useState('');
    const [testUrls,setTestUrls] = useState([]);
    const [testState,setTestState] = useState(3);
    const [showButtons,setShowButtons] = useState(true);
    const [studentMode,setStudentMode] = useState(false);
    
    useEffect(
        ()=>{
            var urls = []
            if (testData && testData.forEach) {
                testData.forEach(findUrlsInObject);
            }
            else if (testData && typeof testData=='object') {
                findUrlsInObject(testData)
            }
            function findUrlsInObject (o) {
                for (var key in o) {
                    if (key.toLowerCase().indexOf('url') >-1) {
                        urls.push(
                            {name:key,
                             url:o[key]}
                        );
                    }
                    if (key.toLowerCase().indexOf('id') > -1 || key.toLowerCase().indexOf('portfolio') > -1) {
                        if (key.toLowerCase().indexOf('folder') > -1) {
                            urls.push(
                                {name:key,
                                 url:'https://drive.google.com/drive/folders/'+o[key]
                                });
                        }
                        else {
                            urls.push(
                                {name:key,
                                 url:'https://drive.google.com/file/d/'+o[key]}
                            );
                        }
                    }
                }
            }
            
            setTestUrls(urls);
        
        },[testData]);
    
    const prefs = Prefs();

    const defaultDoc = '1jgy6xGtMKcUnRHm0aRv57_fDpBi14usEbbl8A5iQ2ik'

    const defaultStudent = {
        "courseId":"20912946613",
        "userId": "109899082656923697222",
        "profile":{"id":"118286616169423182268",
                   "name":{"givenName":"Test","familyName":"Student","fullName":"Test Student"},
                   emailAddress:'test.student@innovationcharter.org',                   
                  },
    }

    const defaultCourse = {
        "id": "20912946613",
        "name": "Web Design 1",
        "section": "Fall 2019",
        "descriptionHeading": "Web Design 1 Fall 2019",
        "room": "241",
        "ownerId": "113561106451202000689",
        "creationTime": "2019-08-29T10:18:54.365Z",
        "updateTime": "2019-08-29T10:18:53.333Z",
        "enrollmentCode": "mxji4e0",
        "courseState": "ACTIVE",
        "alternateLink": "https://classroom.google.com/c/MjA5MTI5NDY2MTNa",
        "teacherGroupEmail": "Web_Design_1_Fall_2019_teachers_4eace9b4@innovationcharter.org",
        "courseGroupEmail": "Web_Design_1_Fall_2019_146614c0@innovationcharter.org",
        "teacherFolder": "Object",
        "guardiansEnabled": true,
        "calendarId": "innovationcharter.org_classroom5d9c6d99@group.calendar.google.com"
    }

    return (
        <div>
           <div>
             <h.h2>Tests</h.h2>
             {widgets()}
             {buttons()}
             {data()}
           </div>

        </div>
    );

    function buttons () {
        return <Box>
            {!showButtons && <Button onClick={()=>setShowButtons(true)}>(show test buttons)</Button>}
            <div style={{
                display : showButtons || 'none',
            }}>
              <Button onClick={()=>setShowButtons(false)}>(hide test buttons)</Button>
              <Buttons>
                <Button onClick={()=>setStudentMode(false)}>Teacher Mode</Button>
                <Button onClick={()=>setStudentMode(true)}>Student Mode</Button>
              </Buttons>
              <Box>
                <h.h3>Properties</h.h3>
                <Button onClick={()=>Api.getProp('foo').then((v)=>setProp(v))}>Get Foo Prop</Button>
                <Button onClick={()=>{
                    var val = 'foo' + Math.random()
                    Api.setProp('foo',val).then((v)=>setProp(v))}
                                }>Set Foo Prop</Button>
                <Button onClick={()=>{
                    var val = {name:'Tom',age:Math.random()*40+20,height:Math.random()*24+60+' inches'}
                    Api.setProp('foo',val).then((v)=>setProp(v))}
                                }>Set Foo Prop to JSON magic</Button>
                <Button onClick={()=>{
                    prefs.createPropFile().then((result)=>console.log('success! %s',JSON.stringify(result)));
                }}>Create new pref file...</Button>

                <Button onClick={()=>{
                    prefs.getPropFile().then((result)=>console.log('success! %s',JSON.stringify(result)));
                }}>Test new pref interface...</Button>

                <Button onClick={()=>{
                    prefs.getProps().then((result)=>setTestData(result))
                }}>Show props</Button>
                <Button onClick={()=>{
                    prefs.getProps().then(
                        (result)=>{
                            const toDelete = [];
                            for (var key in result) {
                                if (key.match('23982913786')) {
                                    toDelete.push(key)
                                }
                            }
                            prefs.deleteProps(toDelete)
                                .then('Done deleting ',toDelete);
                        });
                }}>
                  Remove Props for Class
                </Button>
                <Button onClick={()=>{
                    prefs.setProp('foo','val'+Math.random());
                }}>Update prop!</Button>
                <Button onClick={()=>{
                    async function foo () {
                        var p = await prefs.getProps();
                        var id = await prefs.getPropFile();
                        delete p['error']
                        prefs.updateFile(id,p);
                    }
                    foo();
                }}>Remove bad prop</Button>
                <button className="button is-danger" onDoubleClick={()=>{
                    prefs.getPropFile().
                        then((id)=>{
                            prefs.updateFile(id,{foo:'bar',new:'baz',bang:'booo'})
                        });
                }}>Clobber props! (dblclk)</button>
                <button className="button is-danger" onDoubleClick={()=>{window.localStorage.clear()}}>CLEAR LOCALSTORAGE (dblclk)</button>
              </Box>
              {/* <Box> */}
              {/*   <h.h3>UI</h.h3> */}
              {/*   <Button onClick={()=>setPage('exemplar')}>Test EXEMPLAR EDITOR</Button> */}
              {/*   <Button onClick={()=>setPage('portf')}>Show Portf</Button> */}
              {/*   <Button onClick={()=>setPage('assm')}>Show Assignment Mapper</Button> */}
              {/*   <Button onClick={()=>setPage('courses')}>List Classes</Button> */}
              {/*   <Button onClick={()=>setPage('builder')}>Build Portfolio</Button> */}
              {/*   {/\* <Button onClick={()=>setPage('embed')}>Test Embed</Button> *\/} */}
              {/*   {/\* <Button onClick={()=>setPage('portfolio')}>Show Portfolio</Button> *\/} */}
              {/* </Box> */}
              <Box>
                <h.h3>Google Doc Export</h.h3>
                <Button
                  onClick={
                      ()=>DocWriter.createFile(
                          {title:'Hello World!',
                           description:'A file I created',
                           body:`<html><head> <style>li {color: purple}</style></head>
                             <body><h3>Hello World</h3><p>This is a paragraph</p>
                             <ul><li>This list has a random number.</li>
                                 <li>${Math.random()*100} WOW!</li>
                             </ul></body></html>`}
                      ).then(setTestData).catch(setTestData)}
                >Export New Doc</Button>
                <Button
                  onClick={()=>{
                      DocWriter.updateFile('1UJtgB-Ef2Bxejx4RZwI-B_ce4o9HjjTr_xJZzC7rkn0',
                                           {description:'foo bar baz',
                                            body:`<html><body>Updated world <font size="10">Wow</font> <font size="1">Font tags</font>
                                              <p>${Math.random()*100}</p></body></html>`}
                                          );
                  }}
                >Update Doc</Button>
                <Button
                  onClick={()=>{
                      const p = Prefs(`file${Math.random()*3}.json`,false);
                      p.createPropFile({1:1,hello:'world',rando:Math.random()})
                          .then(setTestData)
                  }}
                >New Pref File!</Button>
              </Box>
              <Box>
                <h.h3>Drive/Docs</h.h3>
                <Button onClick={
                    ()=>Api.StudentPortfolio(defaultCourse,defaultStudent).get_portfolio_data().then(setTestData)
                }>Get portfolio...</Button>
                <Button onClick={
                    ()=>Api.StudentPortfolio(defaultCourse,defaultStudent).get_updated_time().then(setTestData)
                }>Get modified time on portfolio item...</Button>
                <Button onClick={
                    ()=>{
                        DocumentManager().createStudentSheet(
                            defaultCourse,
                            defaultStudent,
                            'sample-prop',
                            'Test Spreadsheet',
                            [{rowData:Sheets.jsonToRowData([{hello:'world'},{hello:'sheets'},{hello:'moon'},{hello:'sun'}]),
                              title:'howdy'}]
                        ).then(setTestData);
                    }
                }>
                  Test Create Student Sheet
                </Button>
                <Button onClick={()=>DocumentManager().addMetadata().then(setTestData)}>Set MEtadata</Button>

                <Button onClick={()=>
                                 DocumentManager().shareFile(
                                     defaultDoc,
                                     defaultStudent,
                                     {email:'This is a test email! Here is <a href="http://www.google.com">a link</a>'})
                                 .then(setTestData)
                                 .catch(setTestData)
                                }>
                  Share File w/ Email Test
                </Button>
                
                <Button onClick={
                    ()=>{window.gapi.client.drive.files.get({fileId:'167TcaEa5k6nibSfvMoznybGiZdTH4QQsOoO9V7_rq7c',fields:'appProperties,id'})
                         .then(setTestData)}}>Grab appProperties for file</Button>
                <Button onClick={()=>DocumentManager().getRootFolderId().then(setTestData)}>Create root folder?
                </Button>
                <Button onClick={()=>{
                    DocumentManager().getCourseFolder({title:'Test Course',id:'test-course-id'}).then(setTestData);
                }}>
                  createTestClassFolder
                </Button>
                
                <Button
                  onClick={()=>{
                      DocumentManager().createSheet(
                          'testTitle',
                          [
                              {
                                  title:'Names',
                                  data:[['First','Last'],
                                        ['Tom','Hinkle'],
                                        ['Kat','Hinkle']
                                       ]
                              },
                              {
                                  title:'Birthdays',
                                  data:[
                                      ['name','bday'],
                                      ['Tom',new Date(1979,1,21)],
                                      ['Kat',new Date(1980,4,11)],
                                      ['Grace',new Date(2007,10,13)],
                                      ['Clara',new Date(2009,8,22)],
                                      ['Lila',new Date(2011,6,26)]
                                  ]
                              }
                          ]
                      ).then(
                          (result)=>{
                              console.log('Got result! %s',JSON.stringify(result))
                              setTestUrl(result.spreadsheetUrl)
                          }
                      )
                  }
                          }
                >Test Create Sheet (raw)
                </Button>
                <Button
                  onClick={()=>{
                      DocumentManager()
                          .createSheetForProp(
                              {title:'testcourse',id:'test-id'},
                              'fakeProp',
                              'A New Sheet',
                              [{name:'Name sheet',rowData:Sheets.jsonToRowData([{name:'Tom',age:40},{name:'Kat',age:39},{name:'Grace',age:11}])},
                               {name:'Dates?',rowData:Sheets.jsonToRowData([{date:new Date(),name:'Today!'},{date:'some time',name:'FoO!'}])},
                               {name:'Straight Data?',data:[[1,2,3],[4,5,6],[7,8,9]]},
                              ]
                          ).then((data)=>{
                              setTestData(data);
                              setTestUrl(data.spreadsheetUrl);
                          })
                  }}
                >
                  Test Create Sheet for Course
                </Button>

                <Button
                  onClick={
                      ()=>{SheetManager('1EDFnmkEUgH-3wjMHFQk1EOtV5sUMco_esBKfvw2nVlk').getJson('Birthdays').then(
                          (result)=>{
                              console.log('Got data: %s',JSON.stringify(result));
                              setTestData(result)
                          }
                      )
                          }
                  }>Test Read Sheet
                </Button>
                <Button
                  onClick={()=>{
                      SheetManager('1mlEdDoe_dnu8RxKbknCIG-1fXDXawnEWoZEhl-FcDuY')
                          .updateData(
                              [
                                  {title:'worry',
                                   data:[[1,2,3,],[2,4,6],[3,6,9],[4,8,12],[new Date(),'no more worries','sleep well']]},
                                  {title:'nooboodoogoo',
                                   data:[[7,6,5],[4,3,2],[2,1,0],['a','b','c']]}
                              ]
                          )
                          .then((r)=>setTestData(r));
                      
                  }}>Test Update Sheet</Button>

                <Button
                  onClick={()=>{
                      async function doIt () {
                          var response = await window.gapi.client.drive.files.list(
                              {spaces:'drive',
                               q:'appProperties has {key="courseId" and value="20912946613"}',
                              }
                          );
                          setTestData(response.result.files);
                      }
                      doIt();
                  }}
                >Test Property Query
                </Button>

              </Box>
              <Box>
                <h.h3>Other APIs</h.h3>
                <Button onClick={()=>setPage('gapi')}>Test GApi</Button>
                <Button onClick={()=>{
                    async function test () {
                        console.log('fetch coursework...',defaultCourse.id);
                        var cwList = await Api.Classroom.get_coursework({course:defaultCourse});
                        console.log('Fetch student work...');
                        var work = await Api.Classroom.get_student_work({course:defaultCourse,courseWork:cwList[0],teacherMode:!studentMode})
                        console.log('Got it!');
                        setTestData(work);
                    }
                    test();
                } }>Get Student Work</Button>
                <Button onClick={()=>{
                    async function test () {
                        var students = await Api.Classroom.get_students({course:defaultCourse});
                        setTestData(students);
                    };
                    test();
                }}>Get Students</Button>

              </Box>


            <Button onClick={()=>Api.testPost()}>Test Post</Button>
            <Button onClick={()=>Api.testLongGet()}>Test Long Get</Button>
            <Button onClick={()=>{setTestUrl('http://www.google.com');setTestData({test:'me',hello:'world'})}}>Test TestData & URL</Button>
        </div>
        </Box>
    }

    function data() { 
        return <div><h.h3>Test Data and Stuff...</h.h3>
            {testData && <pre>TEST DATA:
                           {JSON.stringify(testData)}</pre>}

          <div>
            {testUrl && <a target="_blank" href={testUrl} target='blank'>Test URL was created!</a>}
            {testUrls &&
             testUrls.map(
                 (urlData)=><span>|<a target="_blank"  href={urlData.url}>{urlData.name}</a>|</span>
             )}
          </div>
            {prop && <p>{JSON.stringify(prop)} {prop.name}</p>}
            SETTING: {testId}
          </div>
    }

    function widgets () {
        return (
          <Tabs>
            <span>Modals</span>
            <ModalTest/>
            <span>Widgets!</span>
            <div>
              <MenuTests/>
              <div>
                <h.h3>Progress Overlays!</h.h3>
                <ProgressOverlay active={false} message={false}>
                  <Button>I am wrapped in an overlay that is inactive</Button>
                  <p>Progress in progress</p>
                </ProgressOverlay>
                <ProgressOverlay active={true} message={false}>
                  <Button>I am wrapped in an overlay that is inactive</Button>
                  <p>Progress in progress</p>
                </ProgressOverlay>
              </div>

              <div style={{height:100}}/>
              <hr/>
              <div>
                <h.h2>Dropdown menu!</h.h2>
                <Menu dropdown={true} items={[1,2,3,4,5,6]} itemRenderer={Menu.Item} initialValue={testState} onSelected={setTestState}/>
              </div>
              <div>
                <SelectableItem title="Test me"
                                items={[1,2,3,4,5,6,7]}
                                itemRenderer={Menu.Item}
                                onSelected={console.log}
                >
                  
                </SelectableItem>
                <Box>
                  <h.h3>Tabs!</h.h3>
                  <Tabs onChange={(o)=>console.log('Test Tab selected: got description',o)}>
                    <span>Hello</span>
                    <div onSelected={()=>console.log('hello selected!')}>Hello World</div>
                    <span>Goodbye</span>
                    <div onSelected={()=>console.log('goodbye selected!')}>See you around!</div>
                  </Tabs>
                </Box>
                <Box>
                  <h.h3>Tabs Grouped Mode!</h.h3>
                  <Tabs groupedMode={true}>
                    <div>
                      <span>Head1</span><span>Head2</span><span>Head3</span>
                    </div>
                    <div>
                      <p>Howdy 1</p>
                      <p>Howdy 2</p>
                      <p>Howdy 3</p>
                    </div>
                  </Tabs>
                </Box>
              </div>
            </div>
            <span>Rubric Export</span>
            <RubricExporter
              course={defaultCourse}
              student={defaultStudent}
              permalink = 'http://slashdot.org'
              selectedCoursework={{
                  courseId: "20912946613",
                  id: "23960463998",
                  title: "Choose Your Own Adventure",
                  alternateLink: "https://classroom.google.com/c/MjA5MTI5NDY2MTNa/a/MjM5NjA0NjM5OTha/details",
                  assigneeMode: "ALL_STUDENTS",
                  courseId: "20912946613",
                  creationTime: "2019-09-05T10:04:01.978Z",
                  creatorUserId: "113561106451202000689",
                  dueDate: {year: 2019, month: 9, day: 9},
                  dueTime: {hours: 19},
                  id: "23960463998",
                  maxPoints: 100,
                  state: "PUBLISHED",
                  submissionModificationMode: "MODIFIABLE_UNTIL_TURNED_IN",
                  title: "Choose Your Own Adventure",
                  topicId: "23960464172",
                  updateTime: "2019-09-05T12:00:52.662Z",
                  workType: "ASSIGNMENT"}}
              skills = {skills}
              selectedSkills = {[{"skill":"Correct tag syntax","id":8,"reflection":"<p>Yes I totally used correct tag syntax everywhere because I am amazing !</p>","assessment":{"comment":"<p>Way to go fake person!</p>","count":1,"id":8,"score":"B+"},"permalink":"http://www.slashdot.org","revisionCount":1},{"skill":"Tables & Lists","id":9,"permalink":"http://www.slashdot.org","revisionCount":1},{"skill":"Typography and Fonts","id":6,"reflection":"<p>wow look at my lovely fonts</p><pre class=\"ql-syntax\" spellcheck=\"false\">&lt;font font=\"amazing\"&gt;Cool beans&lt;/font&gt;\n</pre>","permalink":"http://www.slashdot.org","revisionCount":1},{"skill":"Valid Page","id":7,"permalink":"http://www.slashdot.org","revisionCount":1},{"skill":"Working Links","id":10,"permalink":"http://www.slashdot.org","revisionCount":1},{"skill":"Page structure","id":11,"assessment":{"id":11},"permalink":"http://www.slashdot.org","revisionCount":1}]}
            >
            </RubricExporter>

            <span>Teacher Assessment View</span>
            <TeacherAssignmentView course={defaultCourse}/>



            <span>Portfolio Export</span>
            <div>
              <PortfolioExporter.Standalone
                course={defaultCourse}
                student={defaultStudent}
                teacherMode={!studentMode}
              />
            </div>

            <span>Portfolio</span>
            <div>
              <Button onClick={()=>setStudentMode(false)}>Teacher Mode</Button>
              <Button onClick={()=>setStudentMode(true)}>Student Mode</Button>
              {studentMode && <h.h2>Student View</h.h2> || <h.h2>Teacher View</h.h2>}
              <Portfolio course={defaultCourse} student={defaultStudent}
                         teacherMode={!studentMode}
              />
              
            </div>

            <span>Assignment Mapper</span>
            <AssignmentMapper course={defaultCourse}/>

            <span>Course List</span>
            <ClassList onCourseSelected={(c)=>console.log('Selected course %s',JSON.stringify(c))} user='thinkle@innovationcharter.org'></ClassList>

            {/* <span>Skills List</span> */}
            {/* <SkillsList></SkillsList> */}
            
            <span>Builder</span>
            <PortfolioBuilder course={defaultCourse}/>
            <span>Rich Text</span>
            <div>
              <h3>Rich Text Editor Test!</h3>
              <Editor onChange={(html)=>console.log('HTML UPDATED: %s',html)} editorHtml={`<ul>
<li>Type your</li>
<li>List of</li>
<li>indicators here.</li>
</ul>`}/>
            </div>

            <span>Embedded</span>
            <SheetWidget url="https://docs.google.com/spreadsheets/d/1RP7wlpGOrrfUbdvBXKYvRygomATov6DTp1OocBEinqI/edit#gid=0"/>
            <span>Exemplar Editor</span>
            <div>
              <h2>Student Version</h2>
              <ExemplarEditor
                student={defaultStudent}
                course={defaultCourse}
                onChange={console.log}
                mode='student'
              />
             <h2>Teacher Version</h2>
              <ExemplarEditor
                student={defaultStudent}
                course={defaultCourse}
                onChange={console.log} mode='teacher'
              />
            </div>

          </Tabs>
        );
    }
}

function ModalTest () {
    const [modal1,setModal1] = useState(false)
    const [modal2,setModal2] = useState(false)
    const [modal3,setModal3] = useState(false)

    
    return (
        <div>
          <Navbar>
            <Navbar.Item>
              <Button onClick={()=>setModal1(true)}>Show Modal Card</Button>
            </Navbar.Item>
            <Navbar.Item>
              <Button onClick={()=>setModal2(true)}>Show Modal</Button>
            </Navbar.Item>
            <Navbar.Item>
              <Button onClick={()=>setModal2('hello')}>Show Modal truthy</Button>
            </Navbar.Item>
            <Navbar.Item>
              <Button onClick={()=>setModal3('hello')}>Show nested modal?</Button>
            </Navbar.Item>


          </Navbar>
          <Modal.ModalCard active={modal1} onClose={()=>setModal1(false)}>
            <div>
              This is the body of a modal!
            </div>
            <div>
              This is a footer
            </div>
          </Modal.ModalCard>
          <Modal active={modal2} onClose={()=>setModal2(false)}>
            <div>
              This is the body of a big modal!
                            This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!              This is the body of a big modal!
            </div>
            <div>
              This is a footer
            </div>
          </Modal>
          <Viewport.Two>
            <p>Top tab stuff ?</p>
            <Viewport.Wrap>
              <p>This is wrapped content incuding our modal?</p>
              <Modal.ModalCard active={modal3} onClose={()=>setModal3(false)} title="Howdy">
                <p>Body of card</p>
                <p>Footer</p>
              </Modal.ModalCard>
            </Viewport.Wrap>
          </Viewport.Two>
        </div>
    )

}


function MenuTests (props) {
    const [items,setItems] = useState([{name:'Joe',id:123},{name:'Mary',id:1248},{name:'Bob',id:129048},{name:'Fred',id:12098999}])
    const [selected,setSelected] = useState([items[0],items[2]]);
    const selectedAP = arrayProp(selected,setSelected);

    return <div>
             <h.h2>Test!</h.h2>
             <MultiSelector
               items={items}
               selected={selected}
               renderItem={(i)=>i.name}
               onUnselect={selectedAP.remove}
               onSelect={selectedAP.push}
             />
        </div>
    
}

export default TestView;
