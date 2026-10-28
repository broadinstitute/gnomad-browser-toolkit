import { createContext, useContext } from 'react'

interface PositionInspectionStore {
  getSnapshot: () => number | null
  getSourceSnapshot: () => object | null
  getServerSnapshot: () => null
  subscribe: (notify: () => void) => () => void
  publish: (source: object, position: number) => void
  release: (source: object) => void
  clear: () => void
}

export const createPositionInspection = (): PositionInspectionStore => {
  let position: number | null = null
  let source: object | null = null
  const listeners = new Set<() => void>()

  const setInspection = (nextSource: object | null, nextPosition: number | null) => {
    if (source !== nextSource || position !== nextPosition) {
      source = nextSource
      position = nextPosition
      listeners.forEach(notify => notify())
    }
  }

  return {
    getSnapshot: () => position,
    getSourceSnapshot: () => source,
    getServerSnapshot: (): null => null,
    subscribe(notify: () => void) {
      listeners.add(notify)
      return () => {
        listeners.delete(notify)
      }
    },
    publish(nextSource: object, nextPosition: number) {
      setInspection(nextSource, nextPosition)
    },
    release(previousSource: object) {
      if (source === previousSource) {
        setInspection(null, null)
      }
    },
    clear() {
      setInspection(null, null)
    }
  }
}

export const PositionInspectionContext = createContext<ReturnType<
  typeof createPositionInspection
> | null>(null)

export const usePositionInspection = (): ReturnType<typeof createPositionInspection> => {
  const inspection = useContext(PositionInspectionContext)
  if (!inspection) {
    throw new Error('Mount cursor inspection components inside a RegionViewer.')
  }
  return inspection
}
