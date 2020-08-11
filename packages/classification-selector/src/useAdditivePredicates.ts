import { useState, useMemo } from 'react'
import { Predicate } from './types'

export default <Item>(items: Item[]) => {
  const [predicates, setPredicates] = useState<Predicate<Item>[]>([])
  const filtered = useMemo(() => {
    if (predicates.length === 0) {
      return items
    } else {
      return items.filter(item => {
        for (const predicate of predicates) {
          if (predicate(item) === true) {
            return true
          }
        }
        return false
      })
    }
  }, [predicates, items])

  return [filtered, setPredicates] as const
}
