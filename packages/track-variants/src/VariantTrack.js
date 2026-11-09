import PropTypes from 'prop-types'
import React from 'react'

import { Track } from '@gnomad/region-viewer'

import { VariantPlot } from './VariantPlot'

export const VariantTrack = ({ title, positionInspection, ...otherProps }) => (
  <Track title={title} positionInspection={positionInspection}>
    {({ scalePosition, width }) => (
      <VariantPlot {...otherProps} scalePosition={scalePosition} width={width} />
    )}
  </Track>
)

VariantTrack.propTypes = {
  title: PropTypes.string,
  // Passed unchanged to region-viewer's Track; see its TrackPositionInspection type.
  positionInspection: PropTypes.object
}

VariantTrack.defaultProps = {
  title: '',
  positionInspection: undefined
}
