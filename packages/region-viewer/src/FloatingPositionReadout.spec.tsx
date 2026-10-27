import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/dom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

import { Cursor, PositionReadoutPlacement, PositionReadoutY } from './Cursor'
import { PositionReadout } from './PositionReadout'
import { RegionViewer } from './RegionViewer'
import { Track } from './Track'

const REGIONS = [{ start: 1, stop: 200 }]

const ReadoutTrack = ({ y }: { y?: PositionReadoutY }) => {
  return (
    <RegionViewer width={200} leftPanelWidth={0} rightPanelWidth={0} regions={REGIONS}>
      <Track
        positionInspection={{ readoutY: y }}
        renderPositionReadout={({ position }) => {
          return <PositionReadout position={position} label="Coverage" value={32} unit="×" />
        }}
      >
        {() => <div data-testid="plot">Plot</div>}
      </Track>
    </RegionViewer>
  )
}

describe('readouts beside the cursor', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  const previousActEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT')

  beforeEach(() => {
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function measureElement(this: HTMLElement) {
        const isReadout = this.hasAttribute('data-region-readout')
        const width = isReadout ? 60 : 200
        const height = isReadout ? 20 : 100
        return {
          x: 100,
          y: 0,
          left: 100,
          top: 0,
          right: 100 + width,
          bottom: height,
          width,
          height,
          toJSON: () => ({})
        }
      })
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    jest.restoreAllMocks()
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', previousActEnvironment)
  })

  const mount = (element: React.ReactNode) => {
    act(() => root.render(element))
  }

  const move = (clientX: number) => {
    act(() => {
      fireEvent(
        screen.getByTestId('plot'),
        new MouseEvent('pointermove', { bubbles: true, clientX })
      )
    })
  }

  const readoutOverlay = () => {
    const overlay = host.querySelector<HTMLElement>('[data-region-readout]')
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
    expect(screen.getByText('Position: 51')).not.toBeNull()
    expect(overlay.closest('[data-region-cursor]')).not.toBeNull()
    expect(overlay.style.left).toBe('58px')
    expect(overlay.style.top).toBe('8px')
    expect(getComputedStyle(overlay).pointerEvents).toBe('none')
    act(() => {
      fireEvent(screen.getByTestId('plot'), new MouseEvent('pointerout', { bubbles: true }))
    })
    expect(host.querySelector('[data-region-readout]')).toBeNull()
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

  test('direct Cursor users get the same overlay even when the line is hidden', () => {
    mount(
      <RegionViewer width={200} leftPanelWidth={0} rightPanelWidth={0} regions={REGIONS}>
        <Cursor
          showCursor={false}
          renderPositionReadout={({ position }) => <span>Base {position}</span>}
        >
          <div data-testid="plot">Plot</div>
        </Cursor>
      </RegionViewer>
    )
    move(150)
    expect(screen.getByText('Base 51')).not.toBeNull()
    expect(host.querySelector('svg[aria-hidden="true"]')).toBeNull()
  })
})
