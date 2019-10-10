import React, {useEffect,useState} from 'react';
import {classNames} from './utils.js';
import Icon from './widgets/Icon.js';
import Modal from './widgets/Modal.js';
import makeComponent from './widgets/QuickComponents.js';
import Card from './widgets/Card.js';
import Button from './widgets/Button.js';
import Menu,{SelectableItem,CustomSelectableItem} from './widgets/Menu.js';
import Navbar from './widgets/Navbar.js';
import Tabs from './widgets/Tabs.js';
const InputWithEnter = React.forwardRef( (props, ref) => {
    return (
        <input onKeyDown={
            function (e) {
                if (e.keyCode == 13) {
                    props.onEnter && props.onEnter();
                }
            }
        } defaultValue={props.defaultValue}  key={props.key} ref={ref}>
        </input>
    );
})



const Box = makeComponent(['box']);
const Buttons = makeComponent(['buttons']);
const Content = makeComponent(['content']);
const Container = makeComponent(['container']);
const Progress = makeComponent(['progress'],'progress')

function Loader (props) {
    return <Card {...props}>
             <div>{props.children}</div>
             <div>
               <p>Just a moment and we'll have your data ready I promise!</p>
               <Progress/>
             </div>
           </Card>
}


const Viewport = makeComponent(['viewport2'])
Viewport.Three = makeComponent(['viewport3'])
Viewport.Two = Viewport;
Viewport.Bottom = makeComponent(['viewport2','bottom']);


const h = {};
for (let i=1; i<=6; i++) {
    h['h'+i] = makeComponent(['title','is-'+i])
    h['sh'+i] = makeComponent(['subtitle','is-'+i])
}

export {Viewport,InputWithEnter,Modal,Card,Button,Buttons,Content,Icon,Container,Menu,SelectableItem,CustomSelectableItem,Navbar,h,Box,Tabs,Progress,Loader}
