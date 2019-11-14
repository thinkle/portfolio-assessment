import React, {useEffect,useState} from 'react';
import {classNames} from './utils.js';
import Icon from './widgets/Icon.js';
import Modal from './widgets/Modal.js';
import Panel from './widgets/Panel.js';
import makeComponent from './widgets/QuickComponents.js';
import Card from './widgets/Card.js';
import Button from './widgets/Button.js';
import Menu,{MultiSelector,SelectableItem,CustomSelectableItem,Dropdown} from './widgets/Menu.js';
import {Progress,Loader,ProgressOverlay} from './widgets/Progress.js';
import Navbar from './widgets/Navbar.js';
import Tabs from './widgets/Tabs.js';
import Viewport from './widgets/Viewport.js';
import './widgets/animations.sass';
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
const Control = makeComponent(['control'])
const Field = makeComponent(['field'])


const h = {};
for (let i=1; i<=6; i++) {
    h['h'+i] = makeComponent(['title','is-'+i])
    h['sh'+i] = makeComponent(['subtitle','is-'+i])
}



export {Viewport,
        InputWithEnter,
        Modal,
        Card,Box,Content,Container,
        Button,
        Buttons,Icon,
        Control,Field,
        Menu,MultiSelector,SelectableItem,CustomSelectableItem,Dropdown,
        Navbar,Tabs,
        Panel,
        h,
        Progress,Loader,ProgressOverlay}
