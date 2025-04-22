import React from 'react'
import { createRoot } from 'react-dom/client'

// scripts/example.js sets a resolver alias for this
import ExampleComponent from 'example-component' // eslint-disable-line import/no-unresolved

const root = createRoot(document.getElementById('root'))
root.render(<ExampleComponent />)
