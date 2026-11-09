import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { RegionViewer } from '@gnomad/region-viewer'

import { TranscriptsTrack } from './TranscriptsTrack'

const TRANSCRIPTS = ['ENST1', 'ENST2'].map(transcriptId => ({
  transcript_id: transcriptId,
  exons: [{ feature_type: 'CDS', start: 20, stop: 60 }]
}))

const renderTranscripts = positionInspection => {
  return render(
    <RegionViewer
      width={360}
      leftPanelWidth={100}
      rightPanelWidth={160}
      regions={[{ start: 1, stop: 100 }]}
    >
      <TranscriptsTrack transcripts={TRANSCRIPTS} positionInspection={positionInspection} />
    </RegionViewer>
  )
}

describe('TranscriptsTrack', () => {
  beforeEach(() => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 0,
      left: 100,
      top: 0,
      right: 200,
      bottom: 10,
      width: 100,
      height: 10,
      toJSON: () => ({})
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('rows have no cursor without positionInspection', () => {
    const { container } = renderTranscripts(undefined)
    expect(container.querySelectorAll('[data-region-cursor]')).toHaveLength(0)
  })

  test('positionInspection gives every transcript row a synchronized line', () => {
    const onClick = jest.fn()
    const { container } = renderTranscripts({ onClick })
    const rows = container.querySelectorAll('[data-region-cursor]')
    expect(rows).toHaveLength(2)

    // jsdom lacks PointerEvent, so dispatch a MouseEvent carrying the pointer event type.
    fireEvent(rows[0], new MouseEvent('pointermove', { bubbles: true, clientX: 150 }))
    fireEvent.click(rows[0], { clientX: 150 })

    expect(container.querySelectorAll('svg[aria-hidden="true"] line')).toHaveLength(2)
    expect(onClick.mock.calls).toEqual([[51]])
  })
})
