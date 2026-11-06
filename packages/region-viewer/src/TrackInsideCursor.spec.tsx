import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import React from 'react'

import { Cursor } from './Cursor'
import { RegionViewer } from './RegionViewer'
import { Track } from './Track'
import { setupTestRoot } from './testUtils'

const Plot = () => {
  return <svg />
}

describe('Track inside Cursor warning', () => {
  const testRoot = setupTestRoot()
  let warn: jest.SpiedFunction<typeof console.warn>
  const previousNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NODE_ENV = previousNodeEnv
  })

  const mount = (children: React.ReactNode) => {
    testRoot.mount(
      <RegionViewer
        width={360}
        leftPanelWidth={100}
        rightPanelWidth={160}
        regions={[{ start: 1, stop: 10 }]}
      >
        {children}
      </RegionViewer>
    )
  }

  test('a Cursor wrapping whole Tracks warns once per Track', () => {
    mount(
      <Cursor>
        <Track>{() => <Plot />}</Track>
        <Track>{() => <Plot />}</Track>
      </Cursor>
    )
    expect(warn).toHaveBeenCalledTimes(2)
    expect(String(warn.mock.calls[0][0])).toMatch(/pass positionInspection to each Track/)
  })

  test('Track positionInspection and a Cursor around a plot do not warn', () => {
    mount(
      <>
        <Track positionInspection={{}}>{() => <Plot />}</Track>
        <Track>
          {() => (
            <Cursor>
              <Plot />
            </Cursor>
          )}
        </Track>
      </>
    )
    expect(warn).not.toHaveBeenCalled()
  })

  test('production builds do not warn', () => {
    process.env.NODE_ENV = 'production'
    mount(
      <Cursor>
        <Track>{() => <Plot />}</Track>
      </Cursor>
    )
    expect(warn).not.toHaveBeenCalled()
  })
})
