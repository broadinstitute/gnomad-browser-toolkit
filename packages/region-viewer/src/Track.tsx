import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'

import { Cursor, CursorProps } from './Cursor'
import { InsideCursorContext, warnTrackInsideCursor } from './cursorNesting'
import { RegionViewerContext, RegionViewerContextValue } from './RegionViewer'

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

export type TrackPositionInspection = Omit<CursorProps, 'children'>

export interface TrackProps {
  /** Omit to render the Track exactly as without inspection. `{}` opts its plot in with Cursor defaults. */
  positionInspection?: TrackPositionInspection
  renderLeftPanel?: React.FC<SidePanelProps>
  renderRightPanel?: React.FC<SidePanelProps>
  renderTopPanel?: React.FC<SidePanelProps>
  children: (props: CenterPanelProps) => React.JSX.Element
  [x: string]: unknown
}

const TrackPlot = ({
  children,
  inspection
}: {
  children: React.ReactNode
  inspection?: TrackPositionInspection
}) => {
  if (!inspection) {
    return <>{children}</>
  }
  return <Cursor {...inspection}>{children}</Cursor>
}

const defaultRenderLeftPanel = ({ title = '' }: SidePanelProps & { title: string }) => (
  <TitlePanel>
    {title.split('\n').map(s => (
      <span key={s}>{s}</span>
    ))}
  </TitlePanel>
)

export const Track = ({
  children,
  renderLeftPanel = defaultRenderLeftPanel,
  renderRightPanel,
  renderTopPanel,
  positionInspection,
  ...rest
}: TrackProps): React.JSX.Element => {
  const isInsideCursor = useContext(InsideCursorContext)
  useEffect(() => {
    if (isInsideCursor) {
      warnTrackInsideCursor()
    }
  }, [isInsideCursor])

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
                <TrackPlot inspection={positionInspection}>
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
