const {
  classificationTreeItemCypressDataAttr,
  levelSelectorCypressDataAttr,
  levelSelectorItemCypressDataAttr,
  selectedItemsContainerCypressDataAttr,
  numFilteredItemsCypressDataAttr,
  categoryTreeItemCypressDataAttr,
  selectAllCypressDataAttr,
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
  it('Select a single category at level 1', () => {
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('hierarchical classification')
        .click()
      cy.get('@classification').contains('category 1-1--1 (2)').as('target-category')
      cy.get('@classification').contains('category 1-1--2 (7)')
      cy.get('@classification').contains('category 2-1--1 (1)')

      cy.get('@target-category').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('2')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item a')
        cy.contains('item g')
      })
    })
  })

  it('Select a single category at level 2', () => {
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('hierarchical classification')
        .click()
      cy.get(attr(levelSelectorCypressDataAttr)).click()
      cy.get(attr(levelSelectorItemCypressDataAttr)).contains('2').click()
      cy.get('@classification').contains('category 1-1--1 (2)')
      cy.get('@classification').contains('category 1-2--1 (2)').as('target-category-1')
      cy.get('@classification').contains('category 1-2--2 (2)')
      cy.get('@classification').contains('category 1-2--3 (3)').as('target-category-2')
      cy.get('@classification').contains('category 2-2--1 (1)')

      cy.get('@target-category-1').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('2')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item b')
        cy.contains('item h')
      })

      cy.get('@target-category-2').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('3')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item d')
        cy.contains('item e')
        cy.contains('item j')
      })
    })
  })

  it('Select a single category at level 3', () => {
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('hierarchical classification')
        .click()
      cy.get(attr(levelSelectorCypressDataAttr)).click()
      cy.get(attr(levelSelectorItemCypressDataAttr)).contains('3').click()
      cy.get('@classification').contains('category 1-1--1 (2)')
      cy.get('@classification').contains('category 1-2--1 (2)')
      cy.get('@classification').contains('category 1-2--2 (2)')
      cy.get('@classification').contains('category 1-3--1 (2)')
      cy.get('@classification').contains('category 1-3--2 (1)')
      cy.get('@classification').contains('category 2-3--2 (1)').as('target-category')

      cy.get('@target-category').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('1')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item f')
      })
    })
  })

  it('Select a single category at level 4', () => {
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('hierarchical classification')
        .click()
      cy.get(attr(levelSelectorCypressDataAttr)).click()
      cy.get(attr(levelSelectorItemCypressDataAttr)).contains('4').click()
      cy.get('@classification').contains('category 1-1--1 (2)').as('target-category')
      cy.get('@classification').contains('category 1-2--1 (2)')
      cy.get('@classification').contains('category 1-2--2 (2)')
      cy.get('@classification').contains('category 1-3--1 (2)')
      cy.get('@classification').contains('category 1-3--2 (1)')
      cy.get('@classification').contains('category 2-4--1 (1)')

      cy.get('@target-category').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('2')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item a')
        cy.contains('item g')
      })
    })
  })

  it('Select multiple catgories at level 2', () => {
    cy.get('body').as('body')
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr))
        .as('classification')
        .contains('hierarchical classification')
        .click()
      cy.get(attr(levelSelectorCypressDataAttr)).click()
      cy.get(attr(levelSelectorItemCypressDataAttr)).contains('2').click()
      cy.get('@classification').contains('category 1-1--1 (2)')
      cy.get('@classification').contains('category 1-2--1 (2)').as('target-category-1')
      cy.get('@classification').contains('category 1-2--2 (2)')
      cy.get('@classification').contains('category 1-2--3 (3)').as('target-category-2')
      cy.get('@classification').contains('category 2-2--1 (1)')

      cy.get('@target-category-1').click()
      cy.get('@body').type('{meta}', { release: false })
      cy.get('@target-category-2').click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('5')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
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
  beforeEach(() => {
    cy.visit('?path=/story/select-all-or-none-simple-clasifications')
  })
  it('select all without any classification expanded should not show any selected items', () => {
    cy.getIframeBody().within(() => {
      cy.get(attr(selectAllCypressDataAttr)).click()
    })
  })
  it.skip('select all with a simple classification expanded should show all available items', () => {
    cy.getIframeBody().within(() => {
      cy.get(attr(classificationTreeItemCypressDataAttr)).contains('simple classification').click()
      cy.get(attr(selectAllCypressDataAttr)).click()

      cy.get(attr(numFilteredItemsCypressDataAttr)).contains('3')
      cy.get(attr(selectedItemsContainerCypressDataAttr)).within(() => {
        cy.contains('item a')
        cy.contains('item b')
        cy.contains('item c')
      })
    })
  })
})
