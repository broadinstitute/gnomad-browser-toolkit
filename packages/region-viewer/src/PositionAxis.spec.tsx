import React from 'react'
import { expect, test, describe } from '@jest/globals'
import { createRoot } from 'react-dom/client'

import { PositionAxis } from './PositionAxis'

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

describe('PositionAxis', () => {
  test('has no unexpected changes', async () => {
    const scalePosition = (pos: number) => pos * 2
    scalePosition.invert = (pos: number) => pos / 2

    const container = document.createElement('div')
    const root = createRoot(container)
    root.render(<PositionAxis scalePosition={scalePosition} width={800} />)
    await flushPromises()
    expect(container).toMatchSnapshot()
  })
})
