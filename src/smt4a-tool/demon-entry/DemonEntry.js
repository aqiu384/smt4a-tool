import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import SortedTable, { SimpleTable as Table } from '../common/SortedTable'
import SimpleTabs from '../common/SimpleTabs'

import {
  combineColumns, BaseStats, Resistances, Affinities,
  Skills, SkillLevel, AilmentResistances
} from '../DataFields'

import ForwardFusionsTable from './ForwardFusionsTable'
import ReverseFusionsTable from './ReverseFusionsTable'

import DemonData from '../data/DemonData'
import SkillData from '../data/SkillData'

function Demon({ match, hasDlc, demonsUrl, tabLinks }) {
  const name = match.params.name

  if (!DemonData.hasOwnProperty(name)) {
    return <h2>Could not find {name} in compendium</h2>
  }

  const data = DemonData[name]
  const baseUrl = match.url
  const title = 'Lvl ' + data.lvl + ' ' + data.race + ' ' + name

  const tabs = [
    {
      name: 'reverse-fusions',
      label: 'List of Reverse Fusions',
      content: <ReverseFusionsTable {...{
        demon: name,
        moreTabLinks: tabLinks,
        hasDlc, demonsUrl
      }} />
    },
    {
      name: 'forward-fusions',
      label: 'List of Forward Fusions',
      content: <ForwardFusionsTable {...{
        demon: name,
        moreTabLinks: tabLinks,
        hasDlc, demonsUrl
      }} />
    }
  ]

  const skills = Object.keys(data.skills).map( (skill) => { 
    const entry = parseSkill(skill)
    entry.lvl = data.skills[skill]
    return entry
  } )

  return (
    <div>
      <BaseStatsTable title={title} stats={data.stats}/>
      <ResistancesTable resists={data.resists}/>
      <AilmentsTable ailments={data.ailments ? data.ailments : {}}/>
      <AffinitiesTable affinities={data.affinities}/>
      <SkillsTable skills={skills}/>
      <Switch>
        <Route exact path={match.url} render={ 
          () => <Redirect to={`${match.url}/reverse-fusions`}/>
        }/>
        <Route path={`${match.url}/:tab`} render={ ({ match }) => (
          <SimpleTabs currTab={match.params.tab} tabs={tabs} baseUrl={baseUrl}/>
        ) }/>
      </Switch>
    </div>
  )
}

function BaseStatsTable({ title, stats }) {
  return (
    <Table {...{
      columns: BaseStats,
      data: [ { key: 0, ...stats } ],
      headers: [ title, 'Base Stats' ]
    }} />
  )
}

function ResistancesTable({ resists }) {
  const data = Resistances.colOrder
    .reduce( (acc, element) => {
       acc[element] = resists[element] ? resists[element] : 'no'
       return acc
    }, {} )
  return (
    <Table {...{
      columns: Resistances,
      data: [ { key: 0, ...data } ],
      headers: [ 'Elemental Resistances' ]
    }} />
  )
}

function AilmentsTable({ ailments }) {
  const data = AilmentResistances.colOrder
    .reduce( (acc, ailment) => {
       acc[ailment] = ailments[ailment] ? ailments[ailment] : 'no'
       return acc
    }, {} )
  return (
    <Table {...{
      columns: AilmentResistances,
      data: [ { key: 0, ...data } ],
      headers: [ 'Ailment Resistances' ]
    }} />
  )
}

function AffinitiesTable({ affinities }) {
  return (
    <Table {...{
      columns: Affinities,
      data: [ { key: 0, ...affinities } ],
      headers: [ 'Affinities' ]
    }} />
  )
}

function SkillsTable({ skills }) {
  return (
    <SortedTable {...{ 
      columns: combineColumns(Skills, SkillLevel),
      initialSortCol: 'lvl',
      headers: [ 'Learnable Skills' ],
      data: skills
    }} />
  )
}

function parseSkill(name) {
  const skill = Object.assign({ 
    key: name, cost: 0, name
  }, SkillData[name])

  if (skill.rank === 0) {
    skill.rank = 32
    skill.rowClass = 'skill unique'
  }

  if (!skill.effect) {
    skill.effect = `${skill.damage} ${skill.element} damage x${skill.hits}`
  }

  if (skill.target) { skill.effect += `, ${skill.target}` }
  if (skill.remark) { skill.effect += `, ${skill.remark}` }

  skill.element = { element: skill.element, rank: skill.rank }

  return skill
}

export default Demon
