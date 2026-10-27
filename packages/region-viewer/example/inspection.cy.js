const plot = label => cy.get(`svg[aria-label="${label} plot"]`)
const readout = label => cy.get(`[aria-label="${label} readout"]`)
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

const cursor = label => plot(label).parent('[data-region-cursor]').find('svg[aria-hidden="true"]')
const positionBadge = label =>
  plot(label).parent('[data-region-cursor]').find('[data-genomic-position]')

describe('floating value readouts', () => {
  beforeEach(() => cy.visit('/'))

  it('shows one source coordinate above its value and transfers it at the same base', () => {
    inspect('Coverage', 251)
    positionBadge('Coverage').should('have.text', 'Position: 251')
    positionBadge('Score').should('not.exist')
    positionBadge('Coverage').then($coordinate => {
      const coordinate = $coordinate[0].getBoundingClientRect()
      plot('Coverage')
        .parent()
        .find('[data-value-readout]')
        .should($value => {
          expect($value[0].getBoundingClientRect().top).to.be.closeTo(coordinate.bottom + 4, 0.1)
        })
    })
    inspect('Score', 251)
    positionBadge('Score').should('have.text', 'Position: 251')
    positionBadge('Coverage').should('not.exist')
    cy.get('[aria-label="Shared inspection viewer"] [data-genomic-position]').should(
      'have.length',
      1
    )
    plot('Score').trigger('pointerout', { eventConstructor: 'PointerEvent', relatedTarget: null })
    cy.get('[aria-label="Shared inspection viewer"] [data-genomic-position]').should('not.exist')
  })

  it('supports coordinate-only, value-only, and coordinate opt-out participation', () => {
    cy.get('#Coverage-controls-readout').uncheck()
    inspect('Coverage', 251)
    positionBadge('Coverage').should('have.text', 'Position: 251')
    readout('Coverage').should('not.exist')
    cy.get('#Coverage-controls-genomicPosition').uncheck()
    inspect('Coverage', 251)
    positionBadge('Coverage').should('not.exist')
    plot('Coverage').parent().find('[data-region-readout]').should('not.exist')
    cursor('Coverage').should('exist')
    inspect('Histogram', 251)
    positionBadge('Histogram').should('not.exist')
    readout('Histogram').should('contain.text', 'Bin 251 to 260: 10')
    cy.get('[aria-label="Shared inspection viewer"] [data-genomic-position]').should('not.exist')
    inspect('Annotations', 251)
    positionBadge('Annotations').should('have.text', 'Position: 251')
    plot('Annotations').parent().find('[data-value-readout]').should('not.exist')
    readout('Score').should('contain.text', '0.45')
    readout('Histogram').should('contain.text', 'Bin 251 to 260: 10')
    cursor('Annotations').should('exist')
  })

  it('reports independent values, including zero and missing data, inside pointer-transparent plots', () => {
    inspect('Coverage', 250.8)
    readout('Coverage').should('contain.text', '38 ×')
    readout('Score').should('contain.text', '0.45')
    plot('Coverage').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      readout('Coverage')
        .closest('[data-region-readout]')
        .should($readout => {
          const bubble = $readout[0].getBoundingClientRect()
          expect(bubble.top).to.be.at.least(bounds.top)
          expect(bubble.left).to.be.at.least(bounds.left)
          expect(bubble.right).to.be.at.most(bounds.right)
          expect(bubble.bottom).to.be.at.most(bounds.bottom)
          expect($readout.css('pointer-events')).to.equal('none')
        })
    })
    inspect('Score', 50)
    readout('Coverage').should('contain.text', '0 ×')
    inspect('Coverage', 230)
    readout('Coverage').should('contain.text', 'No data')
    inspect('Score', 270)
    readout('Score').should('contain.text', 'No data')
    plot('Score').trigger('pointerout', { eventConstructor: 'PointerEvent', relatedTarget: null })
    readout('Coverage').should('not.exist')
  })

  it('keeps preset readouts inside the plot at either edge and honors vertical placement', () => {
    cy.get('#readout-y').select('bottom')
    inspect('Score', 300)
    plot('Score').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      readout('Score')
        .closest('[data-region-readout]')
        .should($readout => {
          const bubble = $readout[0].getBoundingClientRect()
          expect(bubble.right).to.be.at.most(bounds.right)
          expect(bubble.bottom).to.be.closeTo(bounds.bottom - 8, 0.1)
        })
    })
    inspect('Score', 1)
    plot('Score').then($plot => {
      readout('Score')
        .closest('[data-region-readout]')
        .should($readout => {
          expect($readout[0].getBoundingClientRect().left).to.be.closeTo(
            $plot[0].getBoundingClientRect().left + 8,
            0.1
          )
        })
    })
    cy.get('#readout-y').select('middle')
    inspect('Score', 251)
    plot('Score').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      readout('Score')
        .closest('[data-region-readout]')
        .should($readout => {
          const bubble = $readout[0].getBoundingClientRect()
          expect(bubble.top + bubble.height / 2).to.be.closeTo(bounds.top + bounds.height / 2, 0.1)
        })
    })
  })

  it('remeasures values after font changes without another pointer movement', () => {
    inspect('Coverage', 251)
    readout('Coverage').children().should('have.css', 'font-size', '11px')
    positionBadge('Coverage').children().invoke('css', 'font-size').as('coordinateFont')
    cy.window().then(win => {
      const input = win.document.getElementById('value-font-size')
      const setValue = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value').set
      setValue.call(input, '15')
      input.dispatchEvent(new win.Event('input', { bubbles: true }))
    })
    readout('Coverage').children().should('have.css', 'font-size', '15px')
    readout('Score').children().should('have.css', 'font-size', '15px')
    readout('Histogram').children().should('have.css', 'font-size', '15px')
    cy.get('@coordinateFont').then(fontSize => {
      positionBadge('Coverage').children().should('have.css', 'font-size', fontSize)
    })
    plot('Coverage').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      readout('Coverage')
        .closest('[data-region-readout]')
        .should($readout => {
          const bubble = $readout[0].getBoundingClientRect()
          expect(bubble.bottom).to.be.at.most(bounds.bottom)
          expect(bubble.right).to.be.at.most(bounds.right)
        })
    })
  })

  it('renders custom values and can hide values without stopping hover publication', () => {
    cy.get('#custom-content').check()
    inspect('Score', 251)
    readout('Score').should('contain.text', '0.45 normalized score')
    cy.get('#Score-controls-cursor').uncheck()
    inspect('Score', 50)
    cursor('Score').should('not.exist')
    cursor('Coverage').should('exist')
    readout('Score').should('contain.text', '0.81 normalized score')
    cy.get('#Score-controls-readout').uncheck()
    inspect('Score', 251)
    readout('Score').should('not.exist')
    readout('Coverage').should('contain.text', '38 ×')
  })
})
