import React, { memo, useContext } from 'react'
import { expect, test, describe, jest } from '@jest/globals'
import 'jest-styled-components'

import { RegionViewer, RegionViewerContext, RegionViewerContextValue } from './RegionViewer'
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

  test('keeps layout consumers stable while preserving data, width, and region updates', () => {
    const observeLayout = jest.fn<(layout: RegionViewerContextValue) => void>()
    const regions = [{ start: 1, stop: 10 }]
    const Consumer = memo(({ position }: { position: number }) => {
      const layout = useContext(RegionViewerContext)
      observeLayout(layout)
      return <output>{layout.scalePosition(position)}</output>
    })
    const render = (width = 360, currentRegions = regions, position = 5) => {
      mount(
        <RegionViewer
          width={width}
          leftPanelWidth={100}
          rightPanelWidth={160}
          regions={currentRegions}
        >
          <Consumer position={position} />
        </RegionViewer>
      )
    }

    render()
    const initialLayout = observeLayout.mock.calls[0][0]
    expect(host().textContent).toBe('40')
    render()
    expect(observeLayout).toHaveBeenCalledTimes(1)

    render(360, regions, 6)
    expect(host().textContent).toBe('50')
    expect(observeLayout.mock.calls[1][0]).toBe(initialLayout)

    render(460, regions, 6)
    expect(host().textContent).toBe('100')
    expect(observeLayout.mock.calls[2][0]).not.toBe(initialLayout)

    render(460, [{ start: 20, stop: 29 }], 25)
    expect(host().textContent).toBe('100')
    expect(observeLayout.mock.calls[3][0].isPositionDefined(25)).toBe(true)
    expect(observeLayout.mock.calls[3][0].isPositionDefined(6)).toBe(false)
  })

  test('a new regions array with equal fields keeps the layout context', () => {
    const observeLayout = jest.fn<(layout: RegionViewerContextValue) => void>()
    const Consumer = memo(() => {
      observeLayout(useContext(RegionViewerContext))
      return null
    })
    const render = (regions: { start: number; stop: number; label?: string }[]) => {
      mount(
        <RegionViewer width={360} leftPanelWidth={100} rightPanelWidth={160} regions={regions}>
          <Consumer />
        </RegionViewer>
      )
    }

    render([{ start: 1, stop: 10, label: 'a' }])
    render([{ start: 1, stop: 10, label: 'a' }])
    expect(observeLayout).toHaveBeenCalledTimes(1)

    render([{ start: 1, stop: 10, label: 'b' }])
    expect(observeLayout).toHaveBeenCalledTimes(2)
    expect(observeLayout.mock.calls[1][0].regions).toEqual([{ start: 1, stop: 10, label: 'b' }])
  })

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
