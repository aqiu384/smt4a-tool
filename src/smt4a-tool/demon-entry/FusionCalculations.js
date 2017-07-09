import DemonData from '../data/DemonData'
import FusionChart from '../data/FusionChart'
import SpecialRecipes from '../data/SpecialRecipes'
import ElementModifiers from '../data/ElementModifiers'
import RaceOrder from '../data/RaceOrder'

const NormalFusionExceptions = Object.keys(SpecialRecipes).reduce( (acc, nameR) => {
  const recipe = SpecialRecipes[nameR]
  if (recipe.length === 2) {
    const [ ing1, ing2 ] = recipe
    acc[ing1] = ing2
    acc[ing2] = ing1
  }
  return acc
}, {} )

const ReverseFusionChart = Object.keys(FusionChart).reduce( (acc, race1) => {
  const races2 = FusionChart[race1]
  return Object.keys(races2).reduce( (acc, race2) => {
    const raceR = races2[race2]
    const recipes = acc[raceR]

    if ((race1 === race2 && recipes.indexOf(race1 + ' x ' + race1) === -1) ||
      RaceOrder.indexOf(race1) < RaceOrder.indexOf(race2)) {
      recipes.push(race1 + ' x ' + race2)
    }

    return acc
  }, acc)
}, RaceOrder.concat(Object.keys(DemonData).filter( (name) => DemonData[name].race === 'Element' ))
  .reduce( (acc, race) => { acc[race] = []; return acc }, {} )
)

const ReverseDemonLookup = Object.keys(DemonData).reduce( (acc, name) => {
  acc[DemonData[name].race][DemonData[name].lvl] = name
  return acc
}, RaceOrder.reduce( (acc, race) => { acc[race] = {}; return acc }, {} ) )

const NormalIngredients = Object.keys(DemonData).reduce( (acc, name) => {
  acc[DemonData[name].race][name] = DemonData[name].lvl
  return acc
}, RaceOrder.reduce( (acc, race) => { acc[race] = {}; return acc }, {} ) )

const NormalResults = RaceOrder.reduce(
  (acc, race) => { acc[race].sort( (a, b) => (a - b) ); return acc },
  Object.keys(DemonData).reduce( (acc, name) => {
    if (!SpecialRecipes.hasOwnProperty(name)) {
      acc[DemonData[name].race].push(DemonData[name].lvl)
    } return acc
  }, RaceOrder.reduce( (acc, race) => { acc[race] = []; return acc }, {} ) )
)

const ElementMods = Object.assign(
  RaceOrder.reduce( (acc, race) => { acc[race] = {}; return acc }, {} ), ElementModifiers
)

function generateIngredients(excludedNames) {
  return excludedNames.reduce( (acc, name) => {
    const { race } = DemonData[name]
    acc[race] = Object.assign({}, acc[race])
    delete acc[race][name]
    return acc
  }, Object.assign({}, NormalIngredients) )
}

function calculateNormalFusions(nameR, ingredients) {
  const { race: raceR, lvl: lvlR } = DemonData[nameR]
  if (raceR === 'Element' || SpecialRecipes.hasOwnProperty(nameR)) { return [] }

  const lvlsR = NormalResults[raceR]
  const indexR = lvlsR.indexOf(lvlR)

  const prevLvl = lvlsR[indexR - 1] ? 2 * lvlsR[indexR - 1] : 0
  const currLvl = lvlsR[indexR + 1] ? 2 * lvlR: 200

  return ReverseFusionChart[raceR].reduce( (acc, combo) => {
    const [ race1, race2 ] = combo.split(' x ')

    return Object.keys(ingredients[race1]).reduce( (acc, name1) => {
      const lvl1 = ingredients[race1][name1]

      return Object.keys(ingredients[race2]).reduce( (acc, name2) => {
        const lvl2 = ingredients[race2][name2]

        if (prevLvl < lvl1 + lvl2 && lvl1 + lvl2 <= currLvl) { 
          acc.push(
            name1 + ' x ' + name2
          )
        } return acc
      }, acc )
    }, acc )
  }, [] )
}

