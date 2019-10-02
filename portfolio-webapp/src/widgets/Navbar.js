import React from 'react';
import makeComponent from './QuickComponents.js';
import './Navbar.sass';

const Navbar = makeComponent(['navbar'],'div');
const Brand = makeComponent(['navbar-brand'],'div');
const Item = makeComponent(['navbar-item'],'div');
const Divider = makeComponent(['navbar-divider'],'hr');
const Dropdown = makeComponent(['navbar-dropdown'],'div');
const Start = makeComponent(['navbar-start'],'div');
const End = makeComponent(['navbar-end'],'div');

function QuickBrand (props) {
    return <Brand {...props}>
             <Item>{props.children}</Item>
           </Brand>
}


Navbar.Item = Item;
Navbar.Brand = Brand;
Navbar.QuickBrand = QuickBrand;
Navbar.Dropdown = Dropdown;
Navbar.Divider = Divider;
Navbar.Start = Start;
Navbar.End = End;
export default Navbar
