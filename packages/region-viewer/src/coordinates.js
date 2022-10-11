function reverseArr(input) {
    let ret = new Array;
    for(var i = input.length-1; i >= 0; i--) {
        ret.push(input[i]);
    }
    return ret;
}

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

export const regionViewerScale = (domainRegions, range, reverseRegions, gap) => {

  const totalRegionSize = domainRegions.reduce(
    (acc, region) => acc + (region.stop - region.start + gap),
    0
  )

  const scale = position => {

  // get regions with start values less than our position
  const domainRegionsFiltered = domainRegions.filter(region => region.start <= position)

    let distanceToPosition = domainRegionsFiltered
      .reduce(
        (acc, region) =>
          // is our position in the current region?
          region.start <= position && position <= region.stop
            // if yes, this is the final region in the list
            // (position - region.start) gives us how far into the region
            // the position is, and we add the acc (total distance accumulated before this region) 
            ? acc + position - region.start
            // if no, add the region size plus gap to our total
            : acc + (region.stop - region.start + gap),
        0
      )

    if (reverseRegions) {
      distanceToPosition = totalRegionSize - distanceToPosition
    }

    return range[0] + (range[1] - range[0]) * (distanceToPosition / totalRegionSize)
  }

  scale.invert = x => {
    const clampedX = Math.max(Math.min(x, range[1]), range[0])

    // compute fraction of region size using fraction of the plot position
    const origDistanceToPosition = Math.floor(
      totalRegionSize * ((clampedX - range[0]) / (range[1] - range[0]))
    )

    let distanceToPosition

    if (reverseRegions) {
      distanceToPosition = totalRegionSize - origDistanceToPosition
    } else {
      distanceToPosition = origDistanceToPosition
    }

    for (let i = 0; i < domainRegions.length; i += 1) {
      const region = domainRegions[i]
      const regionSize = region.stop - region.start + gap

      // is position within current region?
      if (distanceToPosition < regionSize) {

        // if yes add this to the region.start value and return
        let invertResult = region.start + distanceToPosition

        return invertResult
      }

      // if no, subtract that region size and move on to next region
      distanceToPosition -= regionSize
    }

    // if position is not in any region, it must be the last possible value
    return domainRegions[domainRegions.length - 1].stop
  }

  return scale
}

