import React from 'react'
import { expect, test, describe } from '@jest/globals'

import { PositionAxis } from './PositionAxis'
import { setupTestRoot } from './testUtils'

describe('PositionAxis', () => {
  const testRoot = setupTestRoot()
  const { mount } = testRoot
  const host = () => testRoot.host()

  test('has no unexpected changes', () => {
    const scalePosition = (pos: number) => pos * 2
    scalePosition.invert = (pos: number) => pos / 2
    mount(<PositionAxis scalePosition={scalePosition} width={800} />)
    expect(host()).toMatchSnapshot()
  })
})
