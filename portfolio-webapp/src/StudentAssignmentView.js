import React,{useState,useEffect,useRef} from 'react';
import {useStudentWork,useCoursework} from './gapi/hooks.js';
import {usePortfolioSkillHook} from './AssignmentMapper.js';
import {getProp,classNames,getById} from './utils.js';
import {Viewport,Card,Container,Navbar,Button,Icon,Modal,Loader,h} from './widgets.js';
import {SelectableItem,Menu,Dropdown} from './widgets/Menu.js';
import ExemplarEditor,{useEEProps} from './ExemplarEditor.js';
import SavePortfolioButtons from './SavePortfolioButtons.js';
import history from './history.js';
import {inspect} from 'util';


function StudentAssignmentView (props) {

    const coursework = props.coursework
    const [selectedCoursework,setSelectedCoursework] = useState();

    const {exemplarEditorProps,
           exemplarRenderCount} = useEEProps({
               selectedStudent:props.student,
               selectedCoursework,
               currentPortfolio:props.portfolio,
               allStudentWork:props.studentwork,
               ...props
           });

    function saveExemplars (exemplars) {
        console.log('update and save...');
        props.updateAndSaveExemplars(exemplars)
    }

    return (
        <Viewport.Two>
          <Navbar className="navbar1">
            <Navbar.Item>
              <SelectableItem
                initialValue={selectedCoursework}            
                items={coursework}
                title="Choose Assignment"
                renderItem={(itm)=><span>{itm.title}</span>}
                onSelected={setSelectedCoursework}
                key={`${getProp(selectedCoursework,'id')}-${getProp(coursework,'length')}`}
              />
            </Navbar.Item>
            <Navbar.End>
              <SavePortfolioButtons {...props}/>
            </Navbar.End>
          </Navbar>
          <div>
            {!selectedCoursework &&
             <div>
               Select an assignment please
             </div>
             ||
             <ExemplarEditor
              {...props}
              {...exemplarEditorProps}
              coursework={coursework}
              mode='student'
              key={exemplarRenderCount}
              onChange={saveExemplars}
             />
            }
          </div>
        </Viewport.Two>
        
    );
}

export default StudentAssignmentView;
