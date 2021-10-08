import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { RegionViewerContext } from './RegionViewer'

const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
`

const TopPanel = styled.div`
  display: flex;
`

const SidePanel = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
`

const CenterPanel = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
`

const TitlePanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
`

// eslint-disable-next-line react/prop-types
const defaultRenderLeftPanel = ({ title = '' }) => (
  <TitlePanel>
    {title.split('\n').map(s => (
      <span key={s}>{s}</span>
    ))}
  </TitlePanel>
)

export const Track = ({ children, renderLeftPanel, renderRightPanel, renderTopPanel, ...rest }) => (
  <RegionViewerContext.Consumer>
    {({
      centerPanelWidth,
      isPositionDefined,
      leftPanelWidth,
      regions,
      rightPanelWidth,
      scalePosition,
    }) => (
      <OuterWrapper>
        {renderTopPanel && (
          <TopPanel
            style={{
              width: centerPanelWidth,
              marginLeft: leftPanelWidth,
              marginRight: rightPanelWidth,
            }}
          >
            {renderTopPanel({ ...rest, width: centerPanelWidth })}
          </TopPanel>
        )}
        <InnerWrapper>
          <SidePanel style={{ width: leftPanelWidth }}>
            {renderLeftPanel && renderLeftPanel({ ...rest, width: leftPanelWidth })}
          </SidePanel>
          <CenterPanel style={{ width: centerPanelWidth }}>
            {children({
              ...rest,
              isPositionDefined,
              leftPanelWidth,
              regions,
              rightPanelWidth,
              scalePosition,
              width: centerPanelWidth,
            })}
          </CenterPanel>
          {renderRightPanel && (
            <SidePanel style={{ width: rightPanelWidth }}>
              {renderRightPanel({ ...rest, width: rightPanelWidth })}
            </SidePanel>
          )}
        </InnerWrapper>
      </OuterWrapper>
    )}
  </RegionViewerContext.Consumer>
)

Track.propTypes = {
  children: PropTypes.func.isRequired,
  renderLeftPanel: PropTypes.func,
  renderRightPanel: PropTypes.func,
  renderTopPanel: PropTypes.func,
}

Track.defaultProps = {
  renderLeftPanel: defaultRenderLeftPanel,
  renderRightPanel: null,
  renderTopPanel: null,
}
