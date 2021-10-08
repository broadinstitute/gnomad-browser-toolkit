import React from 'react'

import { RegionViewer } from '@gnomad/region-viewer'

import { RegionsTrack } from '../src'

import gene from './PCSK9.json'

const regionViewerRegions = gene.exons.map(({ start, stop }) => ({
  start: start - 75,
  stop: stop + 75,
}))

const RegionsTrackExample = () => (
  <RegionViewer regions={regionViewerRegions} width={1000}>
    {gene.transcripts.map(transcript => (
      <div key={transcript.transcript_id} style={{ marginBottom: '5px' }}>
        <RegionsTrack
          height={10}
          regions={transcript.exons.filter(e => e.feature_type === 'UTR')}
        />
      </div>
    ))}
  </RegionViewer>
)

export default RegionsTrackExample
