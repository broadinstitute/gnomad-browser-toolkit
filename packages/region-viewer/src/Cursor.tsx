import React, { ReactNode, useContext, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import styled from 'styled-components'

import {
  FloatingPositionReadout,
  PositionReadoutRenderer,
  PositionReadoutY
} from './FloatingPositionReadout'
import { usePositionInspection } from './positionInspection'
import { RegionViewerContext } from './RegionViewer'
import { useInspectedPosition } from './useInspectedPosition'

export type {
  PositionReadoutPlacement,
  PositionReadoutRenderer,
  PositionReadoutY,
  PositionReadoutYResolver
} from './FloatingPositionReadout'

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

export const defaultRenderCursor = (x: number): React.JSX.Element => {
  return (
    <rect
      x={x - 15}
      y={0}
      width={30}
      height="100%"
      fill="none"
      stroke="black"
      strokeDasharray="5, 5"
      strokeWidth={1}
    />
  )
}

const renderStandardCursor = (x: number) => {
  return <line x1={x} x2={x} y1={0} y2="100%" stroke="currentColor" strokeWidth={2} />
}

export interface CursorProps {
  children?: ReactNode
  enabled?: boolean
  publishPosition?: boolean
  showCursor?: boolean
  showGenomicPositionOnHover?: boolean
  onClick?: (position: number | null) => void
  renderCursor?: (x: number) => ReactNode
  renderPositionReadout?: PositionReadoutRenderer
  readoutY?: PositionReadoutY
}

const SharedCursorOverlay = ({
  renderCursor,
  showCursor,
  showGenomicPositionOnHover,
  renderPositionReadout,
  readoutY,
  plotRef,
  source
}: Pick<
  CursorProps,
  'renderCursor' | 'showCursor' | 'showGenomicPositionOnHover' | 'renderPositionReadout'
> & {
  readoutY: PositionReadoutY
  plotRef: React.RefObject<HTMLDivElement>
  source: object
}) => {
  const position = useInspectedPosition()
  const inspection = usePositionInspection()
  const showGenomicPosition = useSyncExternalStore(
    inspection.subscribe,
    () => showGenomicPositionOnHover === true && inspection.getSourceSnapshot() === source,
    () => false
  )
  const { scalePosition, isPositionDefined } = useContext(RegionViewerContext)
  if (position === null || !isPositionDefined(position)) {
    return null
  }
  const drawCursor = renderCursor ?? renderStandardCursor
  const x = scalePosition(position)
  return (
    <>
      {showCursor && <CursorOverlay aria-hidden="true">{drawCursor(x)}</CursorOverlay>}
      {(renderPositionReadout || showGenomicPosition) && (
        <FloatingPositionReadout
          position={position}
          x={x}
          y={readoutY}
          plotRef={plotRef}
          showGenomicPosition={showGenomicPosition}
        >
          {renderPositionReadout?.({ position })}
        </FloatingPositionReadout>
      )}
    </>
  )
}

const isLocalPlotEvent = (event: React.SyntheticEvent<HTMLDivElement>) => {
  const { target } = event
  return (
    target instanceof Element &&
    !target.closest('[data-region-readout]') &&
    target.closest('[data-region-cursor]') === event.currentTarget &&
    target.closest('[data-region-viewer]') === event.currentTarget.closest('[data-region-viewer]')
  )
}

export const Cursor = ({
  children,
  enabled = true,
  publishPosition = true,
  showCursor = true,
  showGenomicPositionOnHover = true,
  onClick,
  renderCursor,
  renderPositionReadout,
  readoutY = 'top'
}: CursorProps): React.JSX.Element => {
  const plotRef = useRef<HTMLDivElement>(null)
  const layout = useContext(RegionViewerContext)
  const inspection = usePositionInspection()
  const source = useRef({})
  const previousLayout = useRef(layout)
  const awaitingPointerMovement = useRef(false)
  const localHover = useRef<{ position: number; layout: typeof layout } | null>(null)

  const release = () => {
    localHover.current = null
    inspection.release(source.current)
  }

  useLayoutEffect(() => {
    if (previousLayout.current !== layout) {
      awaitingPointerMovement.current = true
      previousLayout.current = layout
    }
    const identity = source.current
    localHover.current = null
    return () => {
      localHover.current = null
      inspection.release(identity)
    }
  }, [inspection, layout, enabled, publishPosition])

  const inspectPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !publishPosition || event.pointerType === 'touch' || !isLocalPlotEvent(event)) {
      return
    }
    // SVG replacement can emit pointer-enter without movement after coordinate invalidation.
    if (event.type === 'pointerenter' && awaitingPointerMovement.current) {
      return
    }
    awaitingPointerMovement.current = false
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
      release()
      return
    }
    const position = layout.scalePosition.invert(
      (x / bounds.width) * layout.centerPanelWidth,
      'nearest'
    )
    localHover.current = { position, layout }
    inspection.publish(source.current, position)
  }

  const selectLocalHover = (event: React.MouseEvent<HTMLDivElement>) => {
    const hover = localHover.current
    if (enabled && publishPosition && isLocalPlotEvent(event) && hover?.layout === layout) {
      onClick?.(hover.position)
    }
  }

  return (
    // Preserve child click behavior without making pointer inspection a focus target.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <CursorWrapper
      ref={plotRef}
      data-region-cursor=""
      onPointerEnter={inspectPointer}
      onPointerMove={inspectPointer}
      onPointerLeave={release}
      onPointerCancel={release}
      onClick={selectLocalHover}
    >
      {children}
      {enabled && (showCursor || renderPositionReadout || showGenomicPositionOnHover) && (
        <SharedCursorOverlay
          renderCursor={renderCursor}
          showCursor={showCursor}
          showGenomicPositionOnHover={showGenomicPositionOnHover}
          source={source.current}
          renderPositionReadout={renderPositionReadout}
          readoutY={readoutY}
          plotRef={plotRef}
        />
      )}
    </CursorWrapper>
  )
}
