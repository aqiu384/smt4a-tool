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

const HAS_DLC_KEY = 'smt4a-tool/hasDlc'

class Smt4ATool extends React.PureComponent {
  constructor(props) {
    super(props)

    let hasDlc = JSON.parse(localStorage.getItem(HAS_DLC_KEY))
    if (!hasDlc) {
      hasDlc = DlcDemons.reduce( (acc, dlc) => { acc[dlc] = false; return acc }, {} )
      localStorage.clear()
      localStorage.setItem(HAS_DLC_KEY, JSON.stringify(hasDlc))
    }
    window.addEventListener('storage', this.onStorageUpdated)

    this.state = {
      hasDlc
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.hasDlc !== this.state.hasDlc ||
      nextProps.match !== this.match
  }

  onStorageUpdated = (e) => {
    switch (e.key) {
      case HAS_DLC_KEY:
        this.setState( () => ({ hasDlc: JSON.parse(e.newValue) }) )
        break
      default:
        break
    }
  }

  onDlcSubmit = (hasDlc) => {
    localStorage.setItem(HAS_DLC_KEY, JSON.stringify(hasDlc))
    this.setState( () => ({ hasDlc: hasDlc }) )
  }

  render() {
    const { match, location } = this.props
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
        <Route path="/demons.html" render={ () => {
          const nameParam = 'demon'
          const nameBegin = location.search.indexOf(nameParam + '=')

          let name = ''
          if (nameBegin !== -1) {
            const nameSuffix = location.search.substring(nameBegin + nameParam.length) + '&'
            console.log(nameSuffix)
            name = '/' + nameSuffix.substring(1, nameSuffix.indexOf('&'))
          }

          return <Redirect to={`${baseUrl}/demons${name}`}/>
        } }/> 
        <Route path={`${baseUrl}/demons/:name`} render={ ({ match }) => (
          <div className="compendium">
            <DemonEntry {...{
              tabLinks, match, hasDlc,
              demonsUrl: demonsUrl
            }}/> 
            <Footer/>
          </div>
        ) }/>
        <Route path={`${baseUrl}/:tab`} render={ ({ match }) => (
          <div className="compendium">
            <div className={match.isExact ? 'show' : 'hide'}>
              <SimpleTabs currTab={match.params.tab} tabs={tabs} baseUrl={baseUrl}/>
            </div>
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
