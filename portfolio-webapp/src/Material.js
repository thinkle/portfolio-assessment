import React,{useState,useEffect} from 'react';
import {Card,Button,Buttons,Icon,Menu} from './widgets.js';
import {classNames} from './utils.js';
import './Material.sass';

function Material (props) {

    var material = props.material;

    if (props.thumbnailMode) {
        return <span className='material' onClick={props.onThumbClick}>
                 {getMaterial()}
               </span>
    }
    else {
        return (<div className='material' onClick={(itm)=>props.onClick && props.onClick(itm)}>
                  {getMaterial()}
                </div>)
    }

    function getMaterial () {
        if (material.link) {
            var itm = material.link
            return (
                <div className='material'>
                  <img className='thumb' src={itm.thumbnailUrl}/>
                  <a href={itm.url} target="_blank">
                    {itm.title}
                    <Icon icon={Icon.external}/>
                  </a>
                </div>
            )
        }
        else if (material.driveFile) {
            var itm = material.driveFile.driveFile
            if (!itm) {return 'Drive File coming soon?'}
            return (
                <div>
                  <img src={itm.thumbnailUrl}/>
                  <a href={itm.alternativeLink} target="_blank">{itm.title}</a>
                  {itm.shareMode} {itm.shareMode=='VIEW' && 'Students get copy?'} 
                </div>
            );
        }
        else {
            return (<div>Unknown material: {JSON.stringify(material)}</div>)
        }
    }
}

function getLink (material) {
    if (material.link) {
        return material.link.url
    }
    if (material.driveFile) {
        return material.alternativeLink
    }
    else {
        var obj = Object.values(material)[0]
        if (obj.alternativeLink) {return obj.alternativeLink}
        if (obj.url) {return obj.url}
        else {
            console.log('COULD NOT FIND LINK FOR MATERIAL',material);
            return ''
        }
    }
}

Material.getLink = getLink;

export default Material;
