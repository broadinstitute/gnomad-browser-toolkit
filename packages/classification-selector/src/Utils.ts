import _maxBy from 'lodash/maxBy'
import _partition from 'lodash/partition'
import _last from 'lodash/last'
import _groupBy from 'lodash/groupBy'
import _sumBy from 'lodash/sumBy'
import { ClassificationType, HierarchicalClassification, SimpleClassification } from './types'

export type SimpleNodeIdGeneratorInputs = {
  classification: string
  classificationType: ClassificationType.Simple
} & ({ type: 'classification' } | { type: 'category'; category: string })

export type HierarchicalIdGeneratorInputs = {
  classification: string
  classificationType: ClassificationType.Hierarchical
} & ({ type: 'category'; category: string; level: number } | { type: 'classification' })

// This assumes that the $ character doesn't appear in any word:
export const generateNodeId = (
  input: SimpleNodeIdGeneratorInputs | HierarchicalIdGeneratorInputs
): string => {
  if (input.classificationType === ClassificationType.Simple) {
    const categoryPhrase = input.type === 'classification' ? '' : input.category
    return `simple$${input.classification}$${categoryPhrase}`
  }
  const categoryPhrase = input.type === 'classification' ? '' : input.category
  const levelPhrase = input.type === 'classification' ? '' : input.level
  return `hierarchical$${input.classification}$level$${levelPhrase}$${categoryPhrase}`
}

const simpleNodeIdPattern = /^simple\$([^$]+)\$([^$]*)$/
const hierarchicalNodeIdPattern = /^hierarchical\$([^$]+)\$level\$([^$]*)\$([^$]*)$/
export const parseNodeId = (
  input: string
): SimpleNodeIdGeneratorInputs | HierarchicalIdGeneratorInputs => {
  if (input.startsWith('simple') === true) {
    const matched = input.match(simpleNodeIdPattern)
    if (matched === null) {
      throw new Error(`Cannot parse simple node id ${input}`)
    } else {
      const classification = matched[1]
      const rawCategory = matched[2]
      if (rawCategory === '') {
        return {
          classification,
          classificationType: ClassificationType.Simple,
          type: 'classification',
        }
      }
      return {
        classification,
        classificationType: ClassificationType.Simple,
        type: 'category',
        category: rawCategory,
      }
    }
  } else if (input.startsWith('hierarchical') === true) {
    const matched = input.match(hierarchicalNodeIdPattern)
    if (matched === null) {
      throw new Error(`Cannot parse hierarchical node id ${input}`)
    } else {
      const classification = matched[1]
      const rawLevel = matched[2]
      const parsedLevel = Number.parseInt(rawLevel, 10)
      const rawCategory = matched[3]

      if (Number.isNaN(parsedLevel) === true && rawCategory === '') {
        return {
          classification,
          classificationType: ClassificationType.Hierarchical,
          type: 'classification',
        }
      }
      if (Number.isNaN(parsedLevel) === false && rawCategory !== '') {
        return {
          classification,
          classificationType: ClassificationType.Hierarchical,
          type: 'category',
          category: rawCategory,
          level: parsedLevel,
        }
      }
      throw new Error(`Cannot parse hierarchical node id ${input}`)
    }
  } else {
    throw new Error(`Invalid node id ${input}`)
  }
}

interface DisplayedSimpleClassification {
  nodeId: string
  name: string
  categories: {
    name: string
    nodeId: string
    color: string
    // The label shown to the user in the TreeView
    displayedLabel: string
  }[]
}

