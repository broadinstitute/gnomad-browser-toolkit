import React, { useState, useEffect } from 'react'
import TreeView from '@material-ui/lab/TreeView'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import TreeItem from '@material-ui/lab/TreeItem'
import _partition from 'lodash/partition'
import _last from 'lodash/last'
import _groupBy from 'lodash/groupBy'
import _sumBy from 'lodash/sumBy'
import { Box, Button } from '@material-ui/core'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import _maxBy from 'lodash/maxBy'
import _range from 'lodash/range'
import _uniq from 'lodash/uniq'
import { StandardLonghandProperties } from 'csstype'
import usePrevious from './usePrevious'
import {
  Classification,
  Predicate,
  ClassificationType,
  HierarchicalClassification,
  SimpleClassification,
} from './types'
import { generateNodeId, parseNodeId } from './Utils'
import 'fontsource-roboto'

const {
  categoryTreeItemCypressDataAttr,
  classificationTreeItemCypressDataAttr,
  levelSelectorCypressDataAttr,
  levelSelectorItemCypressDataAttr,
  selectAllCypressDataAttr,
  selectNoneCypressDataAttr,
} = require('./cypressTestDataAttrs.json')

interface MakeStyleProps {
  categoryListMaxHeight: StandardLonghandProperties['maxHeight']
}
const useMaterialStyles = makeStyles<Theme, MakeStyleProps>(theme =>
  createStyles({
    levelSelector: {
      width: theme.spacing(5),
    },
    categoryList: {
      maxHeight: ({ categoryListMaxHeight }) => categoryListMaxHeight,
      overflowY: 'auto',
    },
  })
)

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

function getSimpleClassificationCategoryElems<Item>(
  { name: classificationName, categories }: SimpleClassification<Item>,
  categoryListClassName: string
) {
  const classificationNodeId = generateNodeId({
    type: 'classification',
    classificationType: ClassificationType.Simple,
    classification: classificationName,
  })
  const categoryElems = categories.map(({ name: categoryName, itemCount }) => {
    const nodeId = generateNodeId({
      type: 'category',
      classificationType: ClassificationType.Simple,
      classification: classificationName,
      category: categoryName,
    })
    const reactElem = (
      <TreeItem
        key={categoryName}
        nodeId={nodeId}
        data-cy={categoryTreeItemCypressDataAttr}
        label={`${categoryName} (${itemCount})`}
      />
    )
    return {
      nodeId,
      reactElem,
    }
  })
  const categoryReactElems = categoryElems.map(({ reactElem }) => reactElem)
  const categoryNodeIds = categoryElems.map(({ nodeId }) => nodeId)

  const reactElem = (
    <TreeItem
      key={classificationNodeId}
      data-cy={classificationTreeItemCypressDataAttr}
      nodeId={classificationNodeId}
      label={classificationName}
      classes={{ group: categoryListClassName }}
    >
      {categoryReactElems}
    </TreeItem>
  )
  return [reactElem, categoryNodeIds] as const
}

