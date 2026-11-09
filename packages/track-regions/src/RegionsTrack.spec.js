import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { RegionViewer } from '@gnomad/region-viewer'

import { RegionsTrack } from './RegionsTrack'

const REGIONS = [{ start: 20, stop: 60 }]

const renderRegionsTrack = positionInspection => {
  return render(
    <RegionViewer
      width={360}
      leftPanelWidth={100}
      rightPanelWidth={160}
      regions={[{ start: 1, stop: 100 }]}
    >
      <RegionsTrack regions={REGIONS} height={10} positionInspection={positionInspection} />
    </RegionViewer>
  )
}

describe('RegionsTrack', () => {
  beforeEach(() => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 0,
      left: 100,
      top: 0,
      right: 200,
      bottom: 20,
      width: 100,
      height: 20,
      toJSON: () => ({})
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('has no cursor without positionInspection', () => {
    const { container } = renderRegionsTrack(undefined)
    expect(container.querySelector('[data-region-cursor]')).toBeNull()
  })

  test('positionInspection gives the plot a synchronized line and click selection', () => {
    const onClick = jest.fn()
    const { container } = renderRegionsTrack({ onClick })
    const plot = container.querySelector('[data-region-cursor]')

    // jsdom lacks PointerEvent, so dispatch a MouseEvent carrying the pointer event type.
    fireEvent(plot, new MouseEvent('pointermove', { bubbles: true, clientX: 150 }))
    fireEvent.click(plot, { clientX: 150 })

    expect(container.querySelector('svg[aria-hidden="true"] line')).not.toBeNull()
    expect(onClick.mock.calls).toEqual([[51]])
  })

  test('positionInspection does not reach the RegionsPlot svg', () => {
    const { container } = renderRegionsTrack({})
    const plot = container.querySelector('svg:not([aria-hidden])')
    expect(plot.hasAttribute('positioninspection')).toBe(false)
    expect(plot.hasAttribute('positionInspection')).toBe(false)
  })
})
