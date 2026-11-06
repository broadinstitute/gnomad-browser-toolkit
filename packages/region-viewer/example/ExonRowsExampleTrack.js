import PropTypes from 'prop-types'
import React from 'react'

import { Track } from '../lib/cjs'

const TRANSCRIPTS = [
  {
    id: 'Transcript 1',
    exons: [
      { start: 5, stop: 30 },
      { start: 45, stop: 70 },
      { start: 210, stop: 240 },
      { start: 270, stop: 295 }
    ]
  },
  {
    id: 'Transcript 2',
    exons: [
      { start: 45, stop: 70 },
      { start: 210, stop: 240 }
    ]
  },
  {
    id: 'Transcript 3',
    exons: [
      { start: 5, stop: 30 },
      { start: 80, stop: 95 },
      { start: 270, stop: 295 }
    ]
  }
]

const ROW_HEIGHT = 10

const exonNumberAt = (exons, position) => {
  const index = exons.findIndex(exon => exon.start <= position && position <= exon.stop)
  return index === -1 ? null : `${index + 1}/${exons.length}`
}

const ExonRow = ({ transcript, heading, onSelect }) => {
  const renderHeading = () => {
    return <h3 style={{ margin: '1em 0 0.25em' }}>{heading}</h3>
  }
  return (
    <div style={{ marginBottom: 5 }}>
      <Track
        title={transcript.id}
        renderTopPanel={heading ? renderHeading : undefined}
        positionInspection={{
          onClick: onSelect,
          readoutY: 'middle',
          renderReadout: ({ position }) => {
            const exonNumber = exonNumberAt(transcript.exons, position)
            if (exonNumber === null) {
              return null
            }
            return (
              <span aria-label={`${transcript.id} readout`} style={{ fontSize: 8, lineHeight: 1 }}>
                {exonNumber}
              </span>
            )
          }
        }}
      >
        {({ width, scalePosition, isPositionDefined }) => {
          const exons = transcript.exons.filter(
            exon => isPositionDefined(exon.start) && isPositionDefined(exon.stop)
          )
          return (
            <svg
              role="img"
              aria-label={`${transcript.id} plot`}
              width={width}
              height={ROW_HEIGHT}
              style={{ display: 'block' }}
            >
              <line x1={0} x2={width} y1={ROW_HEIGHT / 2} y2={ROW_HEIGHT / 2} stroke="#bdbdbd" />
              {exons.map(exon => {
                const x = scalePosition(exon.start)
                return (
                  <rect
                    key={exon.start}
                    x={x}
                    y={0}
                    width={scalePosition(exon.stop) - x}
                    height={ROW_HEIGHT}
                    fill="#424242"
                  />
                )
              })}
            </svg>
          )
        }}
      </Track>
    </div>
  )
}

const transcriptType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  exons: PropTypes.arrayOf(
    PropTypes.shape({ start: PropTypes.number.isRequired, stop: PropTypes.number.isRequired })
  ).isRequired
})

ExonRow.propTypes = {
  transcript: transcriptType.isRequired,
  heading: PropTypes.string,
  onSelect: PropTypes.func
}

const ExonRowsExampleTrack = ({ onSelect }) => {
  return TRANSCRIPTS.map((transcript, index) => {
    const heading = index === 0 ? 'Exon rows: compact readouts on 10px plots' : undefined
    return (
      <ExonRow key={transcript.id} transcript={transcript} heading={heading} onSelect={onSelect} />
    )
  })
}

ExonRowsExampleTrack.propTypes = {
  onSelect: PropTypes.func
}

export default ExonRowsExampleTrack
