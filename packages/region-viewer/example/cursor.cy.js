const plot = label => cy.get(`svg[aria-label="${label} plot"]`)
const cursor = label => plot(label).parent('[data-region-cursor]').find('svg[aria-hidden="true"]')

const inspect = (label, position) => {
  const offset = position <= 100 ? position - 1 : 100 + position - 201
  plot(label).then($plot => {
    const bounds = $plot[0].getBoundingClientRect()
    plot(label).trigger('pointermove', {
      eventConstructor: 'PointerEvent',
      pointerType: 'mouse',
      clientX: bounds.left + (offset / 200) * bounds.width,
      clientY: bounds.top + 40
    })
  })
}

describe('plot-scoped synchronized cursors', () => {
  beforeEach(() => cy.visit('/'))

  it('snaps mirrored lines to a displayed base without crossing track panels', () => {
    inspect('Coverage', 250.8)
    plot('Coverage').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      cursor('Coverage').should($overlay => {
        const overlay = $overlay[0].getBoundingClientRect()
        expect(overlay.top).to.be.closeTo(bounds.top, 0.1)
        expect(overlay.height).to.be.closeTo(bounds.height, 0.1)
      })
      ;['Coverage', 'Score'].forEach(label => {
        cursor(label)
          .find('line')
          .should($line => {
            expect($line.attr('stroke-width')).to.equal('2')
            expect($line[0].getBoundingClientRect().left).to.be.closeTo(
              bounds.left + bounds.width * 0.75,
              0.1
            )
          })
      })
    })
    cursor('Independent').should('not.exist')
    plot('Coverage').trigger('pointerout', {
      eventConstructor: 'PointerEvent',
      relatedTarget: null
    })
    cursor('Coverage').should('not.exist')
    cursor('Score').should('not.exist')
  })

  it('preserves native detail clicks without selecting the background again', () => {
    inspect('Coverage', 251)
    plot('Coverage').then($plot => plot('Coverage').click($plot.width() * 0.75, 40))
    cy.get('output[aria-label="Last selected base"]').should('have.text', '251')
    cy.get('a[aria-label="Open coverage details"]').click()
    cy.get('output[aria-label="Opened details"]').should('have.text', 'Coverage')
    cy.get('output[aria-label="Last selected base"]').should('have.text', '251')
  })

  it('keeps publication independent of displaying the source line', () => {
    cy.get('#Coverage-controls-cursor').uncheck()
    inspect('Coverage', 251)
    cursor('Coverage').should('not.exist')
    cursor('Score').should('exist')
    cy.get('#Coverage-controls-publish').uncheck()
    cursor('Score').should('not.exist')
    inspect('Coverage', 50)
    cursor('Score').should('not.exist')
    inspect('Score', 50)
    cursor('Score').should('exist')
  })

  it('keeps zoom cleared through stationary pointer re-entry until actual movement', () => {
    inspect('Coverage', 251)
    cursor('Score').should('exist')
    cy.get('#zoom-regions').check()
    cursor('Score').should('not.exist')
    plot('Coverage').trigger('pointerover', {
      eventConstructor: 'PointerEvent',
      pointerType: 'mouse',
      relatedTarget: null
    })
    cursor('Score').should('not.exist')
    plot('Coverage').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      plot('Coverage').trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        pointerType: 'mouse',
        clientX: bounds.left + bounds.width / 2,
        clientY: bounds.top + 40
      })
    })
    cursor('Score').should('exist')
  })
})
