import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { act } from "react-dom/test-utils";
import {inspect} from 'util';

xit('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
});


const awaitGapi = ()=> new Promise((resolve,reject)=>{

    const maxAttempts = 10;
    const attempts = []
    console.log('Start waiting for gapi...');
    function checkForGapi () {
        attempts.push(new Date())
        if (window.gapi) {
            console.log('Got it!');
            resolve(window.gapi);
        }
        else {
            console.log('Try again... attempts #',attempts.length);
            for (var script of document.getElementsByTagName('script')) {
                console.log('Script in document: ',script.outerHTML);
            }
            if (attempts.length > maxAttempts) {
                reject({
                    message:'Waited too long...',
                    attempts}
                      )
            }
            else {
                console.log('timeout...')
                setTimeout(checkForGapi,1000)
            }
        }
    }

    checkForGapi()
});

xit('loads gapi', ()=>{

    const div = document.createElement('div');
    ReactDOM.render(<App />, div);

    return awaitGapi().then(
        ()=>{
            console.log('GOT GAPI!',window.gapi);
            const div = document.createElement('div');
            ReactDOM.render(<App />, div);
            expect(window).toBeDefined()
            expect(window.gapi).toBeDefined();
            ReactDOM.unmountComponentAtNode(div);
        }
    );
});
