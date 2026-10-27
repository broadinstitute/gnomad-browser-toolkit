import { afterEach, beforeEach, describe, expect, test } from '@jest/globals'
import { screen } from '@testing-library/dom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

import { PositionReadout } from './PositionReadout'

describe('standard position readout', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
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
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', previousActEnvironment)
  })

  const mount = (readout: React.ReactNode) => {
    act(() => root.render(readout))
  }

  test('uses a compact font size by default', () => {
    mount(<PositionReadout position={12} label="Coverage" value={32} />)
    expect(getComputedStyle(host.children[0]).fontSize).toBe('0.75rem')
  })

  test('lets a track size the whole readout with pixels or CSS units', () => {
    mount(<PositionReadout position={12} label="Coverage" value={32} unit="×" fontSize={11} />)
    expect(getComputedStyle(host.children[0]).fontSize).toBe('11px')
    expect(host.textContent).toBe('Coverage: 32 ×')
    mount(<PositionReadout position={12} label="Coverage" value={32} unit="×" fontSize="0.7rem" />)
    expect(getComputedStyle(host.children[0]).fontSize).toBe('0.7rem')
    expect(host.textContent).toBe('Coverage: 32 ×')
  })

  test('zero is a value, not missing data, and retains its unit', () => {
    mount(<PositionReadout position={12} label="Coverage" value={0} unit="×" />)
    expect(host.textContent).toBe('Coverage: 0 ×')
    expect(screen.queryByText('No data')).toBeNull()
  })

  test('distinguishes no active hover from an active base with no data', () => {
    mount(<PositionReadout position={null} label="Coverage" value={32} unit="×" />)
    expect(host.textContent).toBe('Coverage: Not inspecting')
    mount(<PositionReadout position={12} label="Coverage" value={null} unit="×" />)
    expect(host.textContent).toBe('Coverage: No data')
    mount(<PositionReadout position={12} label="Coverage" value={undefined} />)
    expect(host.textContent).toBe('Coverage: No data')
  })

  test('uses deterministic numeric formatting without repeating the genomic coordinate by default', () => {
    mount(<PositionReadout position={12345} label="Coverage" value={1234.56789} />)
    expect(host.textContent).toBe('Coverage: 1,234.568')
    expect(host.textContent).not.toContain('12,345')
  })

  test('can show genomic base zero and grouped coordinates explicitly', () => {
    mount(<PositionReadout position={0} label="Coverage" value={1} showPosition />)
    expect(screen.getByText('Position 0')).not.toBeNull()
    mount(<PositionReadout position={12345} label="Coverage" value={1} showPosition />)
    expect(screen.getByText('Position 12,345')).not.toBeNull()
  })

  test('supports plain text and a domain-specific formatter inside the same layout', () => {
    mount(<PositionReadout position={12} label="ClinVar" value="Pathogenic" />)
    expect(host.textContent).toBe('ClinVar: Pathogenic')
    mount(
      <PositionReadout
        position={12}
        label="Score"
        value={0.12345}
        formatValue={value => Number(value).toFixed(4)}
      />
    )
    expect(host.textContent).toBe('Score: 0.1235')
  })

  test('renders custom React content without applying numeric formatting to it', () => {
    mount(
      <PositionReadout position={12} label="ClinVar" value={<a href="#details">2 variants</a>} />
    )
    expect(screen.getByRole('link', { name: '2 variants' }).getAttribute('href')).toBe('#details')
    expect(host.textContent).toBe('ClinVar: 2 variants')
  })
})
