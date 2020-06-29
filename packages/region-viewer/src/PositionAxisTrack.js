import React from 'react'

import { Track } from './Track'

import { PositionAxis } from './PositionAxis'

export const PositionAxisTrack = () => (
  <Track>
    {({ scalePosition, width }) => <PositionAxis scalePosition={scalePosition} width={width} />}
  </Track>
)
