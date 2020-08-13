import React, { useState } from 'react'
import TreeView from '@material-ui/lab/TreeView'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import TreeItem from '@material-ui/lab/TreeItem'
import { Box, Button } from '@material-ui/core'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import _range from 'lodash/range'
import { StandardLonghandProperties } from 'csstype'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline'
import { Classification, ClassificationType } from './types'
import { getDisplayedHierarchicalClassification, getDisplayedSimpleClassification } from './Utils'
import useInternalState from './useClassificationSelectorState'
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

type ExternallyControlledState = ReturnType<typeof useInternalState>

export interface Props<Item> {
  classifications: Classification<Item>[]
  // How tall the category list is allowed to get (because the list can be very long):
  categoryListMaxHeight?: MakeStyleProps['categoryListMaxHeight']
  selected: ExternallyControlledState['selected']
  setSelected: ExternallyControlledState['setSelected']
  hierarchicalLevels: ExternallyControlledState['hierarchicalLevels']
  setHierarchicalLevel: ExternallyControlledState['setHierarchicalLevel']
}

function ClassificationViewer<Item>({
  selected,
  setSelected,
  hierarchicalLevels,
  setHierarchicalLevel,
  classifications,
  categoryListMaxHeight,
}: Props<Item>) {
  const [expanded, setExpanded] = useState<string[]>([])

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
      const hierarchicalLevel = hierarchicalLevels[classification.name]
      const {
        name: classificationName,
        nodeId: classificationNodeId,
        maxHierarchicalLevel,
        categories,
      } = getDisplayedHierarchicalClassification({
        classification,
        hierarchicalLevel,
      })
      const categoryElems = categories.map(({ nodeId, displayedLabel, color }) => (
        <TreeItem
          nodeId={nodeId}
          key={nodeId}
          data-cy={categoryTreeItemCypressDataAttr}
          label={displayedLabel}
          icon={<FiberManualRecordIcon style={{ color }} />}
        />
      ))
      const dropdownLabelId = `label-classification-${classificationName}`
      const dropdownItems = _range(maxHierarchicalLevel).map(level => (
        <MenuItem value={level + 1} key={level} data-cy={levelSelectorItemCypressDataAttr}>
          {level + 1}
        </MenuItem>
      ))
      result = (
        <TreeItem
          key={classificationNodeId}
          data-cy={classificationTreeItemCypressDataAttr}
          nodeId={classificationNodeId}
          classes={{ group: categoryListClassName }}
          label={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>{classificationName}</Box>
              <FormControl
                className={materialClasses.levelSelector}
                onClick={e => e.stopPropagation()}
              >
                <InputLabel id={dropdownLabelId}>Level</InputLabel>
                <Select
                  labelId={dropdownLabelId}
                  value={hierarchicalLevel}
                  data-cy={levelSelectorCypressDataAttr}
                  onChange={event =>
                    setHierarchicalLevel(classification.name, event.target.value as number)
                  }
                >
                  {dropdownItems}
                </Select>
              </FormControl>
            </Box>
          }
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
