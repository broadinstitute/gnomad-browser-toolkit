import React, { ReactNode, RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react'
import styled from 'styled-components'

export type PositionReadoutPlacement = 'top' | 'middle' | 'bottom'
/** A preset, or pixels from the plot's top edge. The readout is always clamped inside the plot. */
export type PositionReadoutY = PositionReadoutPlacement | number
export type PositionReadoutRenderer = (props: { position: number }) => ReactNode

// Matches the @gnomad/ui tooltip background without depending on that package.
export const DEFAULT_READOUT_BACKGROUND_COLOR = '#474747'
export const DEFAULT_READOUT_BORDER_COLOR = '#9e9e9e'

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
  max-height: 100%;
  overflow: hidden;
  color: #fff;
  pointer-events: none;
`

const ReadoutBubble = styled.div`
  box-sizing: border-box;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  padding: 0 7px;
  border: 1px solid;
  border-radius: 3px;
`

const localPixelSize = (cssSize: string, fallback: number) => {
  return /px$/.test(cssSize) ? parseFloat(cssSize) : fallback
}

interface Props {
  children?: ReactNode
  x: number
  y: PositionReadoutY
  plotRef: RefObject<HTMLDivElement>
  backgroundColor: string
  borderColor: string
}

export const FloatingPositionReadout = ({
  children,
  x,
  y,
  plotRef,
  backgroundColor,
  borderColor
}: Props): React.JSX.Element | null => {
  const readoutRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0, readoutWidth: 0, readoutHeight: 0 })
  const hasValueReadout =
    children !== null && children !== undefined && typeof children !== 'boolean'

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
  // Depends on which elements are mounted, not on children, so pointer moves reuse one observer.
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
  }, [hasValueReadout, measure, plotRef])

  if (!hasValueReadout) {
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
  const bubbleStyle = { backgroundColor, borderColor }

  return (
    <ReadoutOverlay
      ref={readoutRef}
      aria-hidden="true"
      data-region-readout=""
      style={{
        left: Math.max(0, Math.min(left, size.width - size.readoutWidth)),
        top: Math.max(0, Math.min(top, size.height - size.readoutHeight)),
        visibility: size.height > 0 ? 'visible' : 'hidden',
        alignItems: fitsOnRight ? 'flex-start' : 'flex-end'
      }}
    >
      <ReadoutBubble data-value-readout="" style={bubbleStyle}>
        {children}
      </ReadoutBubble>
    </ReadoutOverlay>
  )
}
