import React, { useContext } from 'react'
import { expect, test, describe } from '@jest/globals'
import 'jest-styled-components'

import { RegionViewer, RegionViewerContext } from './RegionViewer'
import { setupTestRoot } from './testUtils'

const makeFieldConsumer = (fieldName: string) => {
  return () => {
    const context = useContext(RegionViewerContext)
    return <div>{JSON.stringify(context[fieldName])}</div>
  }
}

describe('RegionViewer', () => {
  const testRoot = setupTestRoot()
  const { mount } = testRoot
  const host = () => testRoot.host()

  test('makes centerPanelWidth available via context, calculating it by overall width minus panel widths', () => {
    const Consumer = makeFieldConsumer('centerPanelWidth')

    mount(
      <RegionViewer leftPanelWidth={130} rightPanelWidth={320} width={800} regions={[]}>
        <Consumer />
      </RegionViewer>
    )
    expect(host()).toMatchSnapshot()
  })

  test("makes isPositionDefined available via context, which indicates if a given position lies within any of the track's regions", () => {
    const regions = [
      { start: 91, stop: 109 },
      { start: 191, stop: 209 }
    ]

    const Consumer = () => {
      const context = useContext(RegionViewerContext)
      return (
        <>
          <div>{context.isPositionDefined(90) && 'yes'}</div>
          <div>{context.isPositionDefined(100) && 'yes'}</div>
          <div>{context.isPositionDefined(110) && 'yes'}</div>
          <div>{context.isPositionDefined(190) && 'yes'}</div>
          <div>{context.isPositionDefined(200) && 'yes'}</div>
          <div>{context.isPositionDefined(210) && 'yes'}</div>
        </>
      )
    }
    mount(
      <RegionViewer leftPanelWidth={130} rightPanelWidth={320} width={800} regions={regions}>
        <Consumer />
      </RegionViewer>
    )
    expect(host()).toMatchSnapshot()
  })

  test('makes leftPanelWidth available via context', () => {
    const Consumer = makeFieldConsumer('leftPanelWidth')
    mount(
      <RegionViewer leftPanelWidth={130} rightPanelWidth={320} width={800} regions={[]}>
        <Consumer />
      </RegionViewer>
    )
    expect(host()).toMatchSnapshot()
  })

  test('makes regions available via context', () => {
    const Consumer = makeFieldConsumer('regions')
    mount(
      <RegionViewer
        leftPanelWidth={130}
        rightPanelWidth={320}
        width={800}
        regions={[
          { start: 123, stop: 456 },
          { start: 789, stop: 1011 }
        ]}
      >
        <Consumer />
      </RegionViewer>
    )
    expect(host()).toMatchSnapshot()
  })

  test('makes rightPanelWidth available via context', () => {
    const Consumer = makeFieldConsumer('rightPanelWidth')

    mount(
      <RegionViewer leftPanelWidth={130} rightPanelWidth={320} width={800} regions={[]}>
        <Consumer />
      </RegionViewer>
    )
    expect(host()).toMatchSnapshot()
  })

  test('makes scalePosition available via context', () => {
    const regions = [
      { start: 91, stop: 109 },
      { start: 191, stop: 209 },
      { start: 321, stop: 381 }
    ]

    const Consumer = () => {
      const context = useContext(RegionViewerContext)
      return (
        <>
          <div>{context.scalePosition(100)}</div>
          <div>{context.scalePosition(110)}</div>
          <div>{context.scalePosition(190)}</div>
          <div>{context.scalePosition(200)}</div>
          <div>{context.scalePosition(210)}</div>
          <div>{context.scalePosition(311)}</div>
          <div>{context.scalePosition(331)}</div>
          <div>{context.scalePosition(382)}</div>
        </>
      )
    }
    mount(
      <RegionViewer leftPanelWidth={130} rightPanelWidth={320} width={800} regions={regions}>
        <Consumer />
      </RegionViewer>
    )
    expect(host()).toMatchSnapshot()
  })
})
