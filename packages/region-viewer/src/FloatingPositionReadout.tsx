import React, { ReactNode, RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { PositionReadout } from './PositionReadout'

export type PositionReadoutPlacement = 'top' | 'middle' | 'bottom'
export type PositionReadoutY = PositionReadoutPlacement | number
export type PositionReadoutRenderer = (props: { position: number }) => ReactNode

const READOUT_GAP = 8

const ReadoutOverlay = styled.div`
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
  width: max-content;
  max-width: calc(100% - ${READOUT_GAP * 2}px);
  max-height: calc(100% - ${READOUT_GAP * 2}px);
  overflow: hidden;
  color: #222;
  pointer-events: none;
`

const ReadoutBubble = styled.div`
  box-sizing: border-box;
  flex-shrink: 0;
  max-width: 100%;
  padding: 2px 8px;
  border: 1px solid #777;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.96);
`

const localPixelSize = (cssSize: string, fallback: number) => {
  return /px$/.test(cssSize) ? parseFloat(cssSize) : fallback
}

interface Props {
  children?: ReactNode
  showGenomicPosition: boolean
  position: number
  x: number
  y: PositionReadoutY
  plotRef: RefObject<HTMLDivElement>
}

export const FloatingPositionReadout = ({
  children,
  showGenomicPosition,
  position,
  x,
  y,
  plotRef
}: Props): React.JSX.Element | null => {
  const readoutRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0, readoutWidth: 0, readoutHeight: 0 })

  const measure = useCallback(() => {
    const plot = plotRef.current
    const readout = readoutRef.current
    if (!plot || !readout) {
      return
    }
    const plotBounds = plot.getBoundingClientRect()
    const readoutBounds = readout.getBoundingClientRect()
    const plotStyle = getComputedStyle(plot)
    const readoutStyle = getComputedStyle(readout)
    const next = {
      width: localPixelSize(plotStyle.width, plotBounds.width),
      height: localPixelSize(plotStyle.height, plotBounds.height),
      readoutWidth: localPixelSize(readoutStyle.width, readoutBounds.width),
      readoutHeight: localPixelSize(readoutStyle.height, readoutBounds.height)
    }
    setSize(previous => {
      return previous.width === next.width &&
        previous.height === next.height &&
        previous.readoutWidth === next.readoutWidth &&
        previous.readoutHeight === next.readoutHeight
        ? previous
        : next
    })
  }, [plotRef])

  useLayoutEffect(measure)
  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return undefined
    }
    const observer = new ResizeObserver(measure)
    if (plotRef.current) {
      observer.observe(plotRef.current)
    }
    if (readoutRef.current) {
      observer.observe(readoutRef.current)
    }
    return () => observer.disconnect()
  }, [children, measure, plotRef, showGenomicPosition])

  const hasValueReadout =
    children !== null && children !== undefined && typeof children !== 'boolean'
  if (!hasValueReadout && !showGenomicPosition) {
    return null
  }

  const right = x + READOUT_GAP
  const fitsOnRight = right + size.readoutWidth <= size.width - READOUT_GAP
  const left = fitsOnRight ? right : x - READOUT_GAP - size.readoutWidth
  let top = READOUT_GAP
  if (y === 'middle') {
    top = (size.height - size.readoutHeight) / 2
  } else if (y === 'bottom') {
    top = size.height - size.readoutHeight - READOUT_GAP
  } else if (typeof y === 'number') {
    top = y
  }

  return (
    <ReadoutOverlay
      ref={readoutRef}
      data-region-readout=""
      style={{
        left: Math.max(0, Math.min(left, size.width - size.readoutWidth)),
        top: Math.max(0, Math.min(top, size.height - size.readoutHeight)),
        visibility: size.height > 0 ? 'visible' : 'hidden',
        alignItems: fitsOnRight ? 'flex-start' : 'flex-end'
      }}
    >
      {showGenomicPosition && (
        <ReadoutBubble data-genomic-position="">
          <PositionReadout position={position} label="Position" value={position} />
        </ReadoutBubble>
      )}
      {hasValueReadout && <ReadoutBubble data-value-readout="">{children}</ReadoutBubble>}
    </ReadoutOverlay>
  )
}
