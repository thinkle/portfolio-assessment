import React from 'react';
import {inspect} from 'util';
import {Navbar,Icon,Button,ProgressOverlay} from './widgets.js'

function SavePortfolioButtons (props) {
    const {
        busy, urls, saved, error,
        savePortfolio,
        saveOverPortfolio
    } = props;

    return (
        <>
          {error &&
           <>
             <Navbar.Item>
               <Navbar.Item className="has-danger-text">Error
                 <span>{inspect(error)}</span>
               </Navbar.Item>             
             </Navbar.Item>
             <Navbar.Item>
               <Button className="is-danger"
                       icon={Icon.save}
                       onClick={()=>saveOverPortfolio()}>
                 Force Save (save over any other changes)
               </Button>
             </Navbar.Item>
           </>
        }
          <Navbar.Item>
            <ProgressOverlay active={busy}>
              <div>
              {
                  !saved &&
                      <span>
                        <Button className="is-primary" icon={Icon.save} onClick={()=>savePortfolio()}>Save Changes to Google</Button>
                        <span className="has-text-danger is-bold">Work not saved yet!</span>
                      </span>
                      ||
                      <div className="is-success">
                        <a target='_blank' href={urls && urls.exemplars}>Exemplars</a>
                        &amp;
                        <a target='_blank' href={urls && urls.assessments}>Assessments</a>
                      &nbsp;Synced <Icon icon={Icon.check}/>
                      </div>
              }
              </div>
              {busy && <div classname="has-warning-text" style={{backgroundColor:'white'}}><Icon icon={Icon.spinner}/><em>Communicating with the google...</em></div>}
            </ProgressOverlay>
          </Navbar.Item>
        </>
    );
}

export default SavePortfolioButtons;
