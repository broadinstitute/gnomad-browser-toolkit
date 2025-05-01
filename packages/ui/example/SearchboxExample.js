import React, { useState } from 'react'
import { Searchbox } from '../src'

const allItems = [
  { label: 'AB', value: 'item1' },
  { label: 'ABC', value: 'item2' },
  { label: 'ABCD', value: 'item3' },
  { label: 'ABD', value: 'item4' },
  { label: 'BAR', value: 'item5' },
  { label: 'BAZ', value: 'item6' },
  { label: 'FOO', value: 'item7' },
]

const fetchSearchResults = queryTerm => {
  const lowercaseTerm = queryTerm.toLowerCase()
  const matchingResults = allItems.filter(item =>
    item.label.toLowerCase().startsWith(lowercaseTerm)
  )
  return new Promise(resolve => resolve(matchingResults))
}

const SearchboxExample = () => {
  const [selectedItem, setSelectedItem] = useState(null)
  return (
    <>
      <Searchbox
        fetchSearchResults={fetchSearchResults}
        id="searchbox"
        onSelect={setSelectedItem}
        placeholder="Enter a search term"
        width="20em"
      />
      <div>{selectedItem ? `Selected item has value ${selectedItem}` : 'No item selected'}</div>
    </>
  )
}

export default SearchboxExample
