import React from 'react';
import {Navbar,Icon,Button} from './widgets.js'

function SavePortfolioButtons (props) {
    const {
        busy, urls, saved,
        savePortfolio,
        saveOverPortfolio
    } = props;

    return (
        <>
          <Navbar.Item>{busy && <div classname="has-warning-text" style={{'background-color':'white'}}><Icon icon={Icon.spinner}/><em>Communicating with the google...</em></div>}</Navbar.Item>
              <Navbar.Item>{
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
                        &nbsp;Synced to Google
                      </div>
              }
              </Navbar.Item>

        </>
    );
}

export default SavePortfolioButtons;
