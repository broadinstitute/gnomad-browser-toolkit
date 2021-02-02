import PropTypes from 'prop-types'
import React from 'react'

import { TooltipAnchor, TooltipHint } from '../src'

const BasicTooltip = ({ tooltip }) => <span>{tooltip}</span>

BasicTooltip.propTypes = {
  tooltip: PropTypes.string.isRequired,
}

const TooltipExample = () => (
  <TooltipAnchor tooltip="A tooltip" tooltipComponent={BasicTooltip}>
    <TooltipHint>Hover here</TooltipHint>
  </TooltipAnchor>
)

export default TooltipExample
