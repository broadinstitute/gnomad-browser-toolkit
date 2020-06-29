import React from 'react'
import { render } from 'react-dom'

// scripts/example.js sets a resolver alias for this
import ExampleComponent from 'example-component' // eslint-disable-line import/no-unresolved

render(<ExampleComponent />, document.getElementById('root'))
