import React, { useState } from 'react'
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
import { StandardLonghandProperties } from 'csstype'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import {
  Classification,
  Predicate,
  ClassificationType,
  HierarchicalClassification,
  SimpleClassification,
} from './types'
import { generateNodeId } from './Utils'
import useInternalState from './useClassificationSelectorState'
import 'fontsource-roboto'
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';

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

function getSimpleClassificationCategoryElems<Item>(
  { name: classificationName, categories }: SimpleClassification<Item>,
  categoryListClassName: string
) {
  const classificationNodeId = generateNodeId({
    type: 'classification',
    classificationType: ClassificationType.Simple,
    classification: classificationName,
  })
  const categoryElems = categories.map(({ name: categoryName, itemCount, color }) => {
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
        icon={<FiberManualRecordIcon style={{ color }} />}
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
  lessDetailedThanCurrentLevel.forEach(({ path, itemCount, color }, categoryIndex) => {
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
        icon={<FiberManualRecordIcon style={{ color }} />}
      />
    )
    categoryNodeIds.push(nodeId)
    categoryReactElems.push(reactElem)
  })
  const groupedByCurrentLevel = _groupBy(
    atLeastAsDetailedAsCurrentLevel,
    ({ path }) => path.slice(0, hierarchicalLevel).join("$-$")
  )
  Object.values(groupedByCurrentLevel).forEach(
    (categoriesInLevel, categoryIndex) => {
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
      const color = firstCategoryInLevel.color
      const reactElem = (
        <TreeItem
          key={`more-detailed-${categoryIndex}`}
          nodeId={nodeId}
          data-cy={categoryTreeItemCypressDataAttr}
          label={`${categoryName} (${itemCountInLevel})`}
          icon={<FiberManualRecordIcon style={{ color}} />}
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

type ExternallyControlledState = ReturnType<typeof useInternalState>

export interface Props<Item> {
  classifications: Classification<Item>[]
  // How tall the category list is allowed to get (because the list can be very long):
  categoryListMaxHeight?: MakeStyleProps['categoryListMaxHeight']
  selected: ExternallyControlledState["selected"]
  setSelected: ExternallyControlledState["setSelected"]
  hierarchicalLevels: ExternallyControlledState["hierarchicalLevels"]
  setHierarchicalLevels: ExternallyControlledState["setHierarchicalLevels"]
}

function ClassificationViewer<Item>({
  selected, setSelected, hierarchicalLevels, setHierarchicalLevels, classifications, categoryListMaxHeight
}: Props<Item>) {

  const [expanded, setExpanded] = useState<string[]>([])

  const handleToggle = (_e: React.ChangeEvent<unknown>, nodeIds: string[]) => setExpanded(nodeIds)
  const handleSelect = (_e: React.ChangeEvent<unknown>, nodeIds: string[]) => setSelected(nodeIds)

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
      <ScopedCssBaseline>
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
      </ScopedCssBaseline>
    </>
  )
}

export default ClassificationViewer
