import PropTypes from 'prop-types'
import React from 'react'

import { PositionReadout, Track } from '../lib/cjs'

export const COVERAGE = [
  { start: 1, stop: 40, value: 32 },
  { start: 41, stop: 60, value: 0 },
  { start: 61, stop: 100, value: 18 },
  { start: 201, stop: 220, value: 12 },
  { start: 241, stop: 300, value: 40 }
].flatMap(({ start, stop, value }) => {
  return Array.from({ length: stop - start + 1 }, (_, offset) => {
    const position = start + offset
    const variation = 3 * Math.sin(position / 4) + 2 * Math.sin(position / 11)
    const coverage = value === 0 ? 0 : Math.round(value + variation)
    return { start: position, stop: position, value: coverage }
  })
})

export const SCORES = [
  { start: 1, stop: 60, value: 0.81 },
  { start: 61, stop: 100, value: 0 },
  { start: 201, stop: 260, value: 0.45 },
  { start: 281, stop: 300, value: 0.93 }
]

const lookupValue = (intervals, position) => {
  const interval = intervals.find(({ start, stop }) => start <= position && position <= stop)
  return interval?.value ?? null
}

const COVERAGE_PLOT_HEIGHT = 160
const COVERAGE_BASELINE = COVERAGE_PLOT_HEIGHT - 10
const COVERAGE_VALUE_HEIGHT = 80

const coverageY = (value, maximum) => {
  return COVERAGE_BASELINE - (value / maximum) * COVERAGE_VALUE_HEIGHT
}

const IntervalPlot = ({ label, intervals, maximum, regions, width, scalePosition, onDetails }) => {
  const baseCount = regions.reduce((total, region) => total + region.stop - region.start + 1, 0)
  const baseWidth = width / baseCount
  const isCoverage = label === 'Coverage'
  const baseline = isCoverage ? COVERAGE_BASELINE : 60
  const plotHeight = isCoverage ? COVERAGE_PLOT_HEIGHT : 80
  const color = isCoverage ? '#0072B2' : '#CC79A7'
  const marks = regions.flatMap(region => {
    return intervals
      .filter(interval => interval.start <= region.stop && interval.stop >= region.start)
      .map(interval => {
        const start = Math.max(interval.start, region.start)
        const stop = Math.min(interval.stop, region.stop)
        const x = scalePosition(start)
        const intervalWidth = scalePosition(stop) + baseWidth - x
        const y = isCoverage
          ? coverageY(interval.value, maximum)
          : 60 - (interval.value / maximum) * 50
        const bar = (
          <rect
            data-position={start}
            x={x}
            y={y}
            width={intervalWidth}
            height={Math.max(1, baseline - y)}
            shapeRendering="crispEdges"
            fill={color}
          />
        )
        const score = (
          <g>
            <line x1={x} x2={x + intervalWidth} y1={y} y2={y} stroke={color} strokeWidth={3} />
            <circle cx={x + intervalWidth / 2} cy={y} r={4} fill={color} />
          </g>
        )
        return (
          <g key={`${start}-${stop}`}>
            <title>{`${label}, bases ${start}–${stop}: ${interval.value}`}</title>
            {isCoverage ? bar : score}
          </g>
        )
      })
  })

  return (
    <svg
      aria-label={`${label} plot`}
      role="img"
      width={width}
      height={plotHeight}
      style={{ display: 'block' }}
    >
      <title>{label} interval data</title>
      <line x1={0} x2={width} y1={baseline} y2={baseline} stroke="#666" />
      {marks}
      <a
        href="#details"
        aria-label={`Open ${label.toLowerCase()} details`}
        onClick={event => {
          event.stopPropagation()
          onDetails(label)
        }}
      >
        <circle cx={width - 12} cy={12} r={7} fill="white" stroke="#333" />
        <title>Open details without background selection</title>
      </a>
    </svg>
  )
}

const intervalType = PropTypes.shape({
  start: PropTypes.number.isRequired,
  stop: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
})

IntervalPlot.propTypes = {
  label: PropTypes.string.isRequired,
  intervals: PropTypes.arrayOf(intervalType).isRequired,
  maximum: PropTypes.number.isRequired,
  regions: PropTypes.arrayOf(PropTypes.shape({ start: PropTypes.number, stop: PropTypes.number }))
    .isRequired,
  width: PropTypes.number.isRequired,
  scalePosition: PropTypes.func.isRequired,
  onDetails: PropTypes.func.isRequired
}

const InspectionTrack = ({
  label,
  intervals,
  settings,
  readoutFontSize,
  readoutY = 'top',
  customContent = false,
  onSelect,
  onDetails
}) => {
  const maximum = Math.max(1, ...intervals.map(interval => interval.value))
  const renderReadout = ({ position }) => {
    const value = lookupValue(intervals, position)
    const customValue = (
      <span>
        <strong>{value}</strong> normalized score
      </span>
    )
    const displayedValue = customContent && value !== null ? customValue : value
    const unit = label === 'Coverage' ? '×' : undefined
    return (
      <div aria-label={`${label} readout`}>
        <PositionReadout
          position={position}
          label={label}
          value={displayedValue}
          unit={unit}
          fontSize={readoutFontSize}
        />
      </div>
    )
  }
  const readout = settings.readout ? renderReadout : undefined

  return (
    <Track
      title={label}
      renderTopPanel={() => {
        return <h3 style={{ margin: '1em 0 0.25em' }}>{label}</h3>
      }}
      positionInspection={{
        enabled: settings.enabled,
        publishPosition: settings.publish,
        showCursor: settings.cursor,
        showGenomicPositionOnHover: settings.genomicPosition,
        onClick: onSelect,
        readoutY
      }}
      renderPositionReadout={readout}
    >
      {({ regions, width, scalePosition }) => {
        return (
          <IntervalPlot
            label={label}
            intervals={intervals}
            maximum={maximum}
            regions={regions}
            width={width}
            scalePosition={scalePosition}
            onDetails={onDetails}
          />
        )
      }}
    </Track>
  )
}

InspectionTrack.propTypes = {
  label: PropTypes.string.isRequired,
  intervals: PropTypes.arrayOf(intervalType).isRequired,
  settings: PropTypes.shape({
    enabled: PropTypes.bool.isRequired,
    publish: PropTypes.bool.isRequired,
    cursor: PropTypes.bool.isRequired,
    genomicPosition: PropTypes.bool.isRequired,
    readout: PropTypes.bool.isRequired
  }).isRequired,
  readoutFontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  readoutY: PropTypes.oneOf(['top', 'middle', 'bottom']),
  customContent: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDetails: PropTypes.func.isRequired
}

export default InspectionTrack
