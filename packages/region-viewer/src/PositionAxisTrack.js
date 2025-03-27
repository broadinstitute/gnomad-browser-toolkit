import React from 'react'

import { Track } from './Track'

import { PositionAxis } from './PositionAxis'

export const PositionAxisTrack = () => (
  <Track>
    {/* scalePosition and width, which appear to come out of nowhere below, are supplied by Track which in turn gets them out of a RegionViewerContext. */}
    {({ scalePosition, width }) => <PositionAxis scalePosition={scalePosition} width={width} />}
  </Track>
)
