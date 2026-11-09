import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { mergeOverlappingRegions, regionViewerScale, Region, ScalePosition } from './coordinates'
import { createPositionInspection, PositionInspectionContext } from './positionInspection'

export type RegionViewerContextValue = {
  centerPanelWidth: number
  isPositionDefined: (pos: number) => boolean
  leftPanelWidth: number
  regions: Region[]
  rightPanelWidth: number
  scalePosition: ScalePosition
}

const defaultRegionViewerContextValue: RegionViewerContextValue = {
  centerPanelWidth: 1440,
  isPositionDefined: () => false,
  leftPanelWidth: 100,
  regions: [],
  rightPanelWidth: 160,
  scalePosition: regionViewerScale([], [0, 1440])
}

export const RegionViewerContext = React.createContext<RegionViewerContextValue>(
  defaultRegionViewerContextValue
)

type Props = {
  children?: React.ReactNode
  leftPanelWidth: number
  /**
   * Compared field by field, so a new array with equal regions keeps tracks from re-rendering. Treat regions as
   * immutable: changing a region in place does not update the layout.
   */
  regions: Region[]
  rightPanelWidth: number
  width: number
}

const haveEqualFields = (a: Region, b: Region) => {
  const keys = Object.keys(a) as (keyof Region)[]
  return keys.length === Object.keys(b).length && keys.every(key => Object.is(a[key], b[key]))
}

// Writing the ref during render is safe here: the value derives only from props, so a discarded render can store
// at most an array equal to the one it replaces.
const useStableRegions = (regions: Region[]) => {
  const stableRegions = useRef(regions)
  const previous = stableRegions.current
  if (
    previous !== regions &&
    !(
      previous.length === regions.length &&
      previous.every((region, i) => haveEqualFields(region, regions[i]))
    )
  ) {
    stableRegions.current = regions
  }
  return stableRegions.current
}

const RegionViewerWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export const RegionViewer = ({
  children,
  leftPanelWidth = 100,
  regions: regionsProp,
  rightPanelWidth = 160,
  width
}: Props) => {
  const [inspection] = useState(createPositionInspection)
  const regions = useStableRegions(regionsProp)
  const mergedRegions = useMemo(
    () => mergeOverlappingRegions([...regions].sort((r1, r2) => r1.start - r2.start)),
    [regions]
  )

  const isPositionDefined = useCallback(
    (pos: number) => mergedRegions.some(region => region.start <= pos && pos <= region.stop),
    [mergedRegions]
  )

  const centerPanelWidth = width - (leftPanelWidth + rightPanelWidth)
  const scalePosition = useMemo(() => regionViewerScale(mergedRegions, [0, centerPanelWidth]), [
    mergedRegions,
    centerPanelWidth
  ])

  const childProps = useMemo(
    () => ({
      centerPanelWidth,
      isPositionDefined,
      leftPanelWidth,
      regions,
      rightPanelWidth,
      scalePosition
    }),
    [centerPanelWidth, isPositionDefined, leftPanelWidth, regions, rightPanelWidth, scalePosition]
  )

  useLayoutEffect(() => {
    inspection.clear()
  }, [inspection, childProps])

  return (
    <RegionViewerWrapper data-region-viewer="" style={{ width }}>
      <RegionViewerContext.Provider value={childProps}>
        <PositionInspectionContext.Provider value={inspection}>
          {children}
        </PositionInspectionContext.Provider>
      </RegionViewerContext.Provider>
    </RegionViewerWrapper>
  )
}