function calculateElementFusions(nameR, ingredients) {
  const { race: raceR, lvl: lvlR } = DemonData[nameR]
  if (raceR === 'Element' || SpecialRecipes.hasOwnProperty(nameR)) { return [] }

  const offsets = [ -1, 1 ]
  const results = [0].concat(NormalResults[raceR])
  const maxLvl1 = Object.keys(ingredients[raceR]).reduce(
    (acc, name1) => (ingredients[raceR][name1] > acc ? ingredients[raceR][name1] : acc), 0
  )

  const modRecipes = Object.keys(ingredients[raceR]).reduce( (acc, name1) => {
    const lvl1 = ingredients[raceR][name1]
    const lvlsR = results.slice()
 
    if (lvlsR.indexOf(lvl1) < 0) {
      lvlsR.push(lvl1)
      lvlsR.sort( (a, b) => (a - b) )
    }

    lvlsR.push(lvl1 === maxLvl1 ? results[1] : 100)

    const index = lvlsR.indexOf(lvl1)

    return offsets.reduce( (acc, offset) => {
      if (lvlsR[index + offset] === lvlR) { 
        acc.push(name1 + ' x ' +  offset)
      } return acc
    }, acc )
  }, [] )

  const modTargets = Object.keys(ElementMods[raceR]).reduce(
    (acc, element) => {
      acc[ElementMods[raceR][element]].push(element)
      return acc
    },
    { '-1': [], '1': [] }
  )

  return modRecipes.reduce( (acc, modRecipe) => {
    const [ name1, mod2 ] = modRecipe.split(' x ')
    return modTargets[mod2].reduce( (acc, name2) => {
      acc.push(name1 + ' x ' + name2); return acc
    }, acc )
  }, [] )
}

function calculateReverseElementFusions(nameR, ingredients) {
  if (DemonData[nameR].race !== 'Element') { return [] }

  return ReverseFusionChart[nameR].reduce( (acc, combo) => {
    const race1 = combo.split(' x ')[0]
    const names1 = Object.keys(ingredients[race1])
    return names1.reduce( (acc, name1, ind) => {
      return names1.slice(ind + 1).reduce( (acc, name2) => {
        acc.push(name1.localeCompare(name2) ? name1 + ' x ' + name2 : name2 + ' x ' + name1)
        return acc
      }, acc)
    }, acc)
  }, [] )
}

function calculateReverseFusions(name, excludedNames) {
  if (excludedNames.indexOf(name) !== -1) {
    return { type: 'notOwned', recipes: [] }
  }

  if (SpecialRecipes.hasOwnProperty(name)) {
    const recipe = SpecialRecipes[name]
    return recipe.length === 0 ?
      { type: 'recruit', recipes: [] } :
      { type: 'special', recipes: [ recipe ] }
  }

  const ingredients = generateIngredients(excludedNames)
  return { type: 'normal', recipes: [].concat(
    calculateNormalFusions(name, ingredients),
    calculateElementFusions(name, ingredients),
    calculateReverseElementFusions(name, ingredients)
  )}
}

function calculateForwardNormalFusions(name1, ingredients) {
  const { race: race1, lvl: lvl1 } = DemonData[name1]
  if (race1 === 'Element') { return [] }

  const recipes = Object.keys(FusionChart[race1])
    .filter( (race2) => (race2 !== race1) )
    .reduce( (acc, race2) => {
      const raceR = FusionChart[race1][race2]

      const names2 = ingredients[race2]
      const lvlsR = NormalResults[raceR].map( lvlR => 2 * lvlR )

      return Object.keys(names2).reduce( (acc, name2) => {
        const lvl2 = names2[name2]
        const indexR = lvlsR.reduce( (acc, lvlR) => (lvl1 + lvl2 <= lvlR ? acc : acc + 1), 0 )
        const lvlR = lvlsR[indexR === lvlsR.length ? lvlsR.length - 1 : indexR] / 2

        acc[name2] = ReverseDemonLookup[raceR][lvlR]

        return acc
      }, acc )
    }, {} )

  if (NormalFusionExceptions.hasOwnProperty(name1)) {
    delete recipes[NormalFusionExceptions[name1]]
  }

  return Object.keys(recipes).map( name2 => name2 + ' = ' + recipes[name2] )
}

function calculateForwardSameRaceFusions(name1, ingredients) {
  const { race: race1 } = DemonData[name1]
  if (race1 === 'Element' || !FusionChart[race1].hasOwnProperty(race1)) { return [] }

  const nameR = FusionChart[race1][race1]
  const names2 = Object.keys(ingredients[race1])
    .filter( name2 => name2 !== name1 )

  const recipes = names2.reduce( (acc, name2) => {
    acc[name2] = nameR
    return acc
  }, {} )

  if (NormalFusionExceptions.hasOwnProperty(name1)) {
    delete recipes[NormalFusionExceptions[name1]]
  }

  return Object.keys(recipes).map( lvl2 => lvl2 + ' = ' + recipes[lvl2] )
}