export const getDisplayedSimpleClassification = <Item>({
  name: classificationName,
  categories,
}: SimpleClassification<Item>): DisplayedSimpleClassification => {
  const classificationNodeId = generateNodeId({
    type: 'classification',
    classificationType: ClassificationType.Simple,
    classification: classificationName,
  })

  const processedCategories = categories.map(({ name: categoryName, itemCount, color }) => {
    const nodeId = generateNodeId({
      type: 'category',
      classificationType: ClassificationType.Simple,
      classification: classificationName,
      category: categoryName,
    })
    return {
      name: categoryName,
      displayedLabel: `${categoryName} (${itemCount})`,
      nodeId,
      color,
    }
  })

  return {
    nodeId: classificationNodeId,
    name: classificationName,
    categories: processedCategories,
  }
}
type DisplayedHierarchicalCategory = {
  nodeId: string
  color: string
  // The label shown to the user in the TreeView
  displayedLabel: string
} & (
  | // Categories that are more detailed than the selected detail level will
  // need to be aggregated up. If such aggregation needs to be done, the
  // `path`s of categories that are aggregated up will be listed as `constituentPaths`.
  // Otherwise, only the `path` is included.
  { isAggregated: false; path: string[] }
  | { isAggregated: true; constituentPaths: string[][] }
)
interface DisplayedHierarchicalClassification {
  nodeId: string
  name: string
  maxHierarchicalLevel: number
  categories: DisplayedHierarchicalCategory[]
}

export const serializeHierarchicalPath = (path: string[]) => path.join('$-$')

export const getDisplayedHierarchicalClassification = <Item>(args: {
  classification: HierarchicalClassification<Item>
  hierarchicalLevel: number
}): DisplayedHierarchicalClassification => {
  const {
    classification: { name: classificationName, categories },
    hierarchicalLevel,
  } = args
  const classificationNodeId = generateNodeId({
    type: 'classification',
    classificationType: ClassificationType.Hierarchical,
    classification: classificationName,
  })
  const maxHierarchicalLevel = _maxBy(categories, ({ path }) => path.length)!.path.length
  const [lessDetailedThanCurrentLevel, atLeastAsDetailedAsCurrentLevel] = _partition(
    categories,
    ({ path }) => path.length < hierarchicalLevel
  )

  const lessDetailedThanCurrentLevelElems: DisplayedHierarchicalCategory[] = lessDetailedThanCurrentLevel.map(
    ({ path, itemCount, color }) => {
      const categoryName = _last(path)!
      const nodeId = generateNodeId({
        type: 'category',
        classificationType: ClassificationType.Hierarchical,
        classification: classificationName,
        category: categoryName,
        level: path.length,
      })
      const displayedLabel = `${categoryName} (${itemCount})`
      return {
        nodeId,
        displayedLabel,
        color,
        isAggregated: false,
        path,
        constituentCategories: undefined,
      }
    }
  )
  const groupedByCurrentLevel = _groupBy(atLeastAsDetailedAsCurrentLevel, ({ path }) =>
    serializeHierarchicalPath(path.slice(0, hierarchicalLevel))
  )
  const atLeastAsDetailedAsCurrentLevelElems: DisplayedHierarchicalCategory[] = Object.values(
    groupedByCurrentLevel
  ).map(categoriesInLevel => {
    const [firstCategoryInLevel] = categoriesInLevel
    const categoryName = firstCategoryInLevel.path[hierarchicalLevel - 1]
    const nodeId = generateNodeId({
      type: 'category',
      classificationType: ClassificationType.Hierarchical,
      classification: classificationName,
      category: categoryName,
      level: hierarchicalLevel,
    })
    const itemCountInLevel = _sumBy(categoriesInLevel, ({ itemCount }) => itemCount)
    const { color } = firstCategoryInLevel
    return {
      nodeId,
      color,
      displayedLabel: `${categoryName} (${itemCountInLevel})`,
      isAggregated: true,
      constituentPaths: categoriesInLevel.map(({ path }) => path),
    }
  })
  return {
    nodeId: classificationNodeId,
    name: classificationName,
    maxHierarchicalLevel,
    categories: [...lessDetailedThanCurrentLevelElems, ...atLeastAsDetailedAsCurrentLevelElems],
  }
}
