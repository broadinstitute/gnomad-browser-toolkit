import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { RegionViewer } from '@gnomad/region-viewer'

import { VariantTrack } from './VariantTrack'

const VARIANTS = [{ variant_id: '1-50-A-C', pos: 50, allele_freq: 0.1, consequence: 'missense' }]

const renderVariantTracks = sourceTrackProps => {
  return render(
    <RegionViewer
      width={360}
      leftPanelWidth={100}
      rightPanelWidth={160}
      regions={[{ start: 1, stop: 100 }]}
    >
      <VariantTrack title="Source" variants={VARIANTS} {...sourceTrackProps} />
      <VariantTrack title="Follower" variants={VARIANTS} positionInspection={{}} />
    </RegionViewer>
  )
}

describe('VariantTrack', () => {
  beforeEach(() => {
    const canvasContext = new Proxy({}, { get: () => () => {} })
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(canvasContext)
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
    jest.restoreAllMocks()
  })

  test('only the track given positionInspection renders a cursor', () => {
    const { container } = renderVariantTracks({})
    expect(container.querySelectorAll('[data-region-cursor]')).toHaveLength(1)
  })

  test('positionInspection reaches the inner Track', () => {
    const onClick = jest.fn()
    const { container } = renderVariantTracks({ positionInspection: { onClick } })
    const [sourceCursor] = container.querySelectorAll('[data-region-cursor]')

    // jsdom lacks PointerEvent, so dispatch a MouseEvent carrying the pointer event type.
    fireEvent(sourceCursor, new MouseEvent('pointermove', { bubbles: true, clientX: 150 }))
    fireEvent.click(sourceCursor, { clientX: 150 })

    expect(container.querySelectorAll('svg[aria-hidden="true"] line')).toHaveLength(2)
    expect(onClick.mock.calls).toEqual([[51]])
  })
})
