import React, { ReactNode, useContext, useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'

import { usePositionInspection } from './positionInspection'
import { RegionViewerContext } from './RegionViewer'
import { useInspectedPosition } from './useInspectedPosition'

const CursorWrapper = styled.div`
  position: relative;
  width: 100%;
`

const CursorOverlay = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`

const renderStandardCursor = (x: number) => {
  return <line x1={x} x2={x} y1={0} y2="100%" stroke="currentColor" strokeWidth={2} />
}

export interface CursorProps {
  children?: ReactNode
  /** Default true. False stops publishing, drawing and selection; the plot stays mounted. */
  enabled?: boolean
  /** Default true. False makes this a display-only follower that never publishes or selects. */
  publishPosition?: boolean
  /** Default true. False hides this plot's line; hovering it still publishes. */
  showCursor?: boolean
  /** Called with the base under a click or tap inside this plot. Never called for other plots' clicks. */
  onClick?: (position: number) => void
  /** Draws the line from plot-local pixel X. Defaults to a 2px line in the current text colour. */
  renderCursor?: (x: number) => ReactNode
}

const SharedCursorOverlay = ({ renderCursor }: Pick<CursorProps, 'renderCursor'>) => {
  const position = useInspectedPosition()
  const { scalePosition, isPositionDefined } = useContext(RegionViewerContext)
  if (position === null || !isPositionDefined(position)) {
    return null
  }
  const drawCursor = renderCursor ?? renderStandardCursor
  return <CursorOverlay aria-hidden="true">{drawCursor(scalePosition(position))}</CursorOverlay>
}

const isLocalPlotEvent = (event: React.SyntheticEvent<HTMLDivElement>) => {
  const { target } = event
  return (
    target instanceof Element &&
    target.closest('[data-region-cursor]') === event.currentTarget &&
    target.closest('[data-region-viewer]') === event.currentTarget.closest('[data-region-viewer]')
  )
}

/** Wrap only plot content, inside a Track's center panel. Cursors in one RegionViewer share the hovered base. */
export const Cursor = ({
  children,
  enabled = true,
  publishPosition = true,
  showCursor = true,
  onClick,
  renderCursor
}: CursorProps): React.JSX.Element => {
  const layout = useContext(RegionViewerContext)
  const inspection = usePositionInspection()
  const source = useRef({})
  const previousLayout = useRef(layout)
  const awaitingPointerMovement = useRef(false)

  const release = () => {
    inspection.release(source.current)
  }

  useLayoutEffect(() => {
    if (previousLayout.current !== layout) {
      awaitingPointerMovement.current = true
      previousLayout.current = layout
    }
    const identity = source.current
    return () => {
      inspection.release(identity)
    }
  }, [inspection, layout, enabled, publishPosition])

  const positionUnderPointer = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left
    if (
      bounds.width <= 0 ||
      bounds.height <= 0 ||
      layout.centerPanelWidth <= 0 ||
      layout.regions.length === 0 ||
      x < 0 ||
      x > bounds.width
    ) {
      return null
    }
    return layout.scalePosition.invert((x / bounds.width) * layout.centerPanelWidth, 'nearest')
  }

  const inspectPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !publishPosition || event.pointerType === 'touch' || !isLocalPlotEvent(event)) {
      return
    }
    // SVG replacement can emit pointer-enter without movement after coordinate invalidation.
    if (event.type === 'pointerenter' && awaitingPointerMovement.current) {
      return
    }
    awaitingPointerMovement.current = false
    const position = positionUnderPointer(event)
    if (position === null) {
      release()
    } else {
      inspection.publish(source.current, position)
    }
  }

  const selectClickedPosition = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled || !publishPosition || !isLocalPlotEvent(event)) {
      return
    }
    const position = positionUnderPointer(event)
    if (position !== null) {
      onClick?.(position)
    }
  }

  return (
    // Preserve child click behavior without making pointer inspection a focus target.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <CursorWrapper
      data-region-cursor=""
      onPointerEnter={inspectPointer}
      onPointerMove={inspectPointer}
      onPointerLeave={release}
      onPointerCancel={release}
      onClick={selectClickedPosition}
    >
      {children}
      {enabled && showCursor && <SharedCursorOverlay renderCursor={renderCursor} />}
    </CursorWrapper>
  )
}
