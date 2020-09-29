const {
  classificationTreeItemCypressDataAttr,
  selectedItemsContainerCypressDataAttr,
  numFilteredItemsCypressDataAttr,
  categoryTreeItemCypressDataAttr,
  selectAllCypressDataAttr,
  selectNoneCypressDataAttr,
} = require('../../src/cypressTestDataAttrs.json')

const attr = attrString => `[data-cy=${attrString}]`

describe('Simple classification', () => {
  beforeEach(() => {
    cy.visit('?path=/story/classification-viewer--simple-classification')
  })
  it('Select a single category', () => {
    cy.getIframeBody().within(() => {
      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('10')

      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('simple classification')
        .click()
      cy.get('@classification').contains('simple category 1 (5)').as('category-1')
      cy.get('@classification').contains('simple category 2 (3)')
      cy.get('@classification').contains('simple category 3 (2)')

      cy.get('@category-1').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('5')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item a')
        cy.contains('item b')
        cy.contains('item c')
        cy.contains('item f')
        cy.contains('item i')
      })
    })
  })

  it('Select multiple categories', () => {
    cy.get('body').as('body')
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('simple classification')
        .click()
      cy.get('@classification').contains('simple category 1 (5)').as('category-1')
      cy.get('@classification').contains('simple category 2 (3)')
      cy.get('@classification').contains('simple category 3 (2)').as('category-3')

      cy.get('@body').type('{meta}', { release: false })
      cy.get('@category-1').click()
      cy.get('@category-3').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('7')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item a')
        cy.contains('item b')
        cy.contains('item c')
        cy.contains('item e')
        cy.contains('item f')
        cy.contains('item h')
        cy.contains('item i')
      })
    })
  })
})

describe('Hierarchical classification', () => {
  beforeEach(() => {
    cy.visit('?path=/story/classification-viewer--hierarchical-classification')
  })
  it('Progressively expand and select single categories', () => {
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('hierarchical classification')
        .click()
      cy.get('@classification').contains('category 1-1--1 (2)')
      cy.get('@classification').contains('category 1-1--2 (8)')
      cy.get('@classification').contains('category 2-1--1 (1)')
      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('10')

      cy.get('@classification').contains('category 1-1--2 (8)').click()
      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('8')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item a')
        cy.contains('item b')
        cy.contains('item c')
        cy.contains('item d')
        cy.contains('item e')
        cy.contains('item h')
        cy.contains('item i')
        cy.contains('item j')
      })

      cy.get('@classification').contains('category 1-2--3 (3)').click()
      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('3')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item d')
        cy.contains('item e')
        cy.contains('item j')
      })

      cy.get('@classification').contains('category 1-3--1 (2)').click()
      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('2')

      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item d')
        cy.contains('item j')
      })

      cy.get('@classification').contains('category 1-2--3 (3)').click()
      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('3')

      cy.get('@classification').contains('category 1-1--2 (8)').click()
      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('8')
    })
  })

  it('Select multiple catgories at level 2', () => {
    cy.get('body').as('body')
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('hierarchical classification')
        .click()

      cy.get('@classification').contains('category 1-1--2 (8)').click()
      cy.get('@classification').contains('category 1-2--1 (3)').click()
      cy.get('@body').type('{meta}', { release: false })
      cy.get('@classification').contains('category 1-2--3 (3)').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('6')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item a')
        cy.contains('item b')
        cy.contains('item d')
        cy.contains('item e')
        cy.contains('item h')
        cy.contains('item j')
      })
    })
  })
})

describe('multiple classifications', () => {
  beforeEach(() => {
    cy.visit('?path=/story/classification-viewer--multiple-classifications')
  })
  it('should not allow categories across different classifications to be selected', () => {
    cy.get('body').as('body')

    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr)).contains('simple classification').click()
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .contains('hierarchical classification')
        .click()

      cy.get(attr(classificationTreeItemCypressDataAttr)).contains('simple category 1 (5)').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('5')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item a')
        cy.contains('item b')
        cy.contains('item c')
        cy.contains('item f')
        cy.contains('item i')
      })

      cy.get('@body').type('{meta}', { release: false })

      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 1-1--1 (2)').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('2')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item a')
        cy.contains('item g')
      })
    })
  })
})

describe('select all/none', () => {
  it('expanding a simple classification, then selecting a category, then "select all" then "select none" should show the same result', () => {
    cy.visit('?path=/story/classification-viewer--select-all-or-none-simple-classification')
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('simple classification')
        .click()
      cy.get('@classification').contains('simple category 2 (3)').click()
      cy.get(attr(selectAllCypressDataAttr)).click()
      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('3')
      cy.get(attr(selectNoneCypressDataAttr)).click()
      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('3')
    })
  })

  it('clicking "select all" while a hierarchical classification is selected should expand all categories in that classification', () => {
    cy.visit(
      '?path=/story/classification-viewer--select-all-or-select-none-hierarchical-classification'
    )
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('hierarchical classification')
        .click()
      cy.get(attr(selectAllCypressDataAttr)).click()
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 1-1--1').should('be.visible')
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 1-1--2').should('be.visible')
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 1-2--1').should('be.visible')
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 1-2--2').should('be.visible')
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 1-2--3').should('be.visible')
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 1-3--1').should('be.visible')
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 1-3--2').should('be.visible')
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 2-1--1').should('be.visible')
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 2-2--1').should('be.visible')
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 2-3--2').should('be.visible')
      cy.get(attr(categoryTreeItemCypressDataAttr)).contains('category 2-4--1').should('be.visible')
    })
  })
})
