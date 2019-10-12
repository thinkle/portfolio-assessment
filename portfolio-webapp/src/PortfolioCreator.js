import React,{useState,useEffect} from 'react'
import {Container,Menu,Navbar,Tabs,Button,Modal,Icon,Card,Viewport,h} from './widgets.js';
import {inspect} from 'util';

function PortfolioCreator (props) {
    const [message,setMessage] = useState('');
    const [busy,setBusy] = useState(false);
    const [havePortfolios,setHavePortfolios] = useState([]);
    const [needPortfolios,setNeedPortfolios] = useState([]);
    
    function getPortfolios () {
        var havePortfolios = [];
        var needPortfolios = [];
        props.portfolioManager.getMany(
            props.students,props.course,
            (portfolio,student) => {
                if (portfolio.length > 0) {
                    havePortfolios.push(student)
                    setHavePortfolios(havePortfolios);
                    setMessage(student.profile.name.fullName+' has a portfolio already');
                }
                else {
                    needPortfolios.push(student)
                    setNeedPortfolios(needPortfolios);
                    setMessage(student.profile.name.fullName+' needs a portfolio');
                }
            }
        );
    }

    function createPortfolios () {

        async function doCreate (student) {
            setMessage("Create... "+student.profile.name.fullName);
            try {
                var result = await props.portfolioManager.touchPortfolio(
                    student,
                    (result)=>{
                        setMessage(student.profile.name.fullName+' created portfolio: '+JSON.stringify(result));
                    },
                    (err)=>{
                        setMessage(student.profile.name.fullName+' got error: '+JSON.stringify(err));
                    }
                );
            }
            catch (err) {
                setMessage(student.profile.name.fullName+' got error :( '+inspect(err))
                return
            }
        }
        
        setMessage('oops');
        needPortfolios.forEach(
            (student,i)=>{
                window.setTimeout(()=>doCreate(student),1000*i)

            });
    }
    
    return (
        <Card>
          <h.h2>Create Portfolios</h.h2>
          <div>
            {message && <p>{message}</p>}
          <div>
            <table className="table">
              <tr>
                <th>Have Portfolio</th>
                <th>Need Portfolio</th>
              </tr>
              <tr>
                <td>
                  {havePortfolios.map((s)=>s.profile.name.fullName).join(', ')}
                </td>
                <td>
                  {needPortfolios.map((s)=>s.profile.name.fullName).join(', ')}
                </td>
              </tr>
            </table>
          </div>
          </div>
          <div>

          <Button onClick={getPortfolios}>See who needs portfolios...</Button>
          {!busy && <Button onClick={createPortfolios}>Create</Button>}
          </div>
        </Card>
    )
    
}

export default PortfolioCreator;
