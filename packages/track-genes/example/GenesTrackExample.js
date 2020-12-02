import React from 'react'

import { RegionViewer } from '@gnomad/region-viewer'

import genes from './genes.json'

import { GenesTrack } from '../src'

const regions = [
  {
    chrom: '2',
    start: 175000000,
    stop: 176500000,
    feature_type: 'region',
  },
]

const GenesTrackExample = () => (
  <RegionViewer padding={0} regions={regions} width={1000}>
    <GenesTrack genes={genes} />
  </RegionViewer>
)

export default GenesTrackExample
