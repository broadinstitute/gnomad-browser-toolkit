import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react'
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
  regions: Region[]
  rightPanelWidth: number
  width: number
}

const RegionViewerWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export const RegionViewer = ({
  children,
  leftPanelWidth = 100,
  regions,
  rightPanelWidth = 160,
  width
}: Props) => {
  const [inspection] = useState(createPositionInspection)
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
