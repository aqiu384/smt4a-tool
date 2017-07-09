import React from 'react'
import { Link, Redirect } from 'react-router-dom'

function SimpleTabNavbar({ tabs, baseUrl }) {
  return (
    <div className="tab-group">
      {tabs.map( ({ name, label }) =>
        <div key={name} className="tab-option">
          <Link className="button" to={`${baseUrl}/${name}`}>{label}</Link>
        </div>
      )}
    </div>
  )
}

function SimpleTabs({ currTab, tabs, baseUrl }) {
  const tabLinks = <SimpleTabNavbar {...{ tabs, baseUrl }}/>
  const tabOrder = tabs.map( ({ name }) => name )

  if (tabOrder.indexOf(currTab) === -1) {
    return <Redirect to={`${baseUrl}/${tabOrder[0]}`}/>
  }

  return (
    <div>
      {tabs.map( ({ name, content }) =>
        <div key={name}>
          {name === currTab && React.cloneElement(content, { tabLinks })}
        </div>
      )}
    </div>
  )
}

export default SimpleTabs 
export { SimpleTabNavbar }
