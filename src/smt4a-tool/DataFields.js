import React from 'react'
import { Link } from 'react-router-dom'
import ElementIcons from './img/elements/ElementIcons'
import Races from './data/RaceOrder'

const CompareKeys = (keyOrder) => (key) => (a, b) => keyOrder[a[key]] - keyOrder[b[key]]
const CompareNums = (key) => (a, b) => a[key] - b[key]
const CompareNumsDesc = (key) => (a, b) => b[key] - a[key]
const CompareStrings = (key) => (a, b) => a[key].localeCompare(b[key])
const CompareObjLens = (key) => (a, b) => Object.keys(a[key]).length - Object.keys(b[key]).length

const RaceOrder = Races.reduce((acc, val, ind) => { acc[val] = ind; return acc }, {})

// Resistances

const Elements = [
  'phys', 'gun',
  'fire', 'ice', 'elec', 'force',
  'light', 'dark'
]

const Ailments = [
  'sleep', 'panic', 'charm', 'mute',
  'poison', 'sick', 'bind', 'daze'
]

const ResistanceOrder = [
  'ab', 'rp', 'nu', 'rs', 'no', 'wk'
].reduce((acc, val, ind) => { acc[val] = ind; return acc }, {})

const ResistanceTd = ({ val }) => (
  <td className={'resists ' + val}>{val}</td>
)

const SimpleTh = (val) => (val)

const SimpleTd = ({ val }) => (
  <td>{val}</td>
)

const Resistances = {
  colOrder: Elements,
  headerFormat: Elements.reduce( (acc, val) => {
    acc[val] = <img src={ElementIcons[val]} alt={val}/>; return acc
  }, {} ),
  rowFormat: Elements.reduce( (acc, val) => {
    acc[val] = ResistanceTd; return acc
  }, {} ),
  sortFun: Elements.reduce( (acc, val) => {
    acc[val] = CompareKeys(ResistanceOrder); return acc
  }, {} )
}

const AilmentResistances = {
  colOrder: Ailments,
  headerFormat: Ailments.reduce( (acc, val) => {
    acc[val] = SimpleTh(val); return acc
  }, {} ),
  rowFormat: Ailments.reduce( (acc, val) => {
    acc[val] = ResistanceTd; return acc
  }, {} ),
  sortFun: Ailments.reduce( (acc, val) => {
    acc[val] = CompareKeys(ResistanceOrder); return acc
  }, {} )
}

// Affinities

const AffinityElements = Elements.concat([
  'almighty', 'recovery', 'ailment', 'support'
])

const AffinityTd = ({ val }) => (
  <td className={'affinity' + val}>{val > 0 ? '+' + val : val}</td>
)

const Affinities = {
  colOrder: AffinityElements,
  headerFormat: AffinityElements.reduce( (acc, val) => {
    acc[val] = <img src={ElementIcons[val]} alt={val}/>; return acc
  }, {} ),
  rowFormat: AffinityElements.reduce( (acc, val) => {
    acc[val] = AffinityTd; return acc
  }, {} ),
  sortFun: AffinityElements.reduce( (acc, val) => {
    acc[val] = CompareNumsDesc; return acc
  }, {} )
}

// Skills

const ElementOrder = AffinityElements.concat([
  'other', 'passive'
]).reduce((acc, val, ind) => { acc[val] = ind; return acc }, {})

const ElementIconTd = ({ val }) => (
  <td><img src={ElementIcons[val]} alt={val}/></td>
)

const SkillCostTd = ({ val }) => (
  <td>{val === 0 ? 'Auto' : val}</td>
)

const Skills = {
  colOrder: [ 'element', 'name', 'cost', 'effect' ],
  headerFormat: {
    element: SimpleTh('Element'),
    name: SimpleTh('Name'),
    effect: SimpleTh('Effect'),
    cost: SimpleTh('MP Cost'),
    rank: SimpleTh('Rank')
  },
  rowFormat: {
    element: ({ val }) => ElementIconTd({ val: val.element }), 
    name: SimpleTd,
    effect: SimpleTd,
    cost: SkillCostTd,
    rank: ({ val }) => SimpleTd({ val: val === 32 ? 0 : val })
  },
  sortFun: {
    element: (key) => (a, b) => (
      CompareKeys(ElementOrder)('element')(a[key], b[key]) * 10000 + 
      CompareNums('rank')(a[key], b[key])
    ),
    name: CompareStrings,
    effect: CompareStrings,
    cost: CompareNums,
    rank: CompareNums
  }
}

const DemonLinkTd = ({ url }) => (
  ({ val }) => (
    <td><Link to={`${url}/${val}`}>{val}</Link></td>
  )
)

