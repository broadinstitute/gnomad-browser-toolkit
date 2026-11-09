import { useSyncExternalStore } from 'react'

import { usePositionInspection } from './positionInspection'

export const useInspectedPosition = (): number | null => {
  const inspection = usePositionInspection()
  return useSyncExternalStore(
    inspection.subscribe,
    inspection.getSnapshot,
    inspection.getServerSnapshot
  )
}
