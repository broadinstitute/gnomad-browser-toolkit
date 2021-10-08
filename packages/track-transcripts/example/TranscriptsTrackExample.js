import React from 'react'

import { RegionViewer } from '@gnomad/region-viewer'

import TranscriptsTrack from '../src'

import gene from './PCSK9.json'

const regionViewerRegions = gene.exons.map(({ start, stop }) => ({
  start: start - 75,
  stop: stop + 75,
}))

const TranscriptsTrackExample = () => (
  <RegionViewer regions={regionViewerRegions} width={1000}>
    <TranscriptsTrack
      transcripts={gene.transcripts}
      showNonCodingTranscripts={false}
      showUTRs={false}
    />
  </RegionViewer>
)

export default TranscriptsTrackExample
