import { useState, useMemo, useCallback } from 'react'
import _uniq from 'lodash/uniq'
import { ClassificationType, Classification, Predicate } from './types'
import {
  parseNodeId,
  generateNodeId,
  getDisplayedHierarchicalClassification,
  getDisplayedSimpleClassification,
  serializeHierarchicalPath,
} from './Utils'
import usePrevious from './usePrevious'

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
type WithColorAndGrouping<Item> = Item & {
  color: string
  group: string
}

const parseSelectedNodeIds = (selectedNodeIds: string[]) => {
  const selectedHierarchicalCategories: { path: string[]; classificationName: string }[] = []
  const selectedSimpleCategories: { name: string; classificationName: string }[] = []
  // These are classifications that are selected but none of their categories are selected:
  const selectedHollowClassifications: string[] = []
  const selectedNonHollowClassifications: string[] = []
  for (const selectedNodeId of selectedNodeIds) {
    const parsed = parseNodeId(selectedNodeId)
    if (parsed.type === 'category') {
      selectedNonHollowClassifications.push(parsed.classification)
      if (parsed.classificationType === ClassificationType.Simple) {
        selectedSimpleCategories.push({
          classificationName: parsed.classification,
          name: parsed.category,
        })
      } else {
        selectedHierarchicalCategories.push({
          classificationName: parsed.classification,
          path: parsed.path,
        })
      }
    } else {
      selectedHollowClassifications.push(parsed.classification)
    }
  }
  return {
    selectedSimpleCategories,
    selectedHierarchicalCategories,
    selectedHollowClassifications,
    selectedNonHollowClassifications: _uniq(selectedNonHollowClassifications),
  }
}

