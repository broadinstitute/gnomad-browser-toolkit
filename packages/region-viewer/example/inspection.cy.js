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

describe('synchronized cursor example in a real browser', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('aligns mirrored lines with the nearest base and confines them to each plot', () => {
    inspect('Coverage', 250.8)
    positionBadge('Coverage').should('have.text', 'Position: 251')
    readout('Coverage').should('contain.text', '38 ×')
    readout('Score').should('contain.text', '0.45')

    plot('Coverage').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      plot('Coverage')
        .find('rect')
        .should($bars => {
          const widths = Array.from($bars, bar => Number(bar.getAttribute('width')))
          expect(Math.max(...widths)).to.be.closeTo(bounds.width / 200, 0.1)
          expect($bars[0].hasAttribute('rx')).to.equal(false)
          expect($bars[0].getAttribute('shape-rendering')).to.equal('crispEdges')
        })
      plot('Coverage')
        .parent()
        .find('[data-region-readout]')
        .should($readout => {
          const bubble = $readout[0].getBoundingClientRect()
          expect(bubble.top).to.be.at.least(bounds.top)
          expect(bubble.left).to.be.at.least(bounds.left)
          expect(bubble.right).to.be.at.most(bounds.right)
          expect(bubble.bottom).to.be.at.most(bounds.bottom)
          expect($readout.css('pointer-events')).to.equal('none')
        })
      cursor('Coverage').find('line').should('have.attr', 'stroke-width', '2')
      cursor('Coverage').should($overlay => {
        const overlay = $overlay[0].getBoundingClientRect()
        expect(overlay.top).to.be.closeTo(bounds.top, 0.1)
        expect(overlay.height).to.be.closeTo(bounds.height, 0.1)
      })
      cursor('Score')
        .find('line')
        .should($line => {
          expect($line[0].getBoundingClientRect().left).to.be.closeTo(
            bounds.left + bounds.width * 0.75,
            0.1
          )
        })
    })

    inspect('Score', 50)
    readout('Coverage').should('contain.text', '0 ×')
    readout('Score').should('contain.text', '0.81')
    inspect('Coverage', 230)
    readout('Coverage').should('contain.text', 'No data')
    readout('Score').should('contain.text', '0.45')
    inspect('Score', 270)
    readout('Coverage').should('contain.text', '36 ×')
    readout('Score').should('contain.text', 'No data')
    plot('Score').trigger('pointerout', { eventConstructor: 'PointerEvent', relatedTarget: null })
    cursor('Coverage').should('not.exist')
    cursor('Score').should('not.exist')
    readout('Coverage').should('not.exist')
  })

  it('shows one coordinate on the hovered track and transfers it at the same genomic base', () => {
    inspect('Coverage', 251)
    positionBadge('Coverage').should('have.text', 'Position: 251')
    positionBadge('Score').should('not.exist')
    positionBadge('Histogram').should('not.exist')
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

  it('can show only the coordinate badge or opt out while keeping the hover line', () => {
    cy.get('#Coverage-controls-readout').uncheck()
    inspect('Coverage', 251)
    positionBadge('Coverage').should('have.text', 'Position: 251')
    readout('Coverage').should('not.exist')
    cy.get('#Coverage-controls-genomicPosition').uncheck()
    inspect('Coverage', 251)
    positionBadge('Coverage').should('not.exist')
    plot('Coverage').parent().find('[data-region-readout]').should('not.exist')
    cursor('Coverage').should('exist')
  })

  it('keeps preset readouts inside the plot at either edge and honors vertical placement', () => {
    cy.get('#readout-y').select('bottom')
    inspect('Score', 300)
    plot('Score').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      plot('Score')
        .parent()
        .find('[data-region-readout]')
        .should($readout => {
          const bubble = $readout[0].getBoundingClientRect()
          expect(bubble.right).to.be.at.most(bounds.right)
          expect(bubble.bottom).to.be.closeTo(bounds.bottom - 8, 0.1)
        })
    })
    inspect('Score', 1)
    plot('Score').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      plot('Score')
        .parent()
        .find('[data-region-readout]')
        .should($readout => {
          expect($readout[0].getBoundingClientRect().left).to.be.closeTo(bounds.left + 8, 0.1)
        })
    })
    cy.get('#readout-y').select('middle')
    inspect('Score', 251)
    plot('Score').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      plot('Score')
        .parent()
        .find('[data-region-readout]')
        .should($readout => {
          const bubble = $readout[0].getBoundingClientRect()
          expect(bubble.top + bubble.height / 2).to.be.closeTo(bounds.top + bounds.height / 2, 0.1)
        })
    })
  })

  it('keeps coverage reporters above the curve for nonzero and zero values, as source and follower', () => {
    const expectAboveCoverage = position => {
      plot('Coverage')
        .find(`rect[data-position="${position}"]`)
        .then($bar => {
          const barTop = $bar[0].getBoundingClientRect().top
          readout('Coverage')
            .closest('[data-region-readout]')
            .should($readout => {
              expect($readout[0].getBoundingClientRect().bottom).to.be.closeTo(barTop - 8, 0.1)
            })
        })
    }
    inspect('Coverage', 251)
    readout('Coverage').should('contain.text', '38 ×')
    expectAboveCoverage(251)
    inspect('Coverage', 50)
    readout('Coverage').should('contain.text', '0 ×')
    expectAboveCoverage(50)
    inspect('Score', 251)
    positionBadge('Coverage').should('not.exist')
    expectAboveCoverage(251)
    inspect('Coverage', 230)
    readout('Coverage').should('contain.text', 'No data')
  })

  it('tunes value font sizes independently of the coordinate badge and preserves curve placement', () => {
    inspect('Coverage', 251)
    readout('Coverage').children().should('have.css', 'font-size', '11px')
    positionBadge('Coverage')
      .children()
      .then($coordinate => {
        const coordinateFont = $coordinate.css('font-size')
        cy.window().then(win => {
          const input = win.document.getElementById('value-font-size')
          const setValue = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value')
            .set
          setValue.call(input, '15')
          input.dispatchEvent(new win.Event('input', { bubbles: true }))
        })
        readout('Coverage').children().should('have.css', 'font-size', '15px')
        readout('Score').children().should('have.css', 'font-size', '15px')
        readout('Histogram').children().should('have.css', 'font-size', '15px')
        positionBadge('Coverage').children().should('have.css', 'font-size', coordinateFont)
      })
    plot('Coverage')
      .find('rect[data-position="251"]')
      .then($bar => {
        const barTop = $bar[0].getBoundingClientRect().top
        readout('Coverage')
          .closest('[data-region-readout]')
          .should($group => {
            expect($group[0].getBoundingClientRect().bottom).to.be.closeTo(barTop - 8, 0.1)
          })
      })
  })

  it('places the histogram value above the hovered bin, including taller and zero-count bins', () => {
    const expectAboveBin = start => {
      plot('Histogram')
        .find(`rect[data-bin-start="${start}"]`)
        .then($bar => {
          const barTop = $bar[0].getBoundingClientRect().top
          const strokeRadius = parseFloat(getComputedStyle($bar[0]).strokeWidth) / 2
          readout('Histogram')
            .closest('[data-region-readout]')
            .should($readout => {
              const bubble = $readout[0].getBoundingClientRect()
              expect(bubble.bottom).to.be.closeTo(barTop - 8, strokeRadius + 0.1)
            })
        })
    }
    inspect('Histogram', 251)
    readout('Histogram').should('contain.text', 'Bin 251 to 260: 10')
    positionBadge('Histogram').should('not.exist')
    cy.get('[aria-label="Shared inspection viewer"] [data-genomic-position]').should('not.exist')
    expectAboveBin(251)
    inspect('Histogram', 265)
    readout('Histogram').should('contain.text', 'Bin 261 to 270: 22')
    expectAboveBin(261)
    inspect('Histogram', 61)
    readout('Histogram').should('contain.text', 'Bin 61 to 70: 0')
    expectAboveBin(61)
  })

  it('lets a coordinate-only track publish and mirror the cursor without supplying values', () => {
    inspect('Annotations', 251)
    readout('Coverage').should('contain.text', '38 ×')
    positionBadge('Annotations').should('have.text', 'Position: 251')
    cy.get('[aria-label="Shared inspection viewer"] [data-genomic-position]').should(
      'have.length',
      1
    )
    readout('Score').should('contain.text', '0.45')
    readout('Histogram').should('contain.text', 'Bin 251 to 260: 10')
    plot('Annotations').parent().find('[data-value-readout]').should('not.exist')
    plot('Annotations').then($plot => {
      const bounds = $plot[0].getBoundingClientRect()
      const trackNames = ['Coverage', 'Score', 'Histogram', 'Annotations']
      trackNames.forEach(label => {
        cursor(label)
          .find('line')
          .should($line => {
            expect($line[0].getBoundingClientRect().left).to.be.closeTo(
              bounds.left + bounds.width * 0.75,
              0.1
            )
          })
      })
    })
    inspect('Coverage', 50)
    plot('Annotations').then($plot => {
      cursor('Annotations')
        .find('line')
        .should($line => {
          expect(Number($line.attr('x1'))).to.be.closeTo(($plot.width() * 49) / 200, 0.1)
        })
    })
    positionBadge('Annotations').should('not.exist')
    plot('Annotations').parent().find('[data-value-readout]').should('not.exist')
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

  it('disables inspection without removing the plot or blocking the other track', () => {
    cy.get('#Coverage-controls-enabled').uncheck()
    inspect('Score', 251)
    plot('Coverage').should('be.visible')
    readout('Coverage').should('not.exist')
    cursor('Coverage').should('not.exist')
    readout('Score').should('contain.text', '0.45')
    cy.get('#Score-controls-publish').uncheck()
    inspect('Score', 50)
    readout('Score').should('not.exist')
  })
})
