import { describe, expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/dom'
import React from 'react'
import { createRoot } from 'react-dom/client'

import { Cursor } from './Cursor'
import { RegionViewer } from './RegionViewer'
import { Track } from './Track'
import { mockElementRects, setupTestRoot } from './testUtils'

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

describe('Cursor', () => {
  const renderCursor = (x: number) => (
    <rect
      x={x - 20}
      y={0}
      width={40}
      height="90%"
      fill="orange"
      stroke="purple"
      strokeDasharray="2, 3"
      strokeWidth={7}
    />
  )

  const regions = [
    { start: 91, stop: 109 },
    { start: 191, stop: 209 },
    { start: 321, stop: 381 }
  ]

  test('has no unexpected changes', async () => {
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(
      <RegionViewer leftPanelWidth={130} rightPanelWidth={320} width={800} regions={regions}>
        <Cursor onClick={() => {}} renderCursor={renderCursor}>
          <div>some cursor child content goes here</div>
        </Cursor>
      </RegionViewer>
    )
    await flushPromises()
    expect(container).toMatchSnapshot()
  })

  describe('interaction', () => {
    const testRoot = setupTestRoot()

    // The whole 360px viewer: left panel 0-100, plot 100-200 (bases 1-5 then 10-14), right panel 200-360.
    const move = (target: Element, clientX: number) => fireEvent.mouseMove(target, { clientX })
    const enter = (target: Element, clientX: number) => fireEvent.mouseOver(target, { clientX })
    const leave = (target: Element) => fireEvent.mouseOut(target)
    const click = (target: Element, clientX: number) => fireEvent.click(target, { clientX })

    const renderInteractiveCursor = () => {
      mockElementRects(() => ({ left: 0, width: 360, height: 50 }))
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
          <Cursor onClick={onClick} renderCursor={renderMarker}>
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
                )
              }}
            </Track>
          </Cursor>
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

    test('does not draw the cursor at plot X=0, though a click there selects base 1', () => {
      const { plot, onClick } = renderInteractiveCursor()
      move(plot, 100)

      expect(screen.queryByTestId('cursor-marker')).toBeNull()
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

      move(sidePanel, clientX)
      click(sidePanel, clientX)

      expect(screen.queryByTestId('cursor-marker')).toBeNull()
      expect(onClick).not.toHaveBeenCalled()
    })

    test('clears the cursor and prevents stale selection after leaving', () => {
      const { plot, onClick } = renderInteractiveCursor()
      move(plot, 170)
      expect(screen.queryByTestId('cursor-marker')).not.toBeNull()

      leave(plot)
      click(plot, 170)

      expect(screen.queryByTestId('cursor-marker')).toBeNull()
      expect(onClick).not.toHaveBeenCalled()
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

    test('selects the last local hover rather than the click event coordinate', () => {
      const { plot, onClick } = renderInteractiveCursor()
      move(plot, 170)

      click(plot, 180)

      expect(onClick.mock.calls).toEqual([[12]])
    })

    test('does not select before a local hover', () => {
      const { plot, onClick } = renderInteractiveCursor()

      click(plot, 170)

      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
