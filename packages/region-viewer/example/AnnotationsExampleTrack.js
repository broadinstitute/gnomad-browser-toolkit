import PropTypes from 'prop-types'
import React from 'react'

import { Track } from '../lib/cjs'

const ANNOTATIONS = [
  { start: 8, stop: 24, label: 'A' },
  { start: 46, stop: 63, label: 'B' },
  { start: 83, stop: 97, label: 'C' },
  { start: 209, stop: 226, label: 'D' },
  { start: 248, stop: 264, label: 'E' },
  { start: 282, stop: 295, label: 'F' }
]

const AnnotationsPlot = ({ regions, width, scalePosition }) => {
  const marks = regions.flatMap(region => {
    return ANNOTATIONS.filter(
      annotation => annotation.start <= region.stop && annotation.stop >= region.start
    ).map(annotation => {
      const start = Math.max(annotation.start, region.start)
      const stop = Math.min(annotation.stop, region.stop)
      const x = scalePosition(start)
      const markWidth = scalePosition(stop + 1) - x
      return (
        <g key={annotation.label}>
          <rect x={x} y={20} width={markWidth} height={24} fill="#767676" />
          <text x={x + markWidth / 2} y={36} textAnchor="middle" fill="white">
            {annotation.label}
          </text>
        </g>
      )
    })
  })
  return (
    <svg
      role="img"
      aria-label="Annotations plot"
      width={width}
      height={64}
      style={{ display: 'block' }}
    >
      <desc>Labeled annotation intervals; cursor participation without a value readout</desc>
      <line x1={0} x2={width} y1={32} y2={32} stroke="#999" />
      {marks}
    </svg>
  )
}

AnnotationsPlot.propTypes = {
  regions: PropTypes.arrayOf(
    PropTypes.shape({ start: PropTypes.number.isRequired, stop: PropTypes.number.isRequired })
  ).isRequired,
  width: PropTypes.number.isRequired,
  scalePosition: PropTypes.func.isRequired
}

const AnnotationsExampleTrack = ({ onSelect }) => {
  return (
    <Track
      title="Annotations"
      renderTopPanel={() => {
        return <h3 style={{ margin: '1em 0 0.25em' }}>Annotations: coordinate only, no values</h3>
      }}
      positionInspection={{ onClick: onSelect, showGenomicPositionOnHover: true }}
    >
      {({ regions, width, scalePosition }) => {
        return <AnnotationsPlot regions={regions} width={width} scalePosition={scalePosition} />
      }}
    </Track>
  )
}

AnnotationsExampleTrack.propTypes = {
  onSelect: PropTypes.func
}

export default AnnotationsExampleTrack
