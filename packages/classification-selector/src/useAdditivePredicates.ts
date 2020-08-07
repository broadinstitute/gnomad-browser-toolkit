import { useState } from 'react'
import { Predicate } from './types'

export default <Item>(items: Item[]) => {
  const [predicates, setPredicates] = useState<Predicate<Item>[]>([])
  const filtered = items.filter(item => {
    for (const predicate of predicates) {
      if (predicate(item) === true) {
        return true
      }
    }
    return false
  })

  return [filtered, setPredicates] as const
}
