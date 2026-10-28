import { mergeOverlappingRegions, regionViewerScale } from './coordinates'

describe('mergeOverlappingRegions', () => {
  it('should merge overlapping regions', () => {
    expect(
      mergeOverlappingRegions([
        { start: 5, stop: 10 },
        { start: 7, stop: 12 },
        { start: 10, stop: 11 }
      ])
    ).toEqual([{ start: 5, stop: 12 }])
  })

  it('should merge adjacent regions', () => {
    expect(
      mergeOverlappingRegions([
        { start: 5, stop: 10 },
        { start: 11, stop: 14 },
        { start: 17, stop: 22 },
        { start: 22, stop: 24 }
      ])
    ).toEqual([
      { start: 5, stop: 14 },
      { start: 17, stop: 24 }
    ])
  })

  it('should handle empty list', () => {
    expect(mergeOverlappingRegions([])).toEqual([])
  })
})

describe('regionViewerScale', () => {
  it('maps positions in regions to range values', () => {
    expect(
      regionViewerScale(
        [
          { start: 1, stop: 5 },
          { start: 10, stop: 14 }
        ],
        [0, 10]
      )(2)
    ).toEqual(1)

    expect(
      regionViewerScale(
        [
          { start: 1, stop: 5 },
          { start: 10, stop: 14 }
        ],
        [0, 10]
      )(12)
    ).toEqual(7)
  })

  it('maps positions between regions to a point', () => {
    expect(
      regionViewerScale(
        [
          { start: 1, stop: 5 },
          { start: 10, stop: 14 }
        ],
        [0, 10]
      )(7)
    ).toEqual(5)

    expect(
      regionViewerScale(
        [
          { start: 1, stop: 5 },
          { start: 10, stop: 14 }
        ],
        [0, 10]
      )(9)
    ).toEqual(5)
  })

  it('clamps return values to range', () => {
    expect(
      regionViewerScale(
        [
          { start: 1, stop: 5 },
          { start: 10, stop: 14 }
        ],
        [0, 10]
      )(-5)
    ).toEqual(0)

    expect(
      regionViewerScale(
        [
          { start: 1, stop: 5 },
          { start: 10, stop: 14 }
        ],
        [0, 10]
      )(20)
    ).toEqual(10)
  })

  describe('invert', () => {
    it('maps range values to domain values', () => {
      expect(
        regionViewerScale(
          [
            { start: 1, stop: 5 },
            { start: 10, stop: 14 }
          ],
          [0, 10]
        ).invert(1)
      ).toEqual(2)

      expect(
        regionViewerScale(
          [
            { start: 1, stop: 5 },
            { start: 10, stop: 14 }
          ],
          [0, 10]
        ).invert(7)
      ).toEqual(12)

      expect(
        regionViewerScale(
          [
            { start: 1, stop: 5 },
            { start: 10, stop: 14 }
          ],
          [0, 10]
        ).invert(5)
      ).toEqual(10)
    })

    it('keeps floor rounding as the default for existing callers', () => {
      const scale = regionViewerScale(
        [
          { start: 1, stop: 5 },
          { start: 10, stop: 14 }
        ],
        [0, 100]
      )

      expect(scale.invert(49)).toBe(5)
      expect(scale.invert(79)).toBe(12)
    })

    it.each([
      [0, 1],
      [4.9, 1],
      [5, 2],
      [5.1, 2],
      [44.9, 5],
      [45, 10],
      [49, 10],
      [50, 10],
      [79, 13],
      [95, 14],
      [100, 14]
    ])('nearest rounding maps plot X=%s to displayed base %s', (x, position) => {
      const scale = regionViewerScale(
        [
          { start: 1, stop: 5 },
          { start: 10, stop: 14 }
        ],
        [0, 100]
      )

      expect(scale.invert(x, 'nearest')).toBe(position)
    })

    it('nearest rounding respects a nonzero range origin and clamps to real endpoint bases', () => {
      const scale = regionViewerScale(
        [
          { start: 1, stop: 5 },
          { start: 10, stop: 14 }
        ],
        [100, 200]
      )

      expect(scale.invert(145, 'nearest')).toBe(10)
      expect(scale.invert(99, 'nearest')).toBe(1)
      expect(scale.invert(201, 'nearest')).toBe(14)
    })

    it('clamps values outside range to domain', () => {
      expect(
        regionViewerScale(
          [
            { start: 1, stop: 5 },
            { start: 10, stop: 14 }
          ],
          [0, 10]
        ).invert(-1)
      ).toEqual(1)

      expect(
        regionViewerScale(
          [
            { start: 1, stop: 5 },
            { start: 10, stop: 14 }
          ],
          [0, 10]
        ).invert(11)
      ).toEqual(14)
    })
  })
})
