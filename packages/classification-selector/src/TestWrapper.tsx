import React from 'react'
import ClassificationViewer, { Props as ClassificationViewerProps } from './ClassificationViewer'
import {
  Grid,
  Typography,
  ThemeProvider,
  createMuiTheme,
  CssBaseline,
  Container,
} from '@material-ui/core'
import useAdditivePredicates from './useAdditivePredicates'

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
  const [filtered, setPredicates] = useAdditivePredicates(items)
  const filteredElems = filtered.map((elem, index) => (
    <Typography align="center" key={index}>
      {elem.name}
    </Typography>
  ))
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Grid container={true} spacing={1}>
          <Grid item={true} xs={6}>
            <ClassificationViewer
              setFilterPredicates={setPredicates}
              classifications={classifications}
            />
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h5" align="center">
              Selected items:
              <span data-cy={numFilteredItemsCypressDataAttr}>{filtered.length}</span>
            </Typography>
            <Container data-cy={selectedItemsContainerCypressDataAttr}>{filteredElems}</Container>
          </Grid>
        </Grid>
      </ThemeProvider>
    </>
  )
}

export default TestWrapper
