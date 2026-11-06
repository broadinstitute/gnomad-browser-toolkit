import { describe, expect, jest, test } from '@jest/globals'
import { screen } from '@testing-library/dom'
import React from 'react'

import { Cursor, PositionReadoutY } from './Cursor'
import { ReadoutValue } from './ReadoutValue'
import { RegionViewer } from './RegionViewer'
import { Track } from './Track'
import { dispatchPointer, mockElementRects, setupTestRoot } from './testUtils'
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
        positionInspection={{
          showPositionBadge: showCoveragePosition,
          readoutY,
          renderReadout: () => {
            return (
              <div aria-label="Coverage readout">
                <ReadoutValue label="Coverage" value={32} />
              </div>
            )
          }
        }}
      >
        {() => <div data-testid="coverage">Coverage plot</div>}
      </Track>
      <Track
        positionInspection={{
          renderReadout: () => {
            return (
              <div aria-label="Score readout">
                <ReadoutValue label="Score" value={0.5} />
              </div>
            )
          }
        }}
      >
        {() => <div data-testid="score">Score plot</div>}
      </Track>
      {children}
    </RegionViewer>
  )
}

describe('position badge on the hovered track', () => {
  const testRoot = setupTestRoot()
  const { mount } = testRoot
  const host = () => testRoot.host()

  // Plots span clientX 100-300 for bases 1-200, so clientX 150 is base 51.
  const mockLayout = () =>
    mockElementRects(element => {
      const isGroup = element.hasAttribute('data-region-readout')
      const hasBadge = element.querySelector('[data-position-badge]') !== null
      const hasValue = element.querySelector('[data-value-readout]') !== null
      const groupHeight = hasBadge && hasValue ? 56 : 26
      return isGroup
        ? { left: 100, width: 80, height: groupHeight }
        : { left: 100, width: 200, height: 100 }
    })

  const move = (name: string, clientX = 150) =>
    dispatchPointer(screen.getByTestId(name), 'pointermove', { clientX })

  const badgeIn = (label: string) => {
    return screen
      .getByLabelText(`${label} readout`)
      .closest('[data-region-readout]')
      ?.querySelector('[data-position-badge]')
  }

  test('defaults to one badge on the hovered track and transfers it when another track hovers the same base', () => {
    mockLayout()
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
    expect(host().querySelector('[data-position-badge]')).toBeNull()
    move('coverage')
    expect(badgeIn('Coverage')?.textContent).toBe('Position: 51')
    expect(badgeIn('Score')).toBeNull()
    const positionRenderCount = recordPositionRender.mock.calls.length

    move('score')
    expect(badgeIn('Coverage')).toBeNull()
    expect(badgeIn('Score')?.textContent).toBe('Position: 51')
    expect(host().querySelectorAll('[data-position-badge]')).toHaveLength(1)
    expect(recordPositionRender.mock.calls.length).toBe(positionRenderCount)

    dispatchPointer(screen.getByTestId('coverage'), 'pointerout')
    expect(badgeIn('Score')?.textContent).toBe('Position: 51')
  })

  test('can opt out on one track without hiding its value or preventing the next badge', () => {
    mockLayout()
    mount(<TwoTracks showCoveragePosition={false} />)
    move('coverage')
    expect(host().querySelector('[data-position-badge]')).toBeNull()
    expect(screen.getByText('Coverage: 32')).not.toBeNull()
    move('score')
    expect(badgeIn('Score')?.textContent).toBe('Position: 51')
  })

  test('a cursor without values shows only its badge while hovered and can opt out completely', () => {
    mockLayout()
    const cursor = (showPositionBadge: boolean) => {
      return (
        <RegionViewer width={200} leftPanelWidth={0} rightPanelWidth={0} regions={REGIONS}>
          <Cursor showPositionBadge={showPositionBadge}>
            <div data-testid="plain">Plain plot</div>
          </Cursor>
        </RegionViewer>
      )
    }
    mount(cursor(true))
    move('plain')
    expect(screen.getByText('Position: 51')).not.toBeNull()
    expect(host().querySelector('[data-value-readout]')).toBeNull()
    dispatchPointer(screen.getByTestId('plain'), 'pointerout')
    expect(host().querySelector('[data-region-readout]')).toBeNull()
    mount(cursor(false))
    move('plain')
    expect(host().querySelector('[data-region-readout]')).toBeNull()
    expect(host().querySelector('svg[aria-hidden="true"]')).not.toBeNull()
  })

  test('positions badge and value bubbles as one measured group for custom Y placement', () => {
    mockLayout()
    const resolveY = jest.fn(
      ({ height, readoutHeight }: { height: number; readoutHeight: number }) =>
        height - readoutHeight - 8
    )
    mount(<TwoTracks readoutY={resolveY} />)
    move('coverage')
    const group = screen
      .getByLabelText('Coverage readout')
      .closest<HTMLElement>('[data-region-readout]')
    expect(group?.querySelector('[data-position-badge]')).not.toBeNull()
    expect(group?.querySelector('[data-value-readout]')).not.toBeNull()
    expect(resolveY).toHaveBeenLastCalledWith({ position: 51, height: 100, readoutHeight: 56 })
    expect(group?.style.top).toBe('36px')
    move('score')
    expect(resolveY).toHaveBeenLastCalledWith({ position: 51, height: 100, readoutHeight: 26 })
    expect(group?.style.top).toBe('66px')
  })
})
