import React from 'react'
import { expect, test, describe } from '@jest/globals'
import { render } from '@testing-library/react'

import { PositionAxis } from './PositionAxis'

describe('PositionAxis', () => {
  test('has no unexpected changes', () => {
    const scalePosition = (pos: number) => pos * 2
    scalePosition.invert = (pos: number) => pos / 2

    const { asFragment } = render(<PositionAxis scalePosition={scalePosition} width={800} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
