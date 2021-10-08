import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { mergeOverlappingRegions, regionViewerScale } from './coordinates'

export const RegionViewerContext = React.createContext()

const RegionViewerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: ${props => props.width}px;
`

export const RegionViewer = ({
  children,
  leftPanelWidth,
  padding,
  regions,
  rightPanelWidth,
  width,
}) => {
  const regionsWithPadding = mergeOverlappingRegions(
    [...regions]
      .sort((r1, r2) => r1.start - r2.start)
      .flatMap(region => [
        {
          feature_type: 'padding',
          start: region.start - padding,
          stop: region.start - 1,
        },
        region,
        {
          feature_type: 'padding',
          start: region.stop + 1,
          stop: region.stop + padding,
        },
      ])
  )

  const isPositionDefined = pos =>
    regionsWithPadding.some(region => region.start <= pos && pos <= region.stop)

  const centerPanelWidth = width - (leftPanelWidth + rightPanelWidth)
  const scalePosition = regionViewerScale(regionsWithPadding, [0, centerPanelWidth])

  const childProps = {
    centerPanelWidth,
    isPositionDefined,
    leftPanelWidth,
    regions: regionsWithPadding,
    rightPanelWidth,
    scalePosition,
  }

  return (
    <RegionViewerWrapper width={width}>
      <RegionViewerContext.Provider value={childProps}>{children}</RegionViewerContext.Provider>
    </RegionViewerWrapper>
  )
}

RegionViewer.propTypes = {
  children: PropTypes.node,
  leftPanelWidth: PropTypes.number,
  padding: PropTypes.number.isRequired,
  regions: PropTypes.arrayOf(
    PropTypes.shape({
      feature_type: PropTypes.string.isRequired,
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
