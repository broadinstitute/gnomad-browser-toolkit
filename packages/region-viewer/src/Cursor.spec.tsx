import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { fireEvent as domFireEvent, screen } from '@testing-library/dom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

import { Cursor } from './Cursor'
import { RegionViewer } from './RegionViewer'
import { Track } from './Track'

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
    let root: ReturnType<typeof createRoot>
    let host: HTMLDivElement
    const previousActEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT')

    const fireEvent = {
      mouseMove(target: Element, coordinates: { clientX: number }) {
        act(() => {
          domFireEvent(target, new MouseEvent('pointermove', { ...coordinates, bubbles: true }))
        })
      },
      click(target: Element, coordinates: { clientX: number }) {
        act(() => {
          domFireEvent.click(target, coordinates)
        })
      },
      mouseLeave(target: Element) {
        act(() => {
          domFireEvent(target, new MouseEvent('pointerout', { bubbles: true, relatedTarget: null }))
        })
      },
      mouseEnter(target: Element, coordinates: { clientX: number }) {
        act(() => {
          domFireEvent(
            target,
            new MouseEvent('pointerover', { ...coordinates, bubbles: true, relatedTarget: null })
          )
        })
      }
    }

    beforeEach(() => {
      Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        x: 100,
        y: 0,
        left: 100,
        top: 0,
        right: 200,
        bottom: 50,
        width: 100,
        height: 50,
        toJSON: () => ({})
      })
    })

    afterEach(() => {
      act(() => {
        root.unmount()
      })
      host.remove()
      Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', previousActEnvironment)
      jest.restoreAllMocks()
    })

    const renderInteractiveCursor = () => {
      const onClick = jest.fn()
      const onChildClick = jest.fn()
      const renderMarker = (x: number) => {
        return <rect data-testid="cursor-marker" x={x} width={1} height="100%" />
      }

      host = document.createElement('div')
      document.body.appendChild(host)
      root = createRoot(host)
      act(() => {
        root.render(
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
      })

      return { plot: screen.getByTestId('plot'), onClick, onChildClick }
    }

    test('passes plot-local pixel X to the custom cursor renderer', () => {
      const { plot } = renderInteractiveCursor()

      expect(screen.queryByTestId('cursor-marker')).toBeNull()
      fireEvent.mouseMove(plot, { clientX: 170 })

      expect(screen.getByTestId('cursor-marker').getAttribute('x')).toBe('70')
    })

    test('shows the custom cursor when entering the plot', () => {
      const { plot } = renderInteractiveCursor()

      fireEvent.mouseEnter(plot, { clientX: 170 })

      expect(screen.getByTestId('cursor-marker').getAttribute('x')).toBe('70')
    })

    test('converts the hovered position across disjoint regions on every click', () => {
      const { plot, onClick } = renderInteractiveCursor()
      fireEvent.mouseMove(plot, { clientX: 170 })

      fireEvent.click(plot, { clientX: 170 })
      fireEvent.click(plot, { clientX: 170 })

      expect(onClick.mock.calls).toEqual([[12], [12]])
    })

    test('updates the rendered cursor and selected base when the pointer moves', () => {
      const { plot, onClick } = renderInteractiveCursor()
      fireEvent.mouseMove(plot, { clientX: 170 })
      fireEvent.mouseMove(plot, { clientX: 120 })

      expect(screen.getByTestId('cursor-marker').getAttribute('x')).toBe('20')
      fireEvent.click(plot, { clientX: 120 })
      expect(onClick.mock.calls).toEqual([[3]])
    })

    test.each([
      ['Left panel', 99],
      ['Right panel', 201]
    ])('clears the cursor and prevents selection over %s', (panel, clientX) => {
      const { plot, onClick } = renderInteractiveCursor()
      fireEvent.mouseMove(plot, { clientX: 170 })
      expect(screen.queryByTestId('cursor-marker')).not.toBeNull()
      const sidePanel = screen.getByText(panel)

      fireEvent.mouseLeave(plot)
      fireEvent.mouseMove(sidePanel, { clientX })
      fireEvent.click(sidePanel, { clientX })

      expect(screen.queryByTestId('cursor-marker')).toBeNull()
      expect(onClick).not.toHaveBeenCalled()
    })

    test('clears the cursor and prevents stale selection after leaving', () => {
      const { plot, onClick } = renderInteractiveCursor()
      fireEvent.mouseMove(plot, { clientX: 170 })
      expect(screen.queryByTestId('cursor-marker')).not.toBeNull()

      fireEvent.mouseLeave(plot)
      fireEvent.click(plot, { clientX: 170 })

      expect(screen.queryByTestId('cursor-marker')).toBeNull()
      expect(onClick).not.toHaveBeenCalled()
    })

    test('preserves child click handling and background selection', () => {
      const { plot, onClick, onChildClick } = renderInteractiveCursor()
      fireEvent.mouseMove(plot, { clientX: 170 })

      fireEvent.click(screen.getByRole('button', { name: 'Details' }), { clientX: 170 })

      expect(onChildClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls).toEqual([[12]])
    })

    test('lets a child stop propagation to prevent background selection', () => {
      const { plot, onClick, onChildClick } = renderInteractiveCursor()
      fireEvent.mouseMove(plot, { clientX: 170 })

      fireEvent.click(screen.getByRole('button', { name: 'Isolated details' }), {
        clientX: 170
      })

      expect(onChildClick).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })

    test('selects the last local hover rather than the click event coordinate', () => {
      const { plot, onClick } = renderInteractiveCursor()
      fireEvent.mouseMove(plot, { clientX: 170 })

      fireEvent.click(plot, { clientX: 180 })

      expect(onClick.mock.calls).toEqual([[12]])
    })

    test('does not select before a local hover', () => {
      const { plot, onClick } = renderInteractiveCursor()

      fireEvent.click(plot, { clientX: 170 })

      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