const SkillLearnedByTd = ({ url }) => (
  ({ val }) => (
    <td><ul className="commas">{Object.keys(val).map( name => {
      const lvl = val[name] !== 0 ? ` (${val[name]})` : ''
      return <li key={name}><Link to={`${url}/${name}`}>{name}{lvl}</Link></li> 
    } )}</ul></td>
  )
)

const DemonLinkListTd = ({ url }) => (
  ({ val }) => (
    <td><ul className="commas">{val.filter( name => name !== '' ).map( name => 
      <li key={name}><Link to={`${url}/${name}`}>{name}</Link></li> )}
    </ul></td>
  )
)

const SkillLearnedBy = ({ url }) => ({
  colOrder: [ 'demons' ],
  headerFormat: {
    demons: SimpleTh('Learned by')
  },
  rowFormat: {
    demons: SkillLearnedByTd({ url })
  },
  sortFun: {
    demons: CompareObjLens
  }
})

const SkillLevelTd = ({ val }) => (
  <td>{val > 0 ? val : 'Innate'}</td>
)

const SkillLevel = {
  colOrder: [ 'lvl' ],
  headerFormat: { lvl: SimpleTh('Level') },
  rowFormat: { lvl: SkillLevelTd },
  sortFun: { lvl: CompareNums }
}

// Base Stats

const Stats = [ 'hp', 'mp', 'st', 'dx', 'ma', 'ag', 'lu' ]

const BaseStats = {
  colOrder: Stats,
  headerFormat: Stats.reduce( (acc, val) => { acc[val] = SimpleTh(val); return acc }, {} ),
  rowFormat: Stats.reduce( (acc, val) => { acc[val] = SimpleTd; return acc }, {} ),
  sortFun: Stats.reduce( (acc, val) => { acc[val] = CompareNumsDesc; return acc }, {} )
}

// Compendium Entry

const compEntry = ({ url }) => ({
  colOrder: [ 'race', 'lvl', 'name' ],
  headerFormat: {
    race: SimpleTh('Race'),
    lvl: SimpleTh('Level'),
    name: SimpleTh('Name')
  },
  rowFormat: { 
    race: ({ val }) => SimpleTd({ val: val.race }), 
    lvl: SimpleTd, 
    name: DemonLinkTd({ url })
  },
  sortFun: {
    race: (key) => (a, b) => (
      CompareKeys(RaceOrder)('race')(a[key], b[key]) * 128 + 
      CompareNums('lvl')(b[key], a[key])
    ),
    lvl: CompareNums,
    name: CompareStrings
  }
})

const SpecialConditionTd = ({ url }) => (
  ({ val }) => (
    val.length > 1 ?
      DemonLinkListTd({ url })({ val }) :
      SimpleTd({ val })
  )
)

const SpecialCondition = ({ url }) => ({
  colOrder: [ 'condition' ],
  headerFormat: { condition: SimpleTh('Special Fusion Condition') },
  rowFormat: { condition: SpecialConditionTd({ url }) },
  sortFun: { condition: CompareStrings }
})

const DlcDemon = {
  colOrder: [ 'dlc' ],
  headerFormat: { dlc: SimpleTh('Available DLC Demon') },
  rowFormat: { dlc: SimpleTd },
  sortFun: { dlc: CompareStrings }
}

// Combines generic columns

const combineColumns = (...cols) => ({
  colOrder: cols.reduce( (acc, val) => acc.concat(val.colOrder), [] ),
  headerFormat: cols.reduce( (acc, val) => Object.assign(acc, val.headerFormat), {} ),
  rowFormat: cols.reduce( (acc, val) => Object.assign(acc, val.rowFormat), {} ),
  sortFun: cols.reduce( (acc, val) => Object.assign(acc, val.sortFun), {} ),
})

const addColumnSuffix = ({ colOrder, rowFormat, sortFun, headerFormat }, suffix) => ({
  colOrder: colOrder.map( (col) => (col + suffix) ),
  headerFormat: Object.keys(rowFormat).reduce(
    (acc, col) => { acc[col + suffix] = headerFormat[col]; return acc },
  {} ),
  rowFormat: Object.keys(rowFormat).reduce(
    (acc, col) => { acc[col + suffix] = rowFormat[col]; return acc },
  {} ),
  sortFun: Object.keys(sortFun).reduce(
    (acc, col) => { acc[col + suffix] = sortFun[col]; return acc },
  {} )
})

// Exports

export {
  combineColumns, addColumnSuffix, compEntry,
  BaseStats, Resistances, Affinities, Skills, SkillLearnedBy,
  SkillLevel, SpecialCondition, DlcDemon, AilmentResistances
}
