import { useState, useMemo } from 'react'
import _uniq from 'lodash/uniq'
import { ClassificationType, Classification, Predicate, HierarchicalClassification } from './types'
import {
  parseNodeId,
  generateNodeId,
  serializeHierarchicalPath,
  getDisplayedHierarchicalClassification,
  getDisplayedSimpleClassification,
} from './Utils'
import usePrevious from './usePrevious'

type WithColorAndGrouping<Item> = Item & {
  color: string
  group: string
}

// Parse the list of "selected node ids" as provided by Material UI's TreeView
// component to figure out which categories of which classifications are
// selected and at which level (for hierarchical classifications).
const parseSelectedNodeIds = (selected: string[]) => {
  const hierarchicalCategories: { name: string; level: number; classification: string }[] = []
  const simpleCategories: { name: string; classification: string }[] = []
  // The list of all classification being selected:
  const classificationNames: string[] = []
  for (const selectedString of selected) {
    const parsed = parseNodeId(selectedString)
    if (parsed.type === 'category') {
      classificationNames.push(parsed.classification)
      if (parsed.classificationType === ClassificationType.Simple) {
        simpleCategories.push({
          classification: parsed.classification,
          name: parsed.category,
        })
      } else if (parsed.classificationType === ClassificationType.Hierarchical) {
        hierarchicalCategories.push({
          name: parsed.category,
          level: parsed.level,
          classification: parsed.classification,
        })
      }
    }
  }
  const uniqClassifications = _uniq(classificationNames)
  return {
    uniqClassifications,
    hierarchicalCategories,
    simpleCategories,
  }
}

const areHierarchicalPathsEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

interface Inputs<Item> {
  classifications: Classification<Item>[]
  items: Item[]
}
export default <Item>({ classifications, items }: Inputs<Item>) => {
  const [selected, setSelected] = useState<string[]>([])

  const {
    uniqClassifications: currentClassificationNames,
    hierarchicalCategories: currentHierarchicalCategories,
    simpleCategories: currentSimpleCategoryNames,
  } = useMemo(() => parseSelectedNodeIds(selected), [selected])
  const previousSelected = usePrevious(selected)

  if (previousSelected !== undefined && currentClassificationNames.length > 1) {
    // This means we're transitioning from one classification to another:
    const { uniqClassifications: prevClassificationNames } = parseSelectedNodeIds(previousSelected)
    const newClassifications = currentClassificationNames.filter(
      name => prevClassificationNames.includes(name) === false
    )
    if (newClassifications.length > 1) {
      throw new Error(
        `There should not be more than 2 classifications being selected during a transition. Got ${newClassifications.join(
          ', '
        )}`
      )
    }
    const [newClassification] = newClassifications
    const newSelected: string[] = []
    for (const { classification, level, name } of currentHierarchicalCategories) {
      if (classification === newClassification) {
        newSelected.push(
          generateNodeId({
            category: name,
            classification,
            classificationType: ClassificationType.Hierarchical,
            level,
            type: 'category',
          })
        )
      }
    }
    for (const { classification, name } of currentSimpleCategoryNames) {
      if (classification === newClassification) {
        newSelected.push(
          generateNodeId({
            category: name,
            classification,
            classificationType: ClassificationType.Simple,
            type: 'category',
          })
        )
      }
    }

    setSelected(newSelected)
  }

  let filteredItems: Item[]
  if (
    currentClassificationNames.length === 1 &&
    (currentHierarchicalCategories.length > 0 || currentSimpleCategoryNames.length > 0)
  ) {
    const [classificationName] = currentClassificationNames
    const classification = classifications.find(({ name }) => name === classificationName)!
    const predicates: Predicate<Item>[] = []
    if (classification.type === ClassificationType.Simple) {
      const { getCategoryValueOfItem } = classification
      for (const { name: categoryName } of currentSimpleCategoryNames) {
        const predicate = (item: Item) => getCategoryValueOfItem(item) === categoryName
        predicates.push(predicate)
      }
    } else if (classification.type === ClassificationType.Hierarchical) {
      const { getPathValueOfItem } = classification
      for (const { name, level } of currentHierarchicalCategories) {
        const predicate = (item: Item) => {
          const pathValue = getPathValueOfItem(item)
          return pathValue[level - 1] === name
        }
        predicates.push(predicate)
      }
    }
    if (predicates.length === 0) {
      filteredItems = items
    } else {
      filteredItems = items.filter(item => {
        for (const predicate of predicates) {
          if (predicate(item) === true) {
            return true
          }
        }
        return false
      })
    }
  } else {
    filteredItems = items
  }

  const [hierarchicalLevels, internalSetHierarchicalLevels] = useState<{
    [classification: string]: number
  }>(() => {
    const hierarchicalClassifications = classifications.filter(
      elem => elem.type === ClassificationType.Hierarchical
    ) as HierarchicalClassification<Item>[]
    const initialHierarchicalLevels = Object.fromEntries(
      hierarchicalClassifications.map(elem => [elem.name, 1] as const)
    )
    return initialHierarchicalLevels
  })
  const setHierarchicalLevel = (classificationName: string, value: number) =>
    internalSetHierarchicalLevels({
      ...hierarchicalLevels,
      [classificationName]: value,
    })

  const filteredItemsWithColorAndGrouping = useMemo(() => {
    let classificationForGrouping: Classification<Item>
    if (currentClassificationNames.length === 0) {
      ;[classificationForGrouping] = classifications
    } else {
      // We can be sure the list only has one element because of the forced re-rendering above:
      const currentName = currentClassificationNames[0]
      classificationForGrouping = classifications.find(({ name }) => name === currentName)!
    }

    const result: WithColorAndGrouping<Item>[] = []
    if (classificationForGrouping.type === ClassificationType.Simple) {
      const { categories } = getDisplayedSimpleClassification(classificationForGrouping)
      for (const item of filteredItems) {
        const categoryValue = classificationForGrouping.getCategoryValueOfItem(item)
        for (const category of categories) {
          const { name: thisCategoryName, color: thisCategoryColor } = category
          if (categoryValue === thisCategoryName) {
            result.push({
              ...item,
              group: thisCategoryName,
              color: thisCategoryColor,
            })
            break
          }
        }
      }
    } else {
      const hierarchicalLevel = hierarchicalLevels[classificationForGrouping.name]
      const { categories } = getDisplayedHierarchicalClassification({
        classification: classificationForGrouping,
        hierarchicalLevel,
      })
      for (const item of filteredItems) {
        const pathValue = classificationForGrouping.getPathValueOfItem(item)
        for (const thisCategory of categories) {
          if (thisCategory.isAggregated === true) {
            const matched = thisCategory.constituentPaths.some(path =>
              areHierarchicalPathsEqual(path, pathValue)
            )
            if (matched === true) {
              result.push({
                ...item,
                group: serializeHierarchicalPath(pathValue),
                color: thisCategory.color,
              })
              break
            }
          } else if (areHierarchicalPathsEqual(pathValue, thisCategory.path) === true) {
            result.push({
              ...item,
              group: serializeHierarchicalPath(pathValue),
              color: thisCategory.color,
            })
            break
          }
        }
      }
    }
    return result
  }, [classifications, currentClassificationNames, filteredItems, hierarchicalLevels])

  return {
    filteredItems,
    selected,
    setSelected,
    hierarchicalLevels,
    setHierarchicalLevel,
    filteredItemsWithColorAndGrouping,
  }
}
