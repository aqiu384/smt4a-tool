import React from 'react'

import { SimpleTable as Table, SortedTable } from '../common/SortedTable'
import BatchLoadTable from '../common/BatchLoadTable'

import { combineColumns, addColumnSuffix, compEntry, SpecialCondition } from '../DataFields'
import { calculateReverseFusions } from './FusionCalculations'
import DemonData from '../data/DemonData'

function SpecialFusionTable({ tabGroups, condition, url }) {
  return (<Table {...{
    headers: tabGroups,
    columns: SpecialCondition({ url }),
    data: [ { key: 0, condition } ]
  }}/>)
}

class ReverseFusionsTable extends React.PureComponent {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.demon !== nextProps.demon
  }

  render() {
    const { demon: name, hasDlc, demonsUrl, tabLinks, moreTabLinks } = this.props
    const compCols = compEntry({ url: demonsUrl })
    const tabGroups = [ moreTabLinks, tabLinks ]

    const excludedNames = Object.keys(hasDlc)
      .reduce( (acc, dlc) => (!hasDlc[dlc] ? acc.concat(dlc.split(',')) : acc), [] )

    const { type: recipeType, recipes } = calculateReverseFusions(name, excludedNames)
    const data = DemonData[name]
    const title = 'Ingredient 1 x Ingredient 2 = Lvl ' + data.lvl + ' ' + data.race + ' ' + name

    switch (recipeType) {
      case 'normal': 
        return (
          <div><BatchLoadTable {...{ 
            columns: combineColumns(compCols, addColumnSuffix(compCols, '2')),
            defaultSortCol: 'race',
            data: recipes.map( (recipe) => {
              const [ing1, ing2] = recipe.split(' x ')
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
          }} >
            <SortedTable {...{
              headers: tabGroups.concat(title),
              colGroups: [
                { header: 'Ingredient 1', colSpan: 3 },
                { header: 'Ingredient 2', colSpan: 3 }
              ]
            }} />
          </BatchLoadTable>
          </div>
        )
      case 'notOwned':
        return <SpecialFusionTable {...{
          condition: [ 'DLC marked as not owned' ],
          url: demonsUrl,
          tabGroups
        }}/>
      case 'special': 
        return <SpecialFusionTable {...{
          condition: recipes[0],
          url: demonsUrl,
          tabGroups
        }}/>
      case 'recruit': 
        return <SpecialFusionTable {...{
          condition: [ 'Fusion Accident Only ' ],
          url: demonsUrl,
          tabGroups
        }}/>
      default:
        return <SpecialFusionTable {...{
          condition: [ 'Unknown Entry' ],
          url: demonsUrl,
          tabGroups
        }}/>
    }
  }
}

export default ReverseFusionsTable
