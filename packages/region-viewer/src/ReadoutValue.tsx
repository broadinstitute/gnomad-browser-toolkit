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

export interface ReadoutValueProps {
  label: string
  /** `null` or `undefined` renders "No data"; `0` is a value. Numbers use en-US grouping, up to 3 decimals. */
  value: ReactNode
  /** Appended only when a value is present. */
  unit?: string
  /** Default `0.75rem`. */
  fontSize?: React.CSSProperties['fontSize']
  /** Formats number and string values; React elements render unchanged. */
  formatValue?: (value: number | string) => ReactNode
}

const formatReadoutValue = ({
  value,
  formatValue
}: Pick<ReadoutValueProps, 'value' | 'formatValue'>): ReactNode => {
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

export const ReadoutValue = ({
  label,
  value,
  unit,
  fontSize,
  formatValue
}: ReadoutValueProps): React.JSX.Element => {
  const hasValue = value !== null && value !== undefined
  return (
    <Readout style={{ fontSize }}>
      <span>
        {label}: {formatReadoutValue({ value, formatValue })}
        {hasValue && unit && <span> {unit}</span>}
      </span>
    </Readout>
  )
}