interface Inputs<Item> {
  classifications: Classification<Item>[]
  items: Item[]
}
export default <Item>({ classifications, items }: Inputs<Item>) => {
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>([])

  const {
    selectedNonHollowClassifications: currentClassificationNames,
    selectedHierarchicalCategories: currentHierarchicalCategories,
    selectedSimpleCategories: currentSimpleCategories,
    selectedHollowClassifications,
  } = useMemo(() => parseSelectedNodeIds(selected), [selected])
  const prevSelected = usePrevious(selected)

  if (prevSelected !== undefined && currentClassificationNames.length > 1) {
    // This means the tree view component is transitioning from one classification to another:
    const { selectedNonHollowClassifications: prevClassificationNames } = parseSelectedNodeIds(
      prevSelected
    )
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
    const newSelectd: string[] = []
    // Only one of the following 2 `for` loops will be executed because the sole
    // selected classification will be either a simple or hierarchical
    // classification:
    for (const { classificationName, path } of currentHierarchicalCategories) {
      if (classificationName === newClassification) {
        newSelectd.push(
          generateNodeId({
            classification: classificationName,
            classificationType: ClassificationType.Hierarchical,
            type: 'category',
            path,
          })
        )
      }
    }
    for (const { classificationName, name } of currentSimpleCategories) {
      if (classificationName === newClassification) {
        newSelectd.push(
          generateNodeId({
            classification: classificationName,
            classificationType: ClassificationType.Simple,
            type: 'category',
            category: name,
          })
        )
      }
    }

    setSelected(newSelectd)
  }

  let filteredItems: Item[]
  if (
    currentClassificationNames.length === 1 &&
    (currentHierarchicalCategories.length > 0 || currentSimpleCategories.length > 0)
  ) {
    const [classificationName] = currentClassificationNames
    const classification = classifications.find(({ name }) => name === classificationName)!
    const predicates: Predicate<Item>[] = []
    if (classification.type === ClassificationType.Simple) {
      const { getCategoryValueOfItem } = classification
      for (const { name: categoryName } of currentSimpleCategories) {
        const predicate = (item: Item) => getCategoryValueOfItem(item) === categoryName
        predicates.push(predicate)
      }
    } else if (classification.type === ClassificationType.Hierarchical) {
      const { getPathValueOfItem } = classification
      for (const { path } of currentHierarchicalCategories) {
        const predicate = (item: Item) => {
          const itemPathValue = getPathValueOfItem(item)
          for (let i = 0; i < path.length; i += 1) {
            if (itemPathValue[i] !== path[i]) {
              return false
            }
          }
          return true
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

  const filteredItemsWithColorAndGrouping = useMemo(() => {
    // Determine what classification should be used to draw the PheWAS plot. If
    // no classification is selected, use the first classification:
    let classificationForGrouping: Classification<Item>
    if (currentClassificationNames.length === 0) {
      ;[classificationForGrouping] = classifications
    } else {
      const currentName = currentClassificationNames[0]
      classificationForGrouping = classifications.find(({ name }) => name === currentName)!
    }

    const result: WithColorAndGrouping<Item>[] = []
    if (classificationForGrouping.type === ClassificationType.Simple) {
      const { categories } = classificationForGrouping
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
      const { categories } = classificationForGrouping
      for (const item of filteredItems) {
        const pathValue = classificationForGrouping.getPathValueOfItem(item)
        for (const { path, color } of categories) {
          if (areHierarchicalPathsEqual(pathValue, path) === true) {
            result.push({
              ...item,
              group: serializeHierarchicalPath(pathValue),
              color,
            })
          }
        }
      }
    }
    return result
  }, [classifications, currentClassificationNames, filteredItems])

  const clearSelectedCategories = useCallback(() => {
    if (currentClassificationNames.length > 0) {
      if (currentHierarchicalCategories.length > 0) {
        const [soleClassification] = currentHierarchicalCategories
        const classificationNodeId = generateNodeId({
          classification: soleClassification.classificationName,
          classificationType: ClassificationType.Hierarchical,
          type: 'classification',
        })
        setSelected([classificationNodeId])
      } else if (currentSimpleCategories.length > 0) {
        const [soleClassification] = currentSimpleCategories
        const classificationNodeId = generateNodeId({
          classification: soleClassification.classificationName,
          classificationType: ClassificationType.Simple,
          type: 'classification',
        })
        setSelected([classificationNodeId])
      }
    }
  }, [
    setSelected,
    currentClassificationNames,
    currentHierarchicalCategories,
    currentSimpleCategories,
  ])
  const selectAllVisibleCategories = useCallback(() => {
    let targetClassification: Classification<Item> | undefined
    if (currentClassificationNames.length > 0) {
      targetClassification = classifications.find(
        ({ name }) => name === currentClassificationNames[0]
      )!
    } else if (selectedHollowClassifications.length > 0) {
      targetClassification = classifications.find(
        ({ name }) => name === selectedHollowClassifications[0]
      )!
    }
    if (targetClassification !== undefined) {
      if (targetClassification.type === ClassificationType.Simple) {
        const { categories } = getDisplayedSimpleClassification(targetClassification)
        const classificationNodeId = generateNodeId({
          classificationType: ClassificationType.Simple,
          type: 'classification',
          classification: targetClassification.name,
        })
        setExpanded([classificationNodeId])
        setSelected(categories.map(({ nodeId }) => nodeId))
      } else {
        const { leafCategories, branchCategories } = getDisplayedHierarchicalClassification(
          targetClassification
        )
        const classificationNodeId = generateNodeId({
          classificationType: ClassificationType.Hierarchical,
          type: 'classification',
          classification: targetClassification.name,
        })
        const expandedCategories = branchCategories.map(({ nodeId }) => nodeId)
        setExpanded([...expandedCategories, classificationNodeId])
        setSelected(leafCategories.map(({ nodeId }) => nodeId))
      }
    }
  }, [classifications, currentClassificationNames, selectedHollowClassifications])
  return {
    selected,
    setSelected,
    expanded,
    setExpanded,
    clearSelectedCategories,
    selectAllVisibleCategories,
    filteredItems,
    filteredItemsWithColorAndGrouping,
  }
}