function calculateForwardElementFusions(name1, ingredients) {
  const { race: race1, lvl: lvl1 } = DemonData[name1]
  if (race1 === 'Element' || !FusionChart[race1].hasOwnProperty(race1)) { return [] }

  const maxLvl1 = Object.keys(ingredients[race1]).reduce(
    (acc, name1) => (ingredients[race1][name1] > acc ? ingredients[race1][name1] : acc), 0
  )

  const lvlsR = [0].concat(NormalResults[race1])
  if (lvlsR.indexOf(lvl1) < 0) {
    lvlsR.push(lvl1)
    lvlsR.sort( (a, b) => (a - b) )
  }
  lvlsR.push(lvl1 === maxLvl1 ? lvlsR[1] : 100)

  const index1 = lvlsR.indexOf(lvl1)
  const modResults = [ -1, 1 ].reduce( (acc, offset) => {
    const lvlR = lvlsR[index1 + offset]
    if (lvlR !== 0 && lvlR !== 100) {
      acc.push(offset + ' = ' + ReverseDemonLookup[race1][lvlR])
    }
    return acc
  }, [] )

  const modTargets = Object.keys(ElementMods[race1]).reduce(
    (acc, element) => {
      acc[ElementMods[race1][element]].push(element)
      return acc
    },
    { '-1': [], '1': [] }
  )

  return modResults.reduce( (acc, modResult) => {
    const [ mod2, nameR ] = modResult.split(' = ')
    return modTargets[mod2].reduce ( (acc, name2) => {
      acc.push(name2 + ' = ' + nameR); return acc
    }, acc )
  }, [] )
}

function calculateNormalElementFusions(name1) {
  const { race: race1 } = DemonData[name1]
  if (race1 !== 'Element') { return [] }

  return Object.keys(ElementMods)
    .filter( race2 => ElementMods[race2].hasOwnProperty(name1) )
    .reduce( (acc, race2) => {
      const mod1 = ElementMods[race2][name1]
      const lvls1 = NormalResults[race2]
      const lvls2 = mod1 < 0 ? lvls1.slice(-1 * mod1) : lvls1.slice(0, -1 * mod1)
      const lvlsR = mod1 < 0 ? lvls1.slice(0, mod1) : lvls1.slice(mod1)

      return lvls2.reduce( (acc, lvl2, indR) => {
	acc.push(
	  ReverseDemonLookup[race2][lvl2] + ' = ' +
	  ReverseDemonLookup[race2][lvlsR[indR]]
	)
	return acc
      }, acc)
    }, [] )
}

function calculateSpecialElementFusions(name1, ingredients) {
  const { race: race1 } = DemonData[name1]
  if (race1 !== 'Element') { return [] }

  return Object.keys(SpecialRecipes)
    .filter( (name2) => {
      const { race: race2 } = DemonData[name2]
      return ingredients[race2].hasOwnProperty(name2) &&
        ElementMods.hasOwnProperty(race2) &&
        ElementMods[race2].hasOwnProperty(name1)
    })
    .reduce( (acc, name2) => {
      const { race: race2, lvl: lvl2 } = DemonData[name2]
      const mod1 = ElementMods[race2][name1]
      const maxLvl2 = Object.keys(ingredients[race2]).reduce(
	(acc, name) => (ingredients[race2][name] > acc ? ingredients[race2][name] : acc), 0
      )

      const lvlsR = NormalResults[race2]
      const indR = mod1 + lvlsR.reduce( (acc, lvlR) => (lvl2 >= lvlR ? acc + 1 : acc), 0)

      if (lvl2 === maxLvl2 && mod1 === 1) {
        acc.push(name2 + ' = ' + ReverseDemonLookup[race2][lvlsR[0]])
      }
      else if (indR < lvlsR.length) {
        acc.push(name2 + ' = ' + ReverseDemonLookup[race2][lvlsR[indR]])
      }

      return acc
    }, [] )
}

function calculateForwardFusions(name, excludedNames) {
  if (DemonData[name].race === 'Primal') { return [] }
  const ingredients = generateIngredients(excludedNames)
  return [].concat(
    calculateForwardNormalFusions(name, ingredients),
    calculateForwardSameRaceFusions(name, ingredients),
    calculateForwardElementFusions(name, ingredients),
    calculateNormalElementFusions(name),
    calculateSpecialElementFusions(name, ingredients)
  )
}

export { calculateReverseFusions, calculateForwardFusions }
