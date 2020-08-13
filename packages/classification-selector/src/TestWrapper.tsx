import React from 'react'
import { Grid, Typography, ThemeProvider, createMuiTheme, Container } from '@material-ui/core'
import ClassificationViewer, { Props as ClassificationViewerProps } from './ClassificationViewer'
import useInternalState from './useClassificationSelectorState'

const cypressTestDataAttrs = require('./cypressTestDataAttrs.json')

const {
  selectedItemsContainerCypressDataAttr,
  numFilteredItemsCypressDataAttr,
} = cypressTestDataAttrs

const theme = createMuiTheme()
interface TestItem {
  name: string
}

interface Props<Item extends TestItem>
  extends Omit<ClassificationViewerProps<Item>, 'setFilterPredicates'> {
  items: Item[]
}
function TestWrapper<Item extends TestItem>({ items, classifications }: Props<Item>) {
  const {
    filteredItems,
    selected,
    setSelected,
    hierarchicalLevels,
    setHierarchicalLevel,
  } = useInternalState({ items, classifications })

  const filteredElems = filteredItems.map(elem => (
    <Typography align="center" key={elem.name}>
      {elem.name}
    </Typography>
  ))
  return (
    <>
      <ThemeProvider theme={theme}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <ClassificationViewer
              classifications={classifications}
              selected={selected}
              setSelected={setSelected}
              hierarchicalLevels={hierarchicalLevels}
              setHierarchicalLevel={setHierarchicalLevel}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h5" align="center">
              Selected items:
              <span data-cy={numFilteredItemsCypressDataAttr}>{filteredItems.length}</span>
            </Typography>
            <Container data-cy={selectedItemsContainerCypressDataAttr}>{filteredElems}</Container>
          </Grid>
        </Grid>
      </ThemeProvider>
    </>
  )
}

export default TestWrapper
