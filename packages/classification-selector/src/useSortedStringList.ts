import { useState } from 'react'
import sortBy from 'lodash/sortBy'

export default (initial: string[] = []) => {
  const [value, setValue] = useState<string[]>(sortBy(initial))
  const sortAndSet = (vals: string[]) => {
    const sorted = sortBy(vals)
    const prevStringified = JSON.stringify(value)
    const nextStringified = JSON.stringify(sorted)
    if (prevStringified !== nextStringified) {
      setValue(sorted)
    }
  }
  return [value, sortAndSet] as const
}
