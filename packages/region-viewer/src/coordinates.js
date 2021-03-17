export const mergeOverlappingRegions = regions => {
  if (regions.length === 0) {
    return []
  }

  const mergedRegions = [{ ...regions[0] }]

  let previousRegion = mergedRegions[0]

  for (let i = 1; i < regions.length; i += 1) {
    const nextRegion = regions[i]

    if (nextRegion.start <= previousRegion.stop + 1) {
      if (nextRegion.stop > previousRegion.stop) {
        previousRegion.stop = nextRegion.stop
      }
    } else {
      previousRegion = { ...nextRegion }
      mergedRegions.push(previousRegion)
    }
  }

  return mergedRegions
}

export const regionViewerScale = (domainRegions, range) => {
  const totalRegionSize = domainRegions.reduce(
    (acc, region) => acc + (region.stop - region.start + 1),
    0
  )

  const scale = position => {
    const distanceToPosition = domainRegions
      .filter(region => region.start <= position)
      .reduce(
        (acc, region) =>
          region.start <= position && position <= region.stop
            ? acc + position - region.start
            : acc + (region.stop - region.start + 1),
        0
      )

    return range[0] + (range[1] - range[0]) * (distanceToPosition / totalRegionSize)
  }

  scale.invert = x => {
    const clampedX = Math.max(Math.min(x, range[1]), range[0])
    let distanceToPosition = Math.floor(
      totalRegionSize * ((clampedX - range[0]) / (range[1] - range[0]))
    )

    for (let i = 0; i < domainRegions.length; i += 1) {
      const region = domainRegions[i]
      const regionSize = region.stop - region.start + 1
      if (distanceToPosition < regionSize) {
        return region.start + distanceToPosition
      }
      distanceToPosition -= regionSize
    }

    return domainRegions[domainRegions.length - 1].stop
  }

  return scale
}
