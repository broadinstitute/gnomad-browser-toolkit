import { afterEach, beforeEach, jest } from '@jest/globals'
import { configure } from '@testing-library/dom'
import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'

// @testing-library/react normally wraps fireEvent in act; this package renders with react-dom directly.
configure({
  eventWrapper: callback => {
    let result
    act(() => {
      result = callback()
    })
    return result
  }
})

export interface TestRect {
  left: number
  top?: number
  width: number
  height: number
}

// Registers per-test React root setup and teardown, and restores every jest spy afterwards.
export const setupTestRoot = () => {
  let host: HTMLDivElement
  let root: Root
  const previousActEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT')

  beforeEach(() => {
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    jest.restoreAllMocks()
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', previousActEnvironment)
  })

  return {
    host: () => host,
    mount: (element: React.ReactNode) => {
      act(() => root.render(element))
    }
  }
}

// jsdom has no layout, so every element reports the rectangle returned for it here.
export const mockElementRects = (measure: (element: HTMLElement) => TestRect) => {
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function measureElement(this: HTMLElement) {
      const { left, top = 0, width, height } = measure(this)
      return {
        x: left,
        y: top,
        left,
        top,
        right: left + width,
        bottom: top + height,
        width,
        height,
        toJSON: () => ({})
      }
    })
}
