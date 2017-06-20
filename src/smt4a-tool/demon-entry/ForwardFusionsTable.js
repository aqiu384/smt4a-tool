import React from 'react'

import { SortedTable } from '../common/SortedTable'
import BatchLoadTable from '../common/BatchLoadTable'

import { combineColumns, addColumnSuffix, compEntry } from '../DataFields'
import { calculateForwardFusions } from './FusionCalculations'
import DemonData from '../data/DemonData'

class ForwardFusionsTable extends React.PureComponent {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.demon !== nextProps.demon
  }

  render() {
    const { demon: name, hasDlc, demonsUrl, tabLinks, moreTabLinks } = this.props
    const excludedNames = Object.keys(hasDlc)
      .reduce( (acc, dlc) => (!hasDlc[dlc] ? acc.concat(dlc.split(',')) : acc), [] )

    const compCols = compEntry({ url: demonsUrl })
    const recipes = calculateForwardFusions(name, excludedNames)
    const data = DemonData[name]
    const title = 'Lvl ' + data.lvl + ' ' + data.race + ' ' + name + ' x Ingredient 2 = Result'

    return (
      <BatchLoadTable {...{ 
        columns: combineColumns(compCols, addColumnSuffix(compCols, '2')),
        defaultSortCol: 'race',
        data: recipes.map( (recipe) => {
          const [ing1, ing2] = recipe.split(' = ')
          const i1 = DemonData[ing1], i2 = DemonData[ing2]
          return {
            key: ing1 + '-' + ing2,
            race: { race: i1.race, lvl: i1.lvl },
            lvl: i1.lvl,
            name: ing1,
            race2: { race: i2.race, lvl: i2.lvl },
            lvl2: i2.lvl,
            name2: ing2
          }
        })
      }}>
        <SortedTable {...{
          headers: [].concat(moreTabLinks, tabLinks, title),
          colGroups: [
            { header: 'Ingredient 2', colSpan: 3 },
            { header: 'Result', colSpan: 3 }
          ]
        }} />
      </BatchLoadTable>
    )
  }
}

export default ForwardFusionsTable
