import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/dom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

import { Cursor, PositionReadoutY } from './Cursor'
import { PositionReadout } from './PositionReadout'
import { RegionViewer } from './RegionViewer'
import { Track } from './Track'
import { useInspectedPosition } from './useInspectedPosition'

const REGIONS = [{ start: 1, stop: 200 }]

const TwoTracks = ({
  showCoveragePosition,
  readoutY,
  children
}: {
  showCoveragePosition?: boolean
  readoutY?: PositionReadoutY
  children?: React.ReactNode
}) => {
  return (
    <RegionViewer width={200} leftPanelWidth={0} rightPanelWidth={0} regions={REGIONS}>
      <Track
        positionInspection={{ showGenomicPositionOnHover: showCoveragePosition, readoutY }}
        renderPositionReadout={({ position }) => {
          return (
            <div aria-label="Coverage readout">
              <PositionReadout position={position} label="Coverage" value={32} />
            </div>
          )
        }}
      >
        {() => <div data-testid="coverage">Coverage plot</div>}
      </Track>
      <Track
        positionInspection={{}}
        renderPositionReadout={({ position }) => {
          return (
            <div aria-label="Score readout">
              <PositionReadout position={position} label="Score" value={0.5} />
            </div>
          )
        }}
      >
        {() => <div data-testid="score">Score plot</div>}
      </Track>
      {children}
    </RegionViewer>
  )
}

describe('genomic coordinates on the hovered track', () => {
  let root: ReturnType<typeof createRoot>
  let host: HTMLDivElement
  const previousActEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT')

  beforeEach(() => {
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function measureElement(this: HTMLElement) {
        const isGroup = this.hasAttribute('data-region-readout')
        const hasCoordinate = this.querySelector('[data-genomic-position]') !== null
        const hasValue = this.querySelector('[data-value-readout]') !== null
        const width = isGroup ? 80 : 200
        const groupHeight = hasCoordinate && hasValue ? 56 : 26
        const height = isGroup ? groupHeight : 100
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

  const mount = (children: React.ReactNode) => {
    act(() => root.render(children))
  }

  const move = (name: string, clientX = 150) => {
    act(() => {
      fireEvent(screen.getByTestId(name), new MouseEvent('pointermove', { bubbles: true, clientX }))
    })
  }

  const coordinateIn = (label: string) => {
    return screen
      .getByLabelText(`${label} readout`)
      .closest('[data-region-readout]')
      ?.querySelector('[data-genomic-position]')
  }

  test('defaults to one coordinate on the source and transfers it when another track hovers the same base', () => {
    const recordPositionRender = jest.fn()
    const PositionObserver = () => {
      recordPositionRender(useInspectedPosition())
      return null
    }
    mount(
      <TwoTracks>
        <PositionObserver />
      </TwoTracks>
    )
    expect(host.querySelector('[data-genomic-position]')).toBeNull()
    move('coverage')
    expect(coordinateIn('Coverage')?.textContent).toBe('Position: 51')
    expect(coordinateIn('Score')).toBeNull()
    const positionRenderCount = recordPositionRender.mock.calls.length

    move('score')
    expect(coordinateIn('Coverage')).toBeNull()
    expect(coordinateIn('Score')?.textContent).toBe('Position: 51')
    expect(host.querySelectorAll('[data-genomic-position]')).toHaveLength(1)
    expect(recordPositionRender.mock.calls.length).toBe(positionRenderCount)

    act(() =>
      fireEvent(screen.getByTestId('coverage'), new MouseEvent('pointerout', { bubbles: true }))
    )
    expect(coordinateIn('Score')?.textContent).toBe('Position: 51')
  })

  test('can opt out on one track without hiding its value or preventing the next source label', () => {
    mount(<TwoTracks showCoveragePosition={false} />)
    move('coverage')
    expect(host.querySelector('[data-genomic-position]')).toBeNull()
    expect(screen.getByText('Coverage: 32')).not.toBeNull()
    move('score')
    expect(coordinateIn('Score')?.textContent).toBe('Position: 51')
  })

  test('a cursor without values shows only its coordinate while hovered and can opt out completely', () => {
    const cursor = (showGenomicPositionOnHover: boolean) => {
      return (
        <RegionViewer width={200} leftPanelWidth={0} rightPanelWidth={0} regions={REGIONS}>
          <Cursor showGenomicPositionOnHover={showGenomicPositionOnHover}>
            <div data-testid="plain">Plain plot</div>
          </Cursor>
        </RegionViewer>
      )
    }
    mount(cursor(true))
    move('plain')
    expect(screen.getByText('Position: 51')).not.toBeNull()
    expect(host.querySelector('[data-value-readout]')).toBeNull()
    act(() =>
      fireEvent(screen.getByTestId('plain'), new MouseEvent('pointerout', { bubbles: true }))
    )
    expect(host.querySelector('[data-region-readout]')).toBeNull()
    mount(cursor(false))
    move('plain')
    expect(host.querySelector('[data-region-readout]')).toBeNull()
    expect(host.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
  })
})
