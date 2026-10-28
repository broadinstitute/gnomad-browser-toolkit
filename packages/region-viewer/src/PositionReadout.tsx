import React, { ReactNode } from 'react'
import styled from 'styled-components'

const Readout = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25em 1em;
  padding: 0.25em 0;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
`

const NUMBER_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 })
const POSITION_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export interface PositionReadoutProps {
  position: number | null
  label: string
  value: ReactNode
  unit?: string
  fontSize?: React.CSSProperties['fontSize']
  showPosition?: boolean
  formatValue?: (value: number | string) => ReactNode
}

const formatReadoutValue = ({
  position,
  value,
  formatValue
}: Pick<PositionReadoutProps, 'position' | 'value' | 'formatValue'>): ReactNode => {
  if (position === null) {
    return 'Not inspecting'
  }
  if (value === null || value === undefined) {
    return 'No data'
  }
  if (typeof value === 'number' || typeof value === 'string') {
    if (formatValue) {
      return formatValue(value)
    }
    return typeof value === 'number' ? NUMBER_FORMAT.format(value) : value
  }
  return value
}

export const PositionReadout = ({
  position,
  label,
  value,
  unit,
  fontSize,
  showPosition = false,
  formatValue
}: PositionReadoutProps): React.JSX.Element => {
  const content = formatReadoutValue({ position, value, formatValue })
  const hasValue = position !== null && value !== null && value !== undefined
  return (
    <Readout style={{ fontSize }}>
      {showPosition && position !== null && (
        <span>Position {POSITION_FORMAT.format(position)}</span>
      )}
      <span>
        {label}: {content}
        {hasValue && unit && <span> {unit}</span>}
      </span>
    </Readout>
  )
}
