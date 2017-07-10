import React from 'react'

import SortedTable from './common/SortedTable'
import BatchLoadTable from './common/BatchLoadTable'

import { combineColumns, addColumnSuffix, compEntry, BaseStats, Resistances, Affinities } from './DataFields'
import SpecialRecipes from './data/SpecialRecipes'
import DemonData from './data/DemonData'

class DemonTable extends React.PureComponent {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.hasDlc !== this.props.hasDlc
  }

  render() {
    const { hasDlc, demonsUrl, tabLinks } = this.props

    const excludedDlc = Object.keys(hasDlc).reduce( (acc, dlc) => (
      !hasDlc[dlc] ? acc.concat(dlc.split(',')) : acc
    ), [] )

    const demons = excludedDlc.reduce( (acc, name) => {
      delete acc[name]; return acc
    }, Object.assign({}, DemonData) )

    const columns = combineColumns(
      compEntry({ url: demonsUrl }),
      BaseStats, Resistances, addColumnSuffix(Affinities, 'A')
    )

    const data = Object.keys(demons).map( (name) => {
      const { lvl, race, stats, resists, affinities } = demons[name]
      const row = {
        key: name, race: { race, lvl },
        lvl, name, ...stats
      }

      Resistances.colOrder.reduce( (acc, element) => {
        acc[element] = resists[element] ? resists[element] : 'no'; return acc
      }, row)

      Affinities.colOrder.reduce( (acc, element) => {
        acc[element + 'A'] = affinities[element] ? affinities[element] : 0; return acc
      }, row)

      if (SpecialRecipes.hasOwnProperty(name)) {
        row.rowClass = 'fusion ' + (SpecialRecipes[name].length === 0 ?
          'accident' :
          'special'
        )
      }

      return row
    } )

    return (
      <BatchLoadTable {...{ data, columns, defaultSortCol: 'race' }} >
        <SortedTable {...{
          headers: [].concat(tabLinks, 'List of Demons'),
          colGroups: [
            { header: 'Demons', colSpan: 3 },
            { header: 'Base Stats', colSpan: 7 },
            { header: 'Resistances', colSpan: 8 },
            { header: 'Skill Affinities', colSpan: 12 },
          ]
        }} />
      </BatchLoadTable>
    )
  }
}

export default DemonTable
