import React from 'react';
import {classNames} from '../utils.js';
import makeComponent from './QuickComponents.js';

function Card (props) {
    var head,body,footer;
    var arrayChildren = React.Children.toArray(props.children)
    if (arrayChildren.length==3) {
        [head,body,footer] = arrayChildren;
    }
    else if (arrayChildren.length==2) {
        [head,body] = arrayChildren;
    }
    else if (arrayChildren.length==1) {
        [body] = arrayChildren;
    }
    else {
        console.log('ERROR Card called with %s children?',arrayChildren.length)
        console.log('Use 1 child for Body, 2 for Head+Body or 3 for Head+Body+Footer');
        return <div>BAD PROGRAMMER: CARD MUST HAVE 1, 2 or 3 CHILDREN!</div>
        //throw 'Card must have 1, 2 or 3 children';
    }

    return (
        <div className='card'>
          {head && <div className='card-header'>{head}</div>}
          <div className='card-content'>{body}</div>
          {footer && footer}
        </div>
    );
    
}

Card.Footer = makeComponent(['card-footer']);
Card.FooterItem = makeComponent(['card-footer-item'],'a');
Card.Title = makeComponent(['card-header-title']);
Card.HeaderIcon = makeComponent(['card-header-icon'],'span');

export default Card;
