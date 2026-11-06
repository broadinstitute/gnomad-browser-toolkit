import { afterEach, beforeEach, describe, expect, test } from '@jest/globals'
import { screen } from '@testing-library/dom'
import React, { act } from 'react'

import {
  Cursor,
  DEFAULT_READOUT_BACKGROUND_COLOR,
  DEFAULT_READOUT_BORDER_COLOR,
  PositionReadoutPlacement,
  PositionReadoutY
} from './Cursor'
import { ReadoutValue } from './ReadoutValue'
import { RegionViewer } from './RegionViewer'
import { Track, TrackPositionInspection } from './Track'
import { dispatchPointer, mockElementRects, setupTestRoot } from './testUtils'

const REGIONS = [{ start: 1, stop: 200 }]

const ReadoutTrack = ({
  y,
  inspection
}: {
  y?: PositionReadoutY
  inspection?: TrackPositionInspection
}) => {
  return (
    <RegionViewer width={200} leftPanelWidth={0} rightPanelWidth={0} regions={REGIONS}>
      <Track
        positionInspection={{
          readoutY: y,
          renderReadout: () => <ReadoutValue label="Coverage" value={32} unit="×" />,
          ...inspection
        }}
      >
        {() => <div data-testid="plot">Plot</div>}
      </Track>
    </RegionViewer>
  )
}

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = []

  callback: () => void

  constructor(callback: () => void) {
    this.callback = callback
    FakeResizeObserver.instances.push(this)
  }

  observe = () => {}

  disconnect = () => {}
}

describe('readouts beside the cursor', () => {
  const testRoot = setupTestRoot()
  const { mount } = testRoot
  // The plot is 200 x 100 at clientX 100; the readout measures 60 x readoutHeight.
  let readoutHeight = 20

  beforeEach(() => {
    readoutHeight = 20
    mockElementRects(element => {
      const isReadout = element.hasAttribute('data-region-readout')
      return isReadout
        ? { left: 100, width: 60, height: readoutHeight }
        : { left: 100, width: 200, height: 100 }
    })
  })

  const move = (clientX: number) =>
    dispatchPointer(screen.getByTestId('plot'), 'pointermove', { clientX })

  const readoutOverlay = () => {
    const overlay = testRoot.host().querySelector<HTMLElement>('[data-region-readout]')
    if (!overlay) {
      throw new Error('Expected a floating position readout')
    }
    return overlay
  }

  test('shows the readout only during inspection, inside the plot beside the cursor', () => {
    mount(<ReadoutTrack />)
    expect(screen.queryByText(/Coverage:/)).toBeNull()
    move(150)
    const overlay = readoutOverlay()
    expect(screen.getByText('Coverage: 32')).not.toBeNull()
    expect(overlay.closest('[data-region-cursor]')).not.toBeNull()
    expect(overlay.style.left).toBe('58px')
    expect(overlay.style.top).toBe('8px')
    expect(overlay.getAttribute('aria-hidden')).toBe('true')
    expect(getComputedStyle(overlay).pointerEvents).toBe('none')
    dispatchPointer(screen.getByTestId('plot'), 'pointerout')
    expect(testRoot.host().querySelector('[data-region-readout]')).toBeNull()
  })

  test.each<[PositionReadoutPlacement, string]>([
    ['top', '8px'],
    ['middle', '40px'],
    ['bottom', '72px']
  ])('positions the readout at the requested %s preset', (placement, expectedTop) => {
    mount(<ReadoutTrack y={placement} />)
    move(150)
    expect(readoutOverlay().style.top).toBe(expectedTop)
  })

  test('accepts an explicit pixel Y and clamps it inside the plot', () => {
    mount(<ReadoutTrack y={18} />)
    move(150)
    expect(readoutOverlay().style.top).toBe('18px')
    mount(<ReadoutTrack y={-100} />)
    expect(readoutOverlay().style.top).toBe('0px')
    mount(<ReadoutTrack y={1000} />)
    expect(readoutOverlay().style.top).toBe('80px')
  })

  test('switches to the left of the cursor near the right edge and stays inside at the left edge', () => {
    mount(<ReadoutTrack />)
    move(295)
    expect(readoutOverlay().style.left).toBe('127px')
    move(100)
    expect(readoutOverlay().style.left).toBe('8px')
  })

  test('drops the preset margin when the readout fills a short plot', () => {
    readoutHeight = 100
    mount(<ReadoutTrack y="top" />)
    move(150)
    expect(readoutOverlay().style.top).toBe('0px')
  })

  test('bubbles use the default colours unless the track overrides them', () => {
    // jsdom normalizes colours inconsistently per property, so compare against a probe element.
    const expectColours = (backgroundColor: string, borderColor: string) => {
      const probe = document.createElement('div')
      Object.assign(probe.style, { backgroundColor, borderColor })
      const bubble = readoutOverlay().querySelector<HTMLElement>('[data-value-readout]')!
      expect(bubble.style.backgroundColor).toBe(probe.style.backgroundColor)
      expect(bubble.style.borderColor).toBe(probe.style.borderColor)
    }
    mount(<ReadoutTrack />)
    move(150)
    expectColours(DEFAULT_READOUT_BACKGROUND_COLOR, DEFAULT_READOUT_BORDER_COLOR)
    mount(
      <ReadoutTrack
        inspection={{ readoutBackgroundColor: '#000080', readoutBorderColor: '#ffffff' }}
      />
    )
    expectColours('#000080', '#ffffff')
  })

  test('direct Cursor users get the same overlay even when the line is hidden', () => {
    mount(
      <RegionViewer width={200} leftPanelWidth={0} rightPanelWidth={0} regions={REGIONS}>
        <Cursor showCursor={false} renderReadout={({ position }) => <span>Base {position}</span>}>
          <div data-testid="plot">Plot</div>
        </Cursor>
      </RegionViewer>
    )
    move(150)
    expect(screen.getByText('Base 51')).not.toBeNull()
    expect(testRoot.host().querySelector('svg[aria-hidden="true"]')).toBeNull()
  })

  describe('with ResizeObserver', () => {
    const previousResizeObserver = Reflect.get(globalThis, 'ResizeObserver')

    beforeEach(() => {
      FakeResizeObserver.instances = []
      Reflect.set(globalThis, 'ResizeObserver', FakeResizeObserver)
    })

    afterEach(() => {
      Reflect.set(globalThis, 'ResizeObserver', previousResizeObserver)
    })

    test('keeps one observer per readout across pointer moves', () => {
      mount(<ReadoutTrack />)
      move(150)
      const observersAfterFirstMove = FakeResizeObserver.instances.length
      move(160)
      move(170)
      move(180)
      expect(FakeResizeObserver.instances).toHaveLength(observersAfterFirstMove)
    })

    test('remeasures when the readout resizes without pointer movement', () => {
      mount(<ReadoutTrack y="bottom" />)
      move(150)
      expect(readoutOverlay().style.top).toBe('72px')
      readoutHeight = 40
      act(() => FakeResizeObserver.instances[FakeResizeObserver.instances.length - 1].callback())
      expect(readoutOverlay().style.top).toBe('52px')
    })
  })
})
