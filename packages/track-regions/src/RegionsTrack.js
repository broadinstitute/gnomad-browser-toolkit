import PropTypes from 'prop-types'
import React from 'react'

import { Track } from '@gnomad/region-viewer'

import { RegionsPlot } from './RegionsPlot'

export const RegionsTrack = ({
  positionInspection,
  renderLeftPanel,
  renderRightPanel,
  renderTopPanel,
  title,
  ...rest
}) => (
  <Track
    positionInspection={positionInspection}
    renderLeftPanel={renderLeftPanel}
    renderRightPanel={renderRightPanel}
    renderTopPanel={renderTopPanel}
  >
    {({ scalePosition, width }) => (
      <RegionsPlot {...rest} scalePosition={scalePosition} width={width} />
    )}
  </Track>
)

RegionsTrack.propTypes = {
  // Passed unchanged to region-viewer's Track; see its TrackPositionInspection type.
  positionInspection: PropTypes.object,
  renderLeftPanel: PropTypes.func,
  renderRightPanel: PropTypes.func,
  renderTopPanel: PropTypes.func,
  title: PropTypes.string
}

RegionsTrack.defaultProps = {
  positionInspection: undefined,
  renderLeftPanel: undefined,
  renderRightPanel: undefined,
  renderTopPanel: undefined,
  title: ''
}
