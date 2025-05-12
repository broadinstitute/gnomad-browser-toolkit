import React, { useContext } from 'react'
import { expect, test, describe } from '@jest/globals'
import { RegionViewer, RegionViewerContext } from './RegionViewer'
import { render, screen } from '@testing-library/react'
import { createRoot } from 'react-dom/client'
import { userEvent } from '@testing-library/user-event'
import styled from 'styled-components'

import { Cursor } from './Cursor'

// Borrowed from Track.js
const InnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
`

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

describe('Cursor', () => {
  const renderCursor = (x: number) => (
    <rect
      x={x - 20}
      y={0}
      width={40}
      height="90%"
      fill="orange"
      stroke="purple"
      strokeDasharray="2, 3"
      strokeWidth={7}
    />
  )

  const regions = [
    { start: 91, stop: 109 },
    { start: 191, stop: 209 },
    { start: 321, stop: 381 }
  ]

  test('has no unexpected changes', async () => {
    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(
      <RegionViewer leftPanelWidth={130} rightPanelWidth={320} width={800} regions={regions}>
        <Cursor onClick={() => {}} renderCursor={renderCursor}>
          <div>some cursor child content goes here</div>
        </Cursor>
      </RegionViewer>
    )
    await flushPromises()
    expect(container).toMatchSnapshot()
  })

  test.skip('renders a cursor in the correct place if mouse is over the center panel', async () => {
    const LeftPanel = () => {
      const { leftPanelWidth } = useContext(RegionViewerContext)
      return <div style={{ width: leftPanelWidth }}>Left panel content</div>
    }

    const CenterPanel = () => {
      const { centerPanelWidth } = useContext(RegionViewerContext)
      return <div style={{ width: centerPanelWidth }}>Center panel content</div>
    }

    const RightPanel = () => {
      const { rightPanelWidth } = useContext(RegionViewerContext)
      return <div style={{ width: rightPanelWidth }}>Right panel content</div>
    }

    const user = userEvent.setup()

    render(
      <RegionViewer leftPanelWidth={130} rightPanelWidth={320} width={800} regions={regions}>
        <Cursor onClick={() => {}} renderCursor={renderCursor}>
          <InnerWrapper>
            <LeftPanel />
            <CenterPanel />
            <RightPanel />
          </InnerWrapper>
        </Cursor>
      </RegionViewer>
    )

    const centerPanel = screen.getByText('Center panel content')
    user.pointer({ target: centerPanel })
    expect(await screen.findAllByRole('img')).toHaveLength(1)

    const leftPanel = screen.getByText('Left panel content')
    user.pointer({ target: leftPanel })
    expect(screen.getByRole('img')).toEqual([])

    user.pointer({ target: centerPanel })
    expect(await screen.findAllByRole('img')).toHaveLength(1)

    const rightPanel = screen.getByText('Right panel content')
    user.pointer({ target: rightPanel })
    expect(screen.queryAllByRole('img')).toEqual([])

    user.pointer({ target: centerPanel })
    expect(await screen.findAllByRole('img')).toHaveLength(1)
  })

  test.todo('receives clicks with on-screen x coordinate converted to geno,mic coordinate')
})
