import { describe, expect, test } from '@jest/globals'
import { screen } from '@testing-library/dom'
import React from 'react'

import { ReadoutValue } from './ReadoutValue'
import { setupTestRoot } from './testUtils'

describe('standard position readout', () => {
  const testRoot = setupTestRoot()
  const { mount } = testRoot
  const text = () => testRoot.host().textContent
  const fontSize = () => getComputedStyle(testRoot.host().children[0]).fontSize

  test('uses a compact font size by default', () => {
    mount(<ReadoutValue label="Coverage" value={32} />)
    expect(fontSize()).toBe('0.75rem')
  })

  test('lets a track size the whole readout with pixels or CSS units', () => {
    mount(<ReadoutValue label="Coverage" value={32} unit="×" fontSize={11} />)
    expect(fontSize()).toBe('11px')
    expect(text()).toBe('Coverage: 32 ×')
    mount(<ReadoutValue label="Coverage" value={32} unit="×" fontSize="0.7rem" />)
    expect(fontSize()).toBe('0.7rem')
  })

  test('zero is a value, not missing data, and retains its unit', () => {
    mount(<ReadoutValue label="Coverage" value={0} unit="×" />)
    expect(text()).toBe('Coverage: 0 ×')
    expect(screen.queryByText('No data')).toBeNull()
  })

  test('null and undefined values show No data without the unit', () => {
    mount(<ReadoutValue label="Coverage" value={null} unit="×" />)
    expect(text()).toBe('Coverage: No data')
    mount(<ReadoutValue label="Coverage" value={undefined} />)
    expect(text()).toBe('Coverage: No data')
  })

  test('uses deterministic en-US numeric formatting', () => {
    mount(<ReadoutValue label="Coverage" value={1234.56789} />)
    expect(text()).toBe('Coverage: 1,234.568')
  })

  test('supports plain text and a domain-specific formatter inside the same layout', () => {
    mount(<ReadoutValue label="ClinVar" value="Pathogenic" />)
    expect(text()).toBe('ClinVar: Pathogenic')
    mount(
      <ReadoutValue label="Score" value={0.12345} formatValue={value => Number(value).toFixed(4)} />
    )
    expect(text()).toBe('Score: 0.1235')
  })

  test('renders custom React content without applying numeric formatting to it', () => {
    mount(<ReadoutValue label="ClinVar" value={<a href="#details">2 variants</a>} />)
    expect(screen.getByRole('link', { name: '2 variants' }).getAttribute('href')).toBe('#details')
    expect(text()).toBe('ClinVar: 2 variants')
  })
})
