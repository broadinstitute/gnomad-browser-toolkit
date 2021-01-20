import React from 'react'
import TreeView from '@material-ui/lab/TreeView'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import TreeItem from '@material-ui/lab/TreeItem'
import Button from '@material-ui/core/Button'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { StandardLonghandProperties } from 'csstype'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline'
import { Classification, ClassificationType } from './types'
import {
  getDisplayedHierarchicalClassification,
  getDisplayedSimpleClassification,
  DisplayedHierarchicalCategory,
} from './Utils'
import useInternalState from './useClassificationSelectorState'
import 'fontsource-roboto'

const {
  categoryTreeItemCypressDataAttr,
  classificationTreeItemCypressDataAttr,
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

const displayedHierarchicalCategoryToReactElem = (category: DisplayedHierarchicalCategory) => {
  const { nodeId } = category
  const displayedLabel = `${category.name} (${category.itemCount})`
  if (category.hasChildren === true) {
    const children = category.children.map(elem => displayedHierarchicalCategoryToReactElem(elem))
    return (
      <TreeItem
        nodeId={nodeId}
        key={nodeId}
        data-cy={categoryTreeItemCypressDataAttr}
        label={displayedLabel}
      >
        {children}
      </TreeItem>
    )
  }
  return (
    <TreeItem
      nodeId={nodeId}
      key={nodeId}
      data-cy={categoryTreeItemCypressDataAttr}
      label={displayedLabel}
      icon={<FiberManualRecordIcon style={{ color: category.color }} />}
    />
  )
}

type ExternallyControlledState = ReturnType<typeof useInternalState>

export interface Props<Item> {
  classifications: Classification<Item>[]
  // How tall the category list is allowed to get (because the list can be very long):
  categoryListMaxHeight?: MakeStyleProps['categoryListMaxHeight']
  selected: ExternallyControlledState['selected']
  setSelected: ExternallyControlledState['setSelected']
  expanded: ExternallyControlledState['expanded']
  setExpanded: ExternallyControlledState['setExpanded']
  clearSelectedCategories: () => void
  selectAllVisibleCategories: () => void
}

function ClassificationViewer<Item>({
  expanded,
  setExpanded,
  selected,
  setSelected,
  classifications,
  categoryListMaxHeight,
  clearSelectedCategories,
  selectAllVisibleCategories,
}: Props<Item>) {
  const handleToggle = (_e: React.ChangeEvent<unknown>, nodeIds: string[]) => setExpanded(nodeIds)
  const handleSelect = (_e: React.ChangeEvent<unknown>, nodeIds: string[]) => setSelected(nodeIds)

  const materialClasses = useMaterialStyles({ categoryListMaxHeight })

  const classificationElems = classifications.map(classification => {
    const categoryListClassName = materialClasses.categoryList
    let result: React.ReactNode
    if (classification.type === ClassificationType.Simple) {
      const {
        name: classificationName,
        nodeId: classificationNodeId,
        categories,
      } = getDisplayedSimpleClassification(classification)
      const categoryElems = categories.map(({ nodeId, color, displayedLabel }) => (
        <TreeItem
          key={nodeId}
          nodeId={nodeId}
          data-cy={categoryTreeItemCypressDataAttr}
          label={displayedLabel}
          icon={<FiberManualRecordIcon style={{ color }} />}
        />
      ))
      result = (
        <TreeItem
          key={classificationNodeId}
          data-cy={classificationTreeItemCypressDataAttr}
          nodeId={classificationNodeId}
          label={classificationName}
          classes={{ group: categoryListClassName }}
        >
          {categoryElems}
        </TreeItem>
      )
    } else {
      const {
        name: classificationName,
        nodeId: classificationNodeId,
        categories,
      } = getDisplayedHierarchicalClassification(classification)
      const categoryElems = categories.map(category =>
        displayedHierarchicalCategoryToReactElem(category)
      )

      result = (
        <TreeItem
          key={classificationNodeId}
          data-cy={classificationTreeItemCypressDataAttr}
          nodeId={classificationNodeId}
          classes={{ group: categoryListClassName }}
          label={classificationName}
        >
          {categoryElems}
        </TreeItem>
      )
    }
    return result
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
        <div>
          <Button
            variant="outlined"
            size="small"
            data-cy={selectAllCypressDataAttr}
            onClick={selectAllVisibleCategories}
          >
            Select All
          </Button>
          <Button
            variant="outlined"
            size="small"
            data-cy={selectNoneCypressDataAttr}
            onClick={clearSelectedCategories}
          >
            Select None
          </Button>
        </div>
      </ScopedCssBaseline>
    </>
  )
}

export default ClassificationViewer
