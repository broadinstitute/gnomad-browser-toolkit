import React from 'react'
import { ScalePosition } from './coordinates'

type Props = {
  scalePosition: ScalePosition
  width: number
}

export const PositionAxis = ({ scalePosition, width }: Props) => {
  const height = 15
  const numIntervals = Math.min(10, Math.floor(width / 90))

  const tickInterval = width / numIntervals
  const ticks = [...Array(numIntervals - 1)].map((_, i) => tickInterval * (i + 1))

  return (
    <svg height={height} width={width}>
      <line x1={0} y1={height} x2={width} y2={height} stroke="black" strokeWidth={2} />
      <g>
        <line x1={0} y1={height} x2={0} y2={height - 5} stroke="black" strokeWidth={2} />
        <text x={0} y={height - 7} textAnchor="start" style={{ fontSize: '10px' }}>
          {scalePosition.invert(0).toLocaleString()}
        </text>
      </g>
      {ticks.map(x => (
        <g key={x}>
          <line x1={x} y1={height} x2={x} y2={height - 5} stroke="black" strokeWidth={1} />
          <text x={x} y={height - 7} textAnchor="middle" style={{ fontSize: '10px' }}>
            {scalePosition.invert(x).toLocaleString()}
          </text>
        </g>
      ))}
      <g>
        <line x1={width} y1={height} x2={width} y2={height - 5} stroke="black" strokeWidth={2} />
        <text x={width} y={height - 7} textAnchor="end" style={{ fontSize: '10px' }}>
          {scalePosition.invert(width).toLocaleString()}
        </text>
      </g>
    </svg>
  )
}
