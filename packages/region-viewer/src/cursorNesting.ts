import { createContext } from 'react'

export const InsideCursorContext = createContext(false)

const isProductionBuild = (): boolean => {
  // Bundlers replace process.env.NODE_ENV but not `typeof process`; unbundled code throws here and counts as development.
  try {
    return process.env.NODE_ENV === 'production'
  } catch {
    return false
  }
}

export const warnTrackInsideCursor = (): void => {
  if (!isProductionBuild()) {
    // eslint-disable-next-line no-console
    console.warn(
      '@gnomad/region-viewer: Track rendered inside Cursor. Cursor maps hover across its own width, so wrapping whole tracks reports wrong positions. Remove the outer Cursor and pass positionInspection to each Track instead.'
    )
  }
}
