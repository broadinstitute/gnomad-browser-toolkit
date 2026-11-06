import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { RegionViewer } from '@gnomad/region-viewer'

import { GenesTrack } from './GenesTrack'

const GENES = [
  {
    gene_id: 'ENSG1',
    symbol: 'GENE1',
    start: 20,
    stop: 60,
    exons: [{ feature_type: 'CDS', start: 20, stop: 60 }]
  }
]

const renderGenesTrack = positionInspection => {
  return render(
    <RegionViewer
      width={360}
      leftPanelWidth={100}
      rightPanelWidth={160}
      regions={[{ start: 1, stop: 100 }]}
    >
      <GenesTrack genes={GENES} title="Genes" positionInspection={positionInspection} />
    </RegionViewer>
  )
}

describe('GenesTrack', () => {
  beforeEach(() => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 0,
      left: 100,
      top: 0,
      right: 200,
      bottom: 40,
      width: 100,
      height: 40,
      toJSON: () => ({})
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('has no cursor without positionInspection', () => {
    const { container } = renderGenesTrack(undefined)
    expect(container.querySelector('[data-region-cursor]')).toBeNull()
  })

  test('positionInspection gives the plot a synchronized line and click selection', () => {
    const onClick = jest.fn()
    const { container } = renderGenesTrack({ onClick })
    const plot = container.querySelector('[data-region-cursor]')

    // jsdom lacks PointerEvent, so dispatch a MouseEvent carrying the pointer event type.
    fireEvent(plot, new MouseEvent('pointermove', { bubbles: true, clientX: 150 }))
    fireEvent.click(plot, { clientX: 150 })

    expect(container.querySelector('svg[aria-hidden="true"] line')).not.toBeNull()
    expect(onClick.mock.calls).toEqual([[51]])
  })
})
