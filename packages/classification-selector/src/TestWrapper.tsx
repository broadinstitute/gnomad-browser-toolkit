import React from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import ClassificationViewer, { Props as ClassificationViewerProps } from './ClassificationViewer'
import useInternalState from './useClassificationSelectorState'

import cypressTestDataAttrs from './cypressTestDataAttrs.json'

const {
  selectedItemsContainerCypressDataAttr,
  numFilteredItemsCypressDataAttr
} = cypressTestDataAttrs

interface TestItem {
  name: string
}

interface Props<Item extends TestItem>
  extends Omit<ClassificationViewerProps<Item>, 'setFilterPredicates'> {
  items: Item[]
  shouldAutoExpandFirstClassification: boolean
}
function TestWrapper<Item extends TestItem>({
  items,
  classifications,
  shouldAutoExpandFirstClassification
}: Props<Item>) {
  const {
    filteredItems,
    selected,
    setSelected,
    expanded,
    setExpanded,
    clearSelectedCategories,
    selectAllVisibleCategories
  } = useInternalState({ items, classifications, shouldAutoExpandFirstClassification })

  const filteredElems = filteredItems.map(elem => (
    <Typography align="center" key={elem.name}>
      {elem.name}
    </Typography>
  ))
  return (
    <>
      <Grid container spacing={1}>
        <Grid size={{ xs: 6 }}>
          <ClassificationViewer
            clearSelectedCategories={clearSelectedCategories}
            selectAllVisibleCategories={selectAllVisibleCategories}
            classifications={classifications}
            selected={selected}
            setSelected={setSelected}
            expanded={expanded}
            setExpanded={setExpanded}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography variant="h5" align="center">
            Selected items:
            <span data-cy={numFilteredItemsCypressDataAttr}>{filteredItems.length}</span>
          </Typography>
          <Container data-cy={selectedItemsContainerCypressDataAttr}>{filteredElems}</Container>
        </Grid>
      </Grid>
    </>
  )
}

export default TestWrapper
