import React from 'react'

import { RegionViewer } from '@gnomad/region-viewer'

import genes from './genes.json'

import { GenesTrack } from '../src'

const regions = [
  {
    start: 175000000,
    stop: 176500000
  }
]

const GenesTrackExample = () => (
  <RegionViewer regions={regions} width={1000}>
    <GenesTrack
      genes={genes}
      renderGeneLabel={gene => (
        <a href={`https://gnomad.broadinstitute.org/gene/${gene.gene_id}`}>
          <text textAnchor="middle">{gene.symbol}</text>
        </a>
      )}
    />
  </RegionViewer>
)

export default GenesTrackExample
