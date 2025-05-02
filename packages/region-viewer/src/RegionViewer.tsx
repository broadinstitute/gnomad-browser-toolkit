import React from 'react'
import styled from 'styled-components'

import { mergeOverlappingRegions, regionViewerScale, Region, ScalePosition } from './coordinates'

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
  const mergedRegions = mergeOverlappingRegions([...regions].sort((r1, r2) => r1.start - r2.start))

  const isPositionDefined = (pos: number) =>
    mergedRegions.some(region => region.start <= pos && pos <= region.stop)

  const centerPanelWidth = width - (leftPanelWidth + rightPanelWidth)
  const scalePosition = regionViewerScale(mergedRegions, [0, centerPanelWidth])

  const childProps = {
    centerPanelWidth,
    isPositionDefined,
    leftPanelWidth,
    regions,
    rightPanelWidth,
    scalePosition
  }

  return (
    <RegionViewerWrapper style={{ width }}>
      <RegionViewerContext.Provider value={childProps}>{children}</RegionViewerContext.Provider>
    </RegionViewerWrapper>
  )
}
