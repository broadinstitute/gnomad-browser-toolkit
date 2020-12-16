import React from 'react'

import { RegionViewer } from '@gnomad/region-viewer'

import TranscriptsTrack from '../src'

import gene from './PCSK9.json'

const TranscriptsTrackExample = () => (
  <RegionViewer padding={75} regions={gene.exons} width={1000}>
    <TranscriptsTrack
      activeTranscript={{
        exons: gene.exons,
        strand: gene.strand,
      }}
      transcripts={gene.transcripts}
      showNonCodingTranscripts={false}
      showUTRs={false}
    />
  </RegionViewer>
)

export default TranscriptsTrackExample
