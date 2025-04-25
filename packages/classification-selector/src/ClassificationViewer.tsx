import React from 'react'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem as BaseTreeItem, TreeItemProps, TreeItemContent } from '@mui/x-tree-view/TreeItem'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Button from '@mui/material/Button'
import type * as CSS from 'csstype'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline'
import { Classification, ClassificationType } from './types'
import {
  getDisplayedHierarchicalClassification,
  getDisplayedSimpleClassification,
  DisplayedHierarchicalCategory,
} from './Utils'
import useInternalState from './useClassificationSelectorState'
import styled from '@emotion/styled'

import {
  categoryTreeItemCypressDataAttr,
  classificationTreeItemCypressDataAttr,
  selectAllCypressDataAttr,
  selectNoneCypressDataAttr,
} from './cypressTestDataAttrs.json'

type CategoryListMaxHeight = CSS.StandardLonghandProperties['maxHeight']
type CategoryListTreeItemProps = {
  maxheight?: CategoryListMaxHeight
}

/* Older versions of the TreeItem component had no padding-top or padding-bottom. More recent versions do have them, so here we override those properties, to stay consistent with the old layout. */
const UnpaddedTreeItemContent = styled(TreeItemContent)`
  padding-top: 0;
  padding-bottom: 0;
`

const TreeItem = (inputProps: TreeItemProps) => {
  const inputSlots = inputProps.slots || {}
  const slots = { ...inputSlots, content: UnpaddedTreeItemContent }
  const props = { ...inputProps, slots }
  return <BaseTreeItem {...props} />
}

const CategoryListTreeItem = styled(TreeItem)(({ maxheight }: CategoryListTreeItemProps) => ({
  maxHeight: maxheight === undefined ? 'none' : maxheight,
  overflowY: 'auto',
}))

const displayedHierarchicalCategoryToReactElem = (category: DisplayedHierarchicalCategory) => {
  const { nodeId } = category
  const displayedLabel = `${category.name} (${category.itemCount})`
  if (category.hasChildren === true) {
    const children = category.children.map(elem => displayedHierarchicalCategoryToReactElem(elem))
    return (
      <TreeItem
        itemId={nodeId}
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
      itemId={nodeId}
      key={nodeId}
      data-cy={categoryTreeItemCypressDataAttr}
      label={displayedLabel}
      slots={{ icon: FiberManualRecordIcon }}
      slotProps={{ icon: { style: { color: category.color } } }}
    />
  )
}

type ExternallyControlledState = ReturnType<typeof useInternalState>

export interface Props<Item> {
  classifications: Classification<Item>[]
  // How tall the category list is allowed to get (because the list can be very long):
  categoryListMaxHeight?: CategoryListMaxHeight
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

  const classificationElems = classifications.map(classification => {
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
          itemId={nodeId}
          data-cy={categoryTreeItemCypressDataAttr}
          label={displayedLabel}
          slots={{ icon: FiberManualRecordIcon }}
          slotProps={{ icon: { style: { color } } }}
        />
      ))
      result = (
        <CategoryListTreeItem
          key={classificationNodeId}
          data-cy={classificationTreeItemCypressDataAttr}
          itemId={classificationNodeId}
          label={classificationName}
          maxheight={categoryListMaxHeight}
        >
          {categoryElems}
        </CategoryListTreeItem>
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
        <CategoryListTreeItem
          key={classificationNodeId}
          data-cy={classificationTreeItemCypressDataAttr}
          itemId={classificationNodeId}
          label={classificationName}
          maxheight={categoryListMaxHeight}
        >
          {categoryElems}
        </CategoryListTreeItem>
      )
    }
    return result
  })
  return (
    <>
      <ScopedCssBaseline>
        <SimpleTreeView
          multiSelect
          expandedItems={expanded}
          selectedItems={selected}
          onExpandedItemsChange={handleToggle}
          onSelectedItemsChange={handleSelect}
          slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
        >
          {classificationElems}
        </SimpleTreeView>
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
