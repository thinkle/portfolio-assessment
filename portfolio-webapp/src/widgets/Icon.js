import React from 'react';
import {faSave,faExternalLinkAlt,faCheck,faUndo,
        faTrash,
        faAngleDown,faAngleUp,faAngleRight,faAngleLeft,
        faClipboardCheck,faChalkboardTeacher,faHiking,faFolderOpen,
        faPenSquare,
        faPlus,
        faExclamation,
        faWindowClose} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {classNames} from '../utils.js';

function Icon (props) {
    return (
        <span className={props.className||'' + classNames({
            ...props.classNames,
            icon:true,
            button:props.onClick,
            /*'is-white':props.onClick,*/
        })}
              onClick={props.onClick}
        >
          <FontAwesomeIcon icon={props.icon}/>
        </span>
    );
}

Icon.check =faCheck;
Icon.trash = faTrash;
Icon.save = faSave;
Icon.edit = faPenSquare;
Icon.close = faWindowClose;
Icon.down = faAngleDown;
Icon.up = faAngleUp;
Icon.right = faAngleRight;
Icon.left = faAngleLeft;
Icon.external = faExternalLinkAlt

Icon.teacher = faChalkboardTeacher;
Icon.clipboard = faClipboardCheck;
Icon.folderOpen = faFolderOpen;
Icon.undo = faUndo;
Icon.work = faHiking;
Icon.plus = faPlus;
Icon.bang = faExclamation;

export default Icon;
