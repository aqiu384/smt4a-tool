import React from 'react'

import SimpleTabs, { SimpleTabNavbar } from './common/SimpleTabs'
import DemonEntry from './demon-entry/DemonEntry'
import DemonTable from './DemonTable'
import SkillTable from './SkillTable'
import DlcTable from './DlcTable'
import Footer from './Footer'

import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import DlcDemons from './data/DlcDemons'
import './Smt4ATool.css'

class Smt4ATool extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      hasDlc: DlcDemons.reduce( (acc, dlc) => { acc[dlc] = false; return acc }, {} )
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.hasDlc !== this.state.hasDlc ||
      nextProps.match !== this.match
  }

  onDlcSubmit = (hasDlc) => {
    this.setState( () => ({ hasDlc: hasDlc }) )
  }

  render() {
    const { match } = this.props
    const { hasDlc } = this.state

    const baseUrl = match.url === '/' ? '' : match.url
    const demonsUrl = baseUrl + '/demons'

    const tabs = [
      {
        name: 'demons',
        label: 'List of Demons',
        content: <DemonTable {...{ demonsUrl, match, hasDlc }}/>
      },
      {
        name: 'skills',
        label: 'List of Skills',
        content: <SkillTable {...{ demonsUrl: demonsUrl, match, hasDlc }}/>
      },
      {
        name: 'dlc',
        label: 'Add DLC Demons',
        content: <DlcTable {...{ initHasDlc: hasDlc, onSubmit: this.onDlcSubmit }}/>
      }
    ]

    const tabLinks = SimpleTabNavbar({ tabs, baseUrl })

    return (
      <Switch>
        <Route exact path={match.url} render={ () => <Redirect to={demonsUrl}/> }/>
        <Route path="/index.html" render={ () => <Redirect to={`${baseUrl}/demons`}/> }/> 
        <Route path="/skills.html" render={ () => <Redirect to={`${baseUrl}/skills`}/> }/> 
        <Route path="/demons.html" render={ () => <Redirect to={`${baseUrl}/demons`}/> }/> 
        <Route path={`${baseUrl}/:tab`} render={ ({ match }) => (
          <div className="compendium">
            <div className={match.isExact ? 'show' : 'hide'}>
              <SimpleTabs currTab={match.params.tab} tabs={tabs} baseUrl={baseUrl}/>
            </div>
            { match.params.tab === 'demons' &&
              <Route path={`${match.url}/:name`} render={ ({ match }) => 
                <DemonEntry {...{
                  tabLinks, match, hasDlc,
                  demonsUrl: demonsUrl
                }}/> 
              }/>
            }
            <Footer/>
          </div>
        ) }/>
      </Switch>
    )
  }
}

function App() {
  return (
    <Router basename={process.env.REACT_APP_BASE_PATHNAME}>
      <Route path="/" component={Smt4ATool}/>
    </Router>
  )
}

export default App
