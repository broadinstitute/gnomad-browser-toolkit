import PropTypes from 'prop-types'
import React from 'react'

import { PositionReadout, Track } from '../lib/cjs'

const BINS = [
  { start: 1, stop: 10, count: 4 },
  { start: 11, stop: 20, count: 9 },
  { start: 21, stop: 30, count: 16 },
  { start: 31, stop: 40, count: 6 },
  { start: 41, stop: 50, count: 12 },
  { start: 51, stop: 60, count: 20 },
  { start: 61, stop: 70, count: 0 },
  { start: 71, stop: 80, count: 8 },
  { start: 81, stop: 90, count: 14 },
  { start: 91, stop: 100, count: 5 },
  { start: 201, stop: 210, count: 7 },
  { start: 211, stop: 220, count: 18 },
  { start: 221, stop: 230, count: 11 },
  { start: 231, stop: 240, count: 3 },
  { start: 241, stop: 250, count: 15 },
  { start: 251, stop: 260, count: 10 },
  { start: 261, stop: 270, count: 22 },
  { start: 271, stop: 280, count: 6 },
  { start: 281, stop: 290, count: 13 },
  { start: 291, stop: 300, count: 2 }
]

const PLOT_HEIGHT = 160
const BASELINE = PLOT_HEIGHT - 10
const MAX_BAR_HEIGHT = 80
const MAX_COUNT = Math.max(...BINS.map(bin => bin.count))

const binAt = position => BINS.find(bin => bin.start <= position && position <= bin.stop)
const binTop = count => BASELINE - (count / MAX_COUNT) * MAX_BAR_HEIGHT

const HistogramPlot = ({ regions, width, scalePosition }) => {
  const bars = regions.flatMap(region => {
    return BINS.filter(bin => bin.start <= region.stop && bin.stop >= region.start).map(bin => {
      const start = Math.max(bin.start, region.start)
      const stop = Math.min(bin.stop, region.stop)
      const x = scalePosition(start)
      const binWidth = scalePosition(stop + 1) - x
      const y = binTop(bin.count)
      return (
        <rect
          key={`${start}-${stop}`}
          data-bin-start={bin.start}
          x={x + 1}
          y={y}
          width={Math.max(0, binWidth - 2)}
          height={Math.max(1, BASELINE - y)}
          fill="#E69F00"
          stroke="#555"
        />
      )
    })
  })
  return (
    <svg
      role="img"
      aria-label="Histogram plot"
      width={width}
      height={PLOT_HEIGHT}
      style={{ display: 'block' }}
    >
      <title>Variant counts in 10-base bins</title>
      <line x1={0} x2={width} y1={BASELINE} y2={BASELINE} stroke="#666" />
      {bars}
    </svg>
  )
}

HistogramPlot.propTypes = {
  regions: PropTypes.arrayOf(
    PropTypes.shape({ start: PropTypes.number.isRequired, stop: PropTypes.number.isRequired })
  ).isRequired,
  width: PropTypes.number.isRequired,
  scalePosition: PropTypes.func.isRequired
}

const HistogramExampleTrack = ({ onSelect, readoutFontSize }) => {
  const readoutY = ({ position, readoutHeight }) => {
    const bin = binAt(position)
    return bin ? binTop(bin.count) - readoutHeight - 8 : 8
  }
  const renderReadout = ({ position }) => {
    const bin = binAt(position)
    const label = bin ? `Bin ${bin.start} to ${bin.stop}` : 'Bin count'
    return (
      <div aria-label="Histogram readout">
        <PositionReadout
          position={position}
          label={label}
          value={bin?.count ?? null}
          fontSize={readoutFontSize}
        />
      </div>
    )
  }
  return (
    <Track
      title="Histogram"
      renderTopPanel={() => {
        return <h3 style={{ margin: '1em 0 0.25em' }}>Histogram: readout above each bin</h3>
      }}
      positionInspection={{ onClick: onSelect, readoutY, showGenomicPositionOnHover: false }}
      renderPositionReadout={renderReadout}
    >
      {({ regions, width, scalePosition }) => {
        return <HistogramPlot regions={regions} width={width} scalePosition={scalePosition} />
      }}
    </Track>
  )
}

HistogramExampleTrack.propTypes = {
  onSelect: PropTypes.func,
  readoutFontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

export default HistogramExampleTrack
