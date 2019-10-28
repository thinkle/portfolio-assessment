import React,{useState,useEffect} from 'react';
import Card from './Card.js';
import makeComponent from './QuickComponents.js';
import {classNames} from '../utils.js';
import './Progress.sass'
function Loader (props) {
    return <Card {...props}>
             <div>{props.children}</div>
             <div>
               <p>Just a moment and we'll have your data ready I promise!</p>
               <Progress/>
             </div>
           </Card>
}
const Progress = makeComponent(['progress'],'progress')

function ProgressOverlay (props) {
    const children = React.Children.toArray(props.children)

    return (
    <div className="progress-overlay-container">
      <div className="progress-content">{children[0]}</div>
        <div className={classNames({
            overlay:true,
            notification:true,
            active:props.active,
        })}
        >{children[1]}</div>
    </div>
    )
}

export {ProgressOverlay,Progress,Loader}
