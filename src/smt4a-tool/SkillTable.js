import React from 'react'

import SortedTable from './common/SortedTable'
import BatchLoadTable from './common/BatchLoadTable'

import { combineColumns, Skills, SkillLearnedBy } from './DataFields'
import DemonData from './data/DemonData'
import SkillData from './data/SkillData'

class SkillTable extends React.PureComponent {
  shouldComponentUpdate (nextProps, nextState) {
    return false
  }

  render () {
    const { demonsUrl, tabLinks } = this.props

    const columns = combineColumns(Skills, SkillLearnedBy({ url: demonsUrl }))

    const sDemons = Object.keys(DemonData).reduce( (acc, name) => {
      const pSkills = DemonData[name].skills
      return Object.keys(pSkills).reduce( (acc, skill) => {
        acc[skill][name] = pSkills[skill]; return acc
      }, acc)
    }, Object.keys(SkillData).reduce( (acc, skill) => { acc[skill] = {}; return acc }, {} ) )

    const data = Object.keys(SkillData).map( (name) => { 
      const skill = Object.assign({ 
        key: name, cost: 0, name, demons: sDemons[name]
      }, SkillData[name])

      if (skill.rank === 0) {
        skill.rank = 32
        skill.rowClass = 'skill unique'
      }

      if (!skill.effect) {
        skill.effect = `${skill.damage} ${skill.element} damage x${skill.hits}`
      }

      if (skill.target) {
        skill.effect += `, ${skill.target}`
      }

      if (skill.remark) {
        skill.effect += `, ${skill.remark}`
      }

      skill.element = { element: skill.element, rank: skill.rank }

      return skill
    }) 

    return (
      <BatchLoadTable {...{ data, columns, defaultSortCol: 'element' }} >
        <SortedTable {...{
          headers: [].concat(tabLinks, 'List of Skills'),
          colGroups: [
            { header: 'Skill', colSpan: 4 },
            { header: 'How to Obtain', colSpan: 1 }
          ]
        }} />
      </BatchLoadTable>
    )
  }
}

export default SkillTable
