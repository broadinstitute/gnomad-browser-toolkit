import React from 'react'
import { expect, test, describe } from '@jest/globals'
import { createRoot } from 'react-dom/client'
import 'jest-styled-components'

import { RegionViewer } from './RegionViewer'
import { CenterPanelProps, SidePanelProps, Track } from './Track'

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

describe('Track', () => {
  const TopPanelContent = ({ width, topLabel }: { width: number; topLabel: string }) => (
    <div style={{ width }}>Top panel says "{topLabel}"</div>
  )

  const LeftPanelContent = ({ width, leftLabel }: SidePanelProps & { leftLabel: string }) => (
    <div style={{ width }}>Left panel says "{leftLabel}"</div>
  )

  const RightPanelContent = ({ width, rightLabel }: SidePanelProps & { rightLabel: string }) => (
    <div style={{ width }}>Right panel says "{rightLabel}"</div>
  )

  const CenterPanelContent = ({
    leftPanelWidth,
    regions,
    rightPanelWidth,
    scalePosition,
    width,
    centerLabel
  }: CenterPanelProps & { centerLabel: string }) => (
    <div style={{ width }}>
      Greetings from main body of the track. "{centerLabel}"
      <ul>
        <li>leftPanelWidth: {leftPanelWidth}</li>
        <li>Regions: {JSON.stringify(regions)}</li>
        <li>rightPanelWidth: {rightPanelWidth}</li>
        <li>scalePosition: {scalePosition(150)}</li>
      </ul>
    </div>
  )

  test('has no unexpected changes', async () => {
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(
      <RegionViewer
        leftPanelWidth={200}
        rightPanelWidth={110}
        regions={[{ start: 123, stop: 456 }]}
        width={1200}
      >
        <Track
          renderLeftPanel={LeftPanelContent}
          renderRightPanel={RightPanelContent}
          renderTopPanel={TopPanelContent}
          leftLabel="I am on the left"
          rightLabel="I am on the right"
          centerLabel="Right here in the center"
          topLabel="Top label as in a heading or such"
        >
          {CenterPanelContent}
        </Track>
      </RegionViewer>
    )
    await flushPromises()
    expect(container).toMatchSnapshot()
  })

  test('can omit any side panel', async () => {
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(
      <RegionViewer
        leftPanelWidth={200}
        rightPanelWidth={110}
        regions={[{ start: 123, stop: 456 }]}
        width={1200}
      >
        <Track
          renderLeftPanel={undefined}
          renderRightPanel={RightPanelContent}
          renderTopPanel={TopPanelContent}
          leftLabel="I am on the left"
          rightLabel="I am on the right"
          centerLabel="Right here in the center"
          topLabel="Top label as in a heading or such"
        >
          {CenterPanelContent}
        </Track>
      </RegionViewer>
    )
    await flushPromises()
    expect(container).toMatchSnapshot()

    root.render(
      <RegionViewer
        leftPanelWidth={200}
        rightPanelWidth={110}
        regions={[{ start: 123, stop: 456 }]}
        width={1200}
      >
        <Track
          renderLeftPanel={LeftPanelContent}
          renderRightPanel={RightPanelContent}
          renderTopPanel={undefined}
          leftLabel="I am on the left"
          rightLabel="I am on the right"
          centerLabel="Right here in the center"
          topLabel="Top label as in a heading or such"
        >
          {CenterPanelContent}
        </Track>
      </RegionViewer>
    )
    await flushPromises()
    expect(container).toMatchSnapshot()

    root.render(
      <RegionViewer
        leftPanelWidth={200}
        rightPanelWidth={110}
        regions={[{ start: 123, stop: 456 }]}
        width={1200}
      >
        <Track
          renderLeftPanel={LeftPanelContent}
          renderRightPanel={undefined}
          renderTopPanel={TopPanelContent}
          leftLabel="I am on the left"
          rightLabel="I am on the right"
          centerLabel="Right here in the center"
          topLabel="Top label as in a heading or such"
        >
          {CenterPanelContent}
        </Track>
      </RegionViewer>
    )
    await flushPromises()
    expect(container).toMatchSnapshot()
  })
})