function getHierarchicalCategoryElems<Item>(args: {
  classification: HierarchicalClassification<Item>
  hierarchicalLevel: number
  levelSelectorContainerClassName: string
  setHierarchicalLevel: (level: number) => void
  categoryListClassName: string
}) {
  const {
    classification: { name: classificationName, categories },
    hierarchicalLevel,
    levelSelectorContainerClassName,
    setHierarchicalLevel,
    categoryListClassName,
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
  const categoryNodeIds: string[] = []
  const categoryReactElems: React.ReactElement<unknown>[] = []
  lessDetailedThanCurrentLevel.forEach(({ path, itemCount }, categoryIndex) => {
    const categoryName = _last(path)!
    const nodeId = generateNodeId({
      type: 'category',
      classificationType: ClassificationType.Hierarchical,
      classification: classificationName,
      category: categoryName,
      level: path.length,
    })
    const reactElem = (
      <TreeItem
        key={`less-detailed-${categoryIndex}`}
        nodeId={nodeId}
        data-cy={categoryTreeItemCypressDataAttr}
        label={`${categoryName} (${itemCount})`}
      />
    )
    categoryNodeIds.push(nodeId)
    categoryReactElems.push(reactElem)
  })
  const groupedByCurrentLevel = _groupBy(
    atLeastAsDetailedAsCurrentLevel,
    ({ path }) => path[hierarchicalLevel - 1]
  )
  Object.entries(groupedByCurrentLevel).forEach(
    ([categoryName, categoriesInLevel], categoryIndex) => {
      const nodeId = generateNodeId({
        type: 'category',
        classificationType: ClassificationType.Hierarchical,
        classification: classificationName,
        category: categoryName,
        level: hierarchicalLevel,
      })
      const itemCountInLevel = _sumBy(categoriesInLevel, ({ itemCount }) => itemCount)
      const reactElem = (
        <TreeItem
          key={`more-detailed-${categoryIndex}`}
          nodeId={nodeId}
          data-cy={categoryTreeItemCypressDataAttr}
          label={`${categoryName} (${itemCountInLevel})`}
        />
      )
      categoryNodeIds.push(nodeId)
      categoryReactElems.push(reactElem)
    }
  )

  const dropdownLabelId = `label-classification-${classificationName}`
  const dropdownItems = _range(maxHierarchicalLevel).map(level => (
    <MenuItem value={level + 1} key={level} data-cy={levelSelectorItemCypressDataAttr}>
      {level + 1}
    </MenuItem>
  ))
  const reactElem = (
    <TreeItem
      key={classificationNodeId}
      data-cy={classificationTreeItemCypressDataAttr}
      nodeId={classificationNodeId}
      classes={{ group: categoryListClassName }}
      label={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>{classificationName}</Box>
          <FormControl
            className={levelSelectorContainerClassName}
            onClick={e => e.stopPropagation()}
          >
            <InputLabel id={dropdownLabelId}>Level</InputLabel>
            <Select
              labelId={dropdownLabelId}
              value={hierarchicalLevel}
              data-cy={levelSelectorCypressDataAttr}
              onChange={event => setHierarchicalLevel(event.target.value as number)}
            >
              {dropdownItems}
            </Select>
          </FormControl>
        </Box>
      }
    >
      {categoryReactElems}
    </TreeItem>
  )
  return [reactElem, categoryNodeIds] as const
}

export interface Props<Item> {
  classifications: Classification<Item>[]
  setFilterPredicates: (predicates: Predicate<Item>[]) => void
  // How tall the category list is allowed to get (because the list can be very long):
  categoryListMaxHeight?: MakeStyleProps['categoryListMaxHeight']
}
function ClassificationViewer<Item>({
  classifications,
  setFilterPredicates,
  categoryListMaxHeight,
}: Props<Item>) {
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>([])
  const previousSelected = usePrevious(selected)

  const [
    currentClassificationNames,
    currentHierarchicalCategories,
    currentSimpleCategoryNames,
  ] = parseSelectedNodeIds(selected)
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

  const handleToggle = (_e: React.ChangeEvent<unknown>, nodeIds: string[]) => setExpanded(nodeIds)
  const handleSelect = (_e: React.ChangeEvent<unknown>, nodeIds: string[]) => setSelected(nodeIds)

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
      setFilterPredicates(predicates)
    }
  }, [selected, classifications, currentSimpleCategoryNames, setFilterPredicates])

  const hierarchicalClassifications = classifications.filter(
    elem => elem.type === ClassificationType.Hierarchical
  ) as HierarchicalClassification<Item>[]
  const initialHierarchicalLevels = Object.fromEntries(
    hierarchicalClassifications.map(elem => [elem.name, 1] as const)
  )
  const [hierarchicalLevels, setHierarchicalLevels] = useState<{
    [classification: string]: number
  }>(initialHierarchicalLevels)

  const materialClasses = useMaterialStyles({ categoryListMaxHeight })

  const classificationElems = classifications.map(classification => {
    if (classification.type === ClassificationType.Simple) {
      const [reactElem] = getSimpleClassificationCategoryElems<Item>(
        classification,
        materialClasses.categoryList
      )
      return reactElem
    }
    const [reactElem] = getHierarchicalCategoryElems<Item>({
      classification,
      hierarchicalLevel: hierarchicalLevels[classification.name],
      levelSelectorContainerClassName: materialClasses.levelSelector,
      setHierarchicalLevel: (value: number) =>
        setHierarchicalLevels({
          ...hierarchicalLevels,
          [classification.name]: value,
        }),
      categoryListClassName: materialClasses.categoryList,
    })
    return reactElem
  })
  return (
    <>
      <TreeView
        multiSelect
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
      >
        {classificationElems}
      </TreeView>
      <Box>
        <Button variant="outlined" size="small" data-cy={selectAllCypressDataAttr}>
          Select All
        </Button>
        <Button variant="outlined" size="small" data-cy={selectNoneCypressDataAttr}>
          Select None
        </Button>
      </Box>
    </>
  )
}

export default ClassificationViewer
