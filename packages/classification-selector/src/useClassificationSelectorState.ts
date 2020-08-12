import { useState, useMemo, useEffect } from 'react'
import _uniq from 'lodash/uniq'
import { ClassificationType, Classification, Predicate, HierarchicalClassification } from './types'
import { parseNodeId, generateNodeId } from './Utils'
import usePrevious from './usePrevious'
import useAdditivePredicates from './useAdditivePredicates'

type CurrentGrouping =
  | undefined
  | {
      type: ClassificationType.Simple
      name: string
    }
  | {
      type: ClassificationType.Hierarchical
      name: string
      level: number
    }

const parseSelectedNodeIds = (selected: string[]) => {
  const classificationNames: string[] = []
  const hierarchicalCategories: { name: string; level: number; classification: string }[] = []
  const simpleCategories: { name: string; classification: string }[] = []
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
  return [uniqClassifications, hierarchicalCategories, simpleCategories] as const
}

interface Inputs<Item> {
  classifications: Classification<Item>[]
  items: Item[]
}
export default <Item>({ classifications, items }: Inputs<Item>) => {
  const [selected, setSelected] = useState<string[]>([])
  const [filteredItems, setPredicates] = useAdditivePredicates(items)

  const [
    currentClassificationNames,
    currentHierarchicalCategories,
    currentSimpleCategoryNames,
  ] = useMemo(() => parseSelectedNodeIds(selected), [selected])
  const previousSelected = usePrevious(selected)
  if (previousSelected !== undefined && currentClassificationNames.length > 1) {
    const [prevClassificationNames] = parseSelectedNodeIds(previousSelected)
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
  useEffect(() => {
    const [
      uniqClassifications,
      currHierarchicalCategories,
      currentSimpleCategories,
    ] = parseSelectedNodeIds(selected)

    if (uniqClassifications.length > 1) {
      throw new Error(
        `There should be at most one classification selected. Received ${uniqClassifications.join(
          ', '
        )} instead`
      )
    } else if (
      uniqClassifications.length === 1 &&
      (currHierarchicalCategories.length > 0 || currentSimpleCategories.length > 0)
    ) {
      const [classificationName] = uniqClassifications
      const classification = classifications.find(({ name }) => name === classificationName)!
      const predicates: Predicate<Item>[] = []
      if (classification.type === ClassificationType.Simple) {
        const { getFilterPredicate } = classification
        for (const { name: categoryName } of currentSimpleCategoryNames) {
          predicates.push(getFilterPredicate(categoryName))
        }
      } else if (classification.type === ClassificationType.Hierarchical) {
        const { getFilterPredicate } = classification
        for (const { name, level } of currHierarchicalCategories) {
          predicates.push(getFilterPredicate(name, level))
        }
      }
      setPredicates(predicates)
    }
  }, [selected, classifications, currentSimpleCategoryNames, setPredicates])
  const hierarchicalClassifications = classifications.filter(
    elem => elem.type === ClassificationType.Hierarchical
  ) as HierarchicalClassification<Item>[]
  const initialHierarchicalLevels = Object.fromEntries(
    hierarchicalClassifications.map(elem => [elem.name, 1] as const)
  )
  const [hierarchicalLevels, setHierarchicalLevels] = useState<{
    [classification: string]: number
  }>(initialHierarchicalLevels)

  let currentGrouping: CurrentGrouping
  if (currentClassificationNames.length === 0) {
    currentGrouping = undefined
  } else if (currentHierarchicalCategories.length > 0) {
    const [soleCategory] = currentHierarchicalCategories
    currentGrouping = {
      type: ClassificationType.Hierarchical,
      name: soleCategory.classification,
      level: hierarchicalLevels[soleCategory.classification],
    }
  } else if (currentSimpleCategoryNames.length > 0) {
    const [soleName] = currentSimpleCategoryNames
    currentGrouping = {
      type: ClassificationType.Simple,
      name: soleName.classification,
    }
  } else {
    throw new Error('This code path should not be possible.')
  }

  return {
    filteredItems,
    selected,
    setSelected,
    hierarchicalLevels,
    setHierarchicalLevels,
    currentGrouping,
  }
}
