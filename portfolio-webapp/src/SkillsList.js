import React, {useState, useEffect} from 'react';
import Api from './api.js';

function SkillsList () {
    
    const [assignmentList,setAssignmentList] = useState([]);
    const [loadingAssignments,setLoadingAssignments] = useState();
    
    useEffect( () => {
        console.log('Skills list effect! running once...');
        setLoadingAssignments(true)
        Api.getSheet('1RP7wlpGOrrfUbdvBXKYvRygomATov6DTp1OocBEinqI')
            .then(
                (data)=>{
                    console.log('Got me some data: %s',data);
                    setAssignmentList(data)
                    setLoadingAssignments(false);
                }
            )
        .catch((err)=>{
            setLoadingAssignments(false);
        })
    },
        [] // array of properties to monitor to run effect again.
    );

    return (
        <div className="section">
        {loadingAssignments &&
            (<div>
                <div className="is-small">Loading assignments...</div>
                <progress className="progress is-medium is-primary" max="100"></progress>
                </div>
                )
        }
        <table className="table">
        {assignmentList.map(
            (row)=>(
                <tr>
                   {row.map((cell)=>(<td>{cell}</td>))}
                </tr>
            ))
            }
            
        </table>
        </div>
    );

}

export default SkillsList;