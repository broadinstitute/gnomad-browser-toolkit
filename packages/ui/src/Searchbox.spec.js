import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import { Searchbox } from './Searchbox'

describe('Searchbox', () => {
  test('it should render an input element', () => {
    const fetchSearchResults = jest.fn().mockImplementation(() => Promise.resolve([]))

    const { getByTestId } = render(
      <Searchbox fetchSearchResults={fetchSearchResults} onSelect={jest.fn()} />
    )
    expect(getByTestId('searchbox-input')).toBeTruthy()
  })

  test('it should set ID attribute on input element', () => {
    const fetchSearchResults = jest.fn().mockImplementation(() => Promise.resolve([]))

    const { getByTestId } = render(
      <Searchbox fetchSearchResults={fetchSearchResults} id="foo" onSelect={jest.fn()} />
    )
    expect(getByTestId('searchbox-input')).toHaveAttribute('id', 'foo')
  })

  test('it should set placeholder attribute on input element', () => {
    const fetchSearchResults = jest.fn().mockImplementation(() => Promise.resolve([]))

    const { getByTestId } = render(
      <Searchbox
        fetchSearchResults={fetchSearchResults}
        placeholder="search..."
        onSelect={jest.fn()}
      />
    )

    expect(getByTestId('searchbox-input')).toHaveAttribute('placeholder', 'search...')
  })

  test('it should fetch search results when input value changes and render results', async () => {
    const fetchSearchResults = jest.fn().mockImplementation(() =>
      Promise.resolve([
        { value: 'bar', label: 'bar' },
        { value: 'baz', label: 'baz' },
      ])
    )

    const { getByTestId, findAllByTestId } = render(
      <Searchbox fetchSearchResults={fetchSearchResults} onSelect={jest.fn()} />
    )

    const input = getByTestId('searchbox-input')
    input.focus()
    fireEvent.change(input, { target: { value: 'ba' } })
    expect(fetchSearchResults).toHaveBeenCalledWith('ba')

    const results = await findAllByTestId('searchbox-menu-item')
    expect(results).toHaveLength(2)
    expect(results[0]).toHaveTextContent('bar')
    expect(results[1]).toHaveTextContent('baz')
  })

  test('it should show an error message if fetching results fails', async () => {
    const fetchSearchResults = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error('Something went wrong')))

    const { getByTestId, findByTestId } = render(
      <Searchbox fetchSearchResults={fetchSearchResults} onSelect={jest.fn()} />
    )

    const input = getByTestId('searchbox-input')
    input.focus()
    fireEvent.change(input, { target: { value: 'ba' } })

    const results = await findByTestId('searchbox-error')
    expect(results).not.toBeNull()
  })

  test('optionally postprocesses search results', async () => {
    const fetchSearchResults = jest.fn().mockImplementation(() =>
      Promise.resolve([
        { priority: '123', id: 'xyz' },
        { priority: '456', id: 'abc' },
        { priority: 'REJECT', id: 'shouldntappear' },
      ])
    )

    const postprocessSearchResults = rawResults => {
      return rawResults
        .filter(result => result.priority !== 'REJECT')
        .sort((result1, result2) => parseInt(result2.priority) - parseInt(result1.priority))
        .map(result => ({ label: `Item ${result.id}`, value: `/page/${result.id}` }))
    }

    const { getByTestId, findAllByTestId } = render(
      <Searchbox
        fetchSearchResults={fetchSearchResults}
        postprocessSearchResults={postprocessSearchResults}
        onSelect={jest.fn()}
      />
    )

    const input = getByTestId('searchbox-input')
    input.focus()
    fireEvent.change(input, { target: { value: 'a' } })

    const results = await findAllByTestId('searchbox-menu-item')
    expect(results).toHaveLength(2)
    expect(results[0]).toHaveTextContent('Item abc')
    expect(results[1]).toHaveTextContent('Item xyz')
  })
})
