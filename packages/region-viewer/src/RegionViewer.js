import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { mergeOverlappingRegions, regionViewerScale } from './coordinates'

export const RegionViewerContext = React.createContext()

const RegionViewerWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export const RegionViewer = ({ children, leftPanelWidth, regions, rightPanelWidth, width }) => {
  const mergedRegions = mergeOverlappingRegions([...regions].sort((r1, r2) => r1.start - r2.start))

  const isPositionDefined = pos =>
    mergedRegions.some(region => region.start <= pos && pos <= region.stop)

  const centerPanelWidth = width - (leftPanelWidth + rightPanelWidth)
  const scalePosition = regionViewerScale(mergedRegions, [0, centerPanelWidth])

  const childProps = {
    centerPanelWidth,
    isPositionDefined,
    leftPanelWidth,
    regions,
    rightPanelWidth,
    scalePosition,
  }

  return (
    <RegionViewerWrapper style={{ width }}>
      <RegionViewerContext.Provider value={childProps}>{children}</RegionViewerContext.Provider>
    </RegionViewerWrapper>
  )
}

RegionViewer.propTypes = {
  children: PropTypes.node,
  leftPanelWidth: PropTypes.number,
  regions: PropTypes.arrayOf(
    PropTypes.shape({
      start: PropTypes.number.isRequired,
      stop: PropTypes.number.isRequired,
    })
  ).isRequired,
  rightPanelWidth: PropTypes.number,
  width: PropTypes.number.isRequired,
}

RegionViewer.defaultProps = {
  children: undefined,
  leftPanelWidth: 100,
  rightPanelWidth: 160,
}
