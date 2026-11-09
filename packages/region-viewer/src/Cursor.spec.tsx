import { describe, expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/dom'
import React from 'react'

import { Cursor } from './Cursor'
import { RegionViewer } from './RegionViewer'
import { Track } from './Track'
import { dispatchPointer, mockElementRects, setupTestRoot } from './testUtils'

describe('Cursor', () => {
  describe('interaction', () => {
    const testRoot = setupTestRoot()

    // The plot spans clientX 100-200: bases 1-5, then 10-14.
    const move = (target: Element, clientX: number) =>
      dispatchPointer(target, 'pointermove', { clientX })
    const enter = (target: Element, clientX: number) =>
      dispatchPointer(target, 'pointerover', { clientX, relatedTarget: null })
    const leave = (target: Element) =>
      dispatchPointer(target, 'pointerout', { relatedTarget: null })
    const click = (target: Element, clientX: number) => fireEvent.click(target, { clientX })

    const renderInteractiveCursor = () => {
      mockElementRects(() => ({ left: 100, width: 100, height: 50 }))
      const onClick = jest.fn()
      const onChildClick = jest.fn()
      const renderMarker = (x: number) => {
        return <rect data-testid="cursor-marker" x={x} width={1} height="100%" />
      }

      testRoot.mount(
        <RegionViewer
          leftPanelWidth={100}
          rightPanelWidth={160}
          width={360}
          regions={[
            { start: 1, stop: 5 },
            { start: 10, stop: 14 }
          ]}
        >
          <Track
            renderLeftPanel={() => {
              return <span>Left panel</span>
            }}
            renderRightPanel={() => {
              return <span>Right panel</span>
            }}
          >
            {() => {
              return (
                <Cursor onClick={onClick} renderCursor={renderMarker}>
                  <div data-testid="plot">
                    <button type="button" onClick={onChildClick}>
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={event => {
                        event.stopPropagation()
                        onChildClick()
                      }}
                    >
                      Isolated details
                    </button>
                  </div>
                </Cursor>
              )
            }}
          </Track>
        </RegionViewer>
      )

      return { plot: screen.getByTestId('plot'), onClick, onChildClick }
    }

    test('passes plot-local pixel X to the custom cursor renderer', () => {
      const { plot } = renderInteractiveCursor()

      expect(screen.queryByTestId('cursor-marker')).toBeNull()
      move(plot, 170)

      expect(screen.getByTestId('cursor-marker').getAttribute('x')).toBe('70')
    })

    test('shows the custom cursor when entering the plot', () => {
      const { plot } = renderInteractiveCursor()

      enter(plot, 170)

      expect(screen.getByTestId('cursor-marker').getAttribute('x')).toBe('70')
    })

    test('draws the cursor at plot X=0, and a click there selects base 1', () => {
      const { plot, onClick } = renderInteractiveCursor()
      move(plot, 100)

      expect(screen.getByTestId('cursor-marker').getAttribute('x')).toBe('0')
      click(plot, 100)
      expect(onClick.mock.calls).toEqual([[1]])
    })

    test('converts the hovered position across disjoint regions on every click', () => {
      const { plot, onClick } = renderInteractiveCursor()
      move(plot, 170)

      click(plot, 170)
      click(plot, 170)

      expect(onClick.mock.calls).toEqual([[12], [12]])
    })

    test('updates the rendered cursor and selected base when the pointer moves', () => {
      const { plot, onClick } = renderInteractiveCursor()
      move(plot, 170)
      move(plot, 120)

      expect(screen.getByTestId('cursor-marker').getAttribute('x')).toBe('20')
      click(plot, 120)
      expect(onClick.mock.calls).toEqual([[3]])
    })

    test.each([
      ['Left panel', 99],
      ['Right panel', 201]
    ])('clears the cursor and prevents selection over %s', (panel, clientX) => {
      const { plot, onClick } = renderInteractiveCursor()
      move(plot, 170)
      expect(screen.queryByTestId('cursor-marker')).not.toBeNull()
      const sidePanel = screen.getByText(panel)

      leave(plot)
      move(sidePanel, clientX)
      click(sidePanel, clientX)

      expect(screen.queryByTestId('cursor-marker')).toBeNull()
      expect(onClick).not.toHaveBeenCalled()
    })

    test('clears the cursor after leaving', () => {
      const { plot } = renderInteractiveCursor()
      move(plot, 170)
      expect(screen.queryByTestId('cursor-marker')).not.toBeNull()

      leave(plot)

      expect(screen.queryByTestId('cursor-marker')).toBeNull()
    })

    test('preserves child click handling and background selection', () => {
      const { plot, onClick, onChildClick } = renderInteractiveCursor()
      move(plot, 170)

      click(screen.getByRole('button', { name: 'Details' }), 170)

      expect(onChildClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls).toEqual([[12]])
    })

    test('lets a child stop propagation to prevent background selection', () => {
      const { plot, onClick, onChildClick } = renderInteractiveCursor()
      move(plot, 170)

      click(screen.getByRole('button', { name: 'Isolated details' }), 170)

      expect(onChildClick).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })

    test('selects the base under the click, not the last hover', () => {
      const { plot, onClick } = renderInteractiveCursor()
      move(plot, 170)

      click(plot, 120)

      expect(onClick.mock.calls).toEqual([[3]])
    })

    test('selects on a click with no prior hover', () => {
      const { plot, onClick } = renderInteractiveCursor()

      click(plot, 170)

      expect(onClick.mock.calls).toEqual([[12]])
    })

    test('a touch tap selects the tapped base without drawing a hover cursor', () => {
      const { plot, onClick } = renderInteractiveCursor()

      dispatchPointer(plot, 'pointermove', { clientX: 170, pointerType: 'touch' })
      click(plot, 170)

      expect(screen.queryByTestId('cursor-marker')).toBeNull()
      expect(onClick.mock.calls).toEqual([[12]])
    })
  })
})
