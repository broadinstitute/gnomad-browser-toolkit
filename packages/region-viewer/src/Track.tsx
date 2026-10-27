import React from 'react'
import styled from 'styled-components'

import { Cursor, CursorProps, PositionReadoutRenderer } from './Cursor'
import { RegionViewerContext, RegionViewerContextValue } from './RegionViewer'

export type { PositionReadoutRenderer } from './Cursor'

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

export interface SidePanelProps {
  width: number
}

type _CenterPanelProps = Omit<RegionViewerContextValue, 'centerPanelWidth'> & { width: number }

export interface CenterPanelProps extends _CenterPanelProps {}

export type TrackPositionInspection = Omit<CursorProps, 'children' | 'renderPositionReadout'>

export interface TrackProps {
  positionInspection?: TrackPositionInspection
  renderPositionReadout?: PositionReadoutRenderer
  renderLeftPanel?: React.FC<SidePanelProps>
  renderRightPanel?: React.FC<SidePanelProps>
  renderTopPanel?: React.FC<SidePanelProps>
  children: (props: CenterPanelProps) => React.JSX.Element
  [x: string]: unknown
}

const defaultRenderLeftPanel = ({ title = '' }: SidePanelProps & { title: string }) => (
  <TitlePanel>
    {title.split('\n').map(s => (
      <span key={s}>{s}</span>
    ))}
  </TitlePanel>
)

const TrackPlot = ({
  children,
  inspection,
  renderReadout
}: {
  children: React.ReactNode
  inspection?: TrackPositionInspection
  renderReadout?: PositionReadoutRenderer
}) => {
  if (!inspection) {
    return <>{children}</>
  }
  return (
    <Cursor
      enabled={inspection.enabled}
      publishPosition={inspection.publishPosition}
      showCursor={inspection.showCursor}
      onClick={inspection.onClick}
      renderCursor={inspection.renderCursor}
      renderPositionReadout={renderReadout}
      readoutY={inspection.readoutY}
    >
      {children}
    </Cursor>
  )
}

export const Track = ({
  children,
  renderLeftPanel = defaultRenderLeftPanel,
  renderRightPanel,
  renderTopPanel,
  positionInspection,
  renderPositionReadout,
  ...rest
}: TrackProps): React.JSX.Element => {
  return (
    <RegionViewerContext.Consumer>
      {({
        centerPanelWidth,
        isPositionDefined,
        leftPanelWidth,
        regions,
        rightPanelWidth,
        scalePosition
      }) => {
        return (
          <OuterWrapper>
            {renderTopPanel && (
              <TopPanel
                style={{
                  width: centerPanelWidth,
                  marginLeft: leftPanelWidth,
                  marginRight: rightPanelWidth
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
                <TrackPlot inspection={positionInspection} renderReadout={renderPositionReadout}>
                  {children({
                    ...rest,
                    width: centerPanelWidth,
                    isPositionDefined,
                    leftPanelWidth,
                    regions,
                    rightPanelWidth,
                    scalePosition
                  })}
                </TrackPlot>
              </CenterPanel>
              {renderRightPanel && (
                <SidePanel style={{ width: rightPanelWidth }}>
                  {renderRightPanel({ ...rest, width: rightPanelWidth })}
                </SidePanel>
              )}
            </InnerWrapper>
          </OuterWrapper>
        )
      }}
    </RegionViewerContext.Consumer>
  )
}
