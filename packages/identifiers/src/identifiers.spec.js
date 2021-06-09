import {
  isRegionId,
  parseRegionId,
  normalizeRegionId,
  isVariantId,
  parseVariantId,
  normalizeVariantId,
  isRsId,
} from './identifiers'

const test = (fn, positiveTestCases, negativeTestCases) => {
  positiveTestCases.forEach(query => {
    it(`should return true for "${query}"`, () => {
      expect(fn(query)).toBe(true)
    })
  })

  negativeTestCases.forEach(query => {
    it(`should return false for "${query}"`, () => {
      expect(fn(query)).toBe(false)
    })
  })
}

describe('isRegionId', () => {
  const positiveTestCases = [
    'chr1-13414',
    '1-15342343-15342563',
    '1:15342343-15342563',
    'CHR3-12433-19000',
    '3:2592432',
    'chrX-23532-',
    '2-35324:',
    'y-712321-811232',
    '6:391518-3851275',
    '1:55,505,222-55,530,526',
    'm.300',
    'chr2 500 600',
    '5/247,300/248,175',
    '1\u201315342343\u201415342563',
    '1_15342343_15342563',
    '1|15342343|15342563',
  ]

  const negativeTestCases = ['chr1-', '5-1243421-a', '3-356788-123245', '54-12432-15440']

  test(isRegionId, positiveTestCases, negativeTestCases)
})

describe('parseRegionId', () => {
  const testCases = [
    { input: 'chr1-13414', parsed: { chrom: '1', start: 13414, stop: 13414 } },
    { input: '1-15342343-15342563', parsed: { chrom: '1', start: 15342343, stop: 15342563 } },
    { input: '1:15342343-15342563', parsed: { chrom: '1', start: 15342343, stop: 15342563 } },
    { input: '1:00042343-00042563', parsed: { chrom: '1', start: 42343, stop: 42563 } },
    { input: 'CHR3-12433-19000', parsed: { chrom: '3', start: 12433, stop: 19000 } },
    { input: '3:2592432', parsed: { chrom: '3', start: 2592432, stop: 2592432 } },
    { input: 'chrX-23532-', parsed: { chrom: 'X', start: 23532, stop: 23532 } },
    { input: '2-35324:', parsed: { chrom: '2', start: 35324, stop: 35324 } },
    { input: 'y-712321-811232', parsed: { chrom: 'Y', start: 712321, stop: 811232 } },
    { input: '3-10', parsed: { chrom: '3', start: 10, stop: 10 } },
    { input: '1:55,505,222-55,530,526', parsed: { chrom: '1', start: 55505222, stop: 55530526 } },
    { input: 'm.300-320', parsed: { chrom: 'M', start: 300, stop: 320 } },
    { input: 'chr2 500 600', parsed: { chrom: '2', start: 500, stop: 600 } },
    { input: '5/247,300/248,175', parsed: { chrom: '5', start: 247300, stop: 248175 } },
    {
      input: '1\u201315342343\u201415342563',
      parsed: { chrom: '1', start: 15342343, stop: 15342563 },
    },
    { input: '1_15342343_15342563', parsed: { chrom: '1', start: 15342343, stop: 15342563 } },
    { input: '1|15342343|15342563', parsed: { chrom: '1', start: 15342343, stop: 15342563 } },
  ]

  testCases.forEach(({ input, parsed }) => {
    it(`should parse ${input} to ${parsed}`, () => {
      expect(parseRegionId(input)).toStrictEqual(parsed)
    })
  })

  it('should throw an error on invalid region IDs', () => {
    const negativeTestCases = ['chr1-', '5-1243421-a', '3-356788-123245', '54-12432-15440']
    negativeTestCases.forEach(str => {
      expect(() => parseRegionId(str)).toThrow('Invalid region ID')
    })
  })
})

describe('normalizeRegionId', () => {
  const testCases = [
    { input: 'chr1-13414', normalized: '1-13414-13414' },
    { input: '1-15342343-15342563', normalized: '1-15342343-15342563' },
    { input: '1:15342343-15342563', normalized: '1-15342343-15342563' },
    { input: '1:00042343-00042563', normalized: '1-42343-42563' },
    { input: 'CHR3-12433-19000', normalized: '3-12433-19000' },
    { input: '3:2592432', normalized: '3-2592432-2592432' },
    { input: 'chrX-23532-', normalized: 'X-23532-23532' },
    { input: '2-35324:', normalized: '2-35324-35324' },
    { input: 'y-712321-811232', normalized: 'Y-712321-811232' },
    { input: '3-10', normalized: '3-10-10' },
    { input: '1:55,505,222-55,530,526', normalized: '1-55505222-55530526' },
    { input: 'm.300-320', normalized: 'M-300-320' },
    { input: 'chr2 500 600', normalized: '2-500-600' },
    { input: '5/247,300/248,175', normalized: '5-247300-248175' },
    { input: '1\u201315342343\u201415342563', normalized: '1-15342343-15342563' },
    { input: '1_15342343_15342563', normalized: '1-15342343-15342563' },
    { input: '1|15342343|15342563', normalized: '1-15342343-15342563' },
  ]

  testCases.forEach(({ input, normalized }) => {
    it(`should normalize ${input} to ${normalized}`, () => {
      expect(normalizeRegionId(input)).toBe(normalized)
    })
  })
})

describe('isVariantId', () => {
  const positiveTestCases = [
    'chr1-13414-a-c',
    'chr1:13414:a:c',
    '1-15342343-cagc-t',
    '2-000123-A-G',
    'CHR3-12433-A-GATC',
    '1-55,516,888-G-GA',
    'm.300-G-A',
    'm.A3243G',
    '3-7643T>C',
    'chr11C308G',
    '21:47406495 CT>C',
    '1:55516888  G/GA',
    '1_55516888_G_GA',
    '1|55516888|G|GA',
  ]

  const negativeTestCases = [
    'chr1-',
    'chr2-532434',
    '5-1243421-a-z',
    '6-1a1bc-a-gc',
    'R-1242-A-T',
    'chrX-23532-cG',
    'y-712321-a-',
    'm.B3243C',
    '4-123A->G',
    '2A100T100G',
    '2.100T200A',
    '1T-100-A-G',
    '32-100-C-T',
  ]

  test(isVariantId, positiveTestCases, negativeTestCases)
})

describe('parseVariantId', () => {
  const testCases = [
    { input: 'chr1-13414-a-c', parsed: { chrom: '1', pos: 13414, ref: 'A', alt: 'C' } },
    { input: 'chr1:13414:a:c', parsed: { chrom: '1', pos: 13414, ref: 'A', alt: 'C' } },
    { input: '1-15342343-cagc-t', parsed: { chrom: '1', pos: 15342343, ref: 'CAGC', alt: 'T' } },
    { input: '1-00042343-G-T', parsed: { chrom: '1', pos: 42343, ref: 'G', alt: 'T' } },
    { input: 'CHR3-12433-A-GATC', parsed: { chrom: '3', pos: 12433, ref: 'A', alt: 'GATC' } },
    { input: '1-55,516,888-G-GA', parsed: { chrom: '1', pos: 55516888, ref: 'G', alt: 'GA' } },
    { input: 'm.300-G-A', parsed: { chrom: 'M', pos: 300, ref: 'G', alt: 'A' } },
    { input: 'm.A3243G', parsed: { chrom: 'M', pos: 3243, ref: 'A', alt: 'G' } },
    { input: '3-7643T>C', parsed: { chrom: '3', pos: 7643, ref: 'T', alt: 'C' } },
    { input: 'chr11C308G', parsed: { chrom: '11', pos: 308, ref: 'C', alt: 'G' } },
    { input: '1G55,516,888GA', parsed: { chrom: '1', pos: 55516888, ref: 'G', alt: 'GA' } },
    { input: '21:47406495 CT>C', parsed: { chrom: '21', pos: 47406495, ref: 'CT', alt: 'C' } },
    { input: '1:55516888  G/GA', parsed: { chrom: '1', pos: 55516888, ref: 'G', alt: 'GA' } },
    {
      input: '1\u201355516888\u2014G\u2014GA',
      parsed: { chrom: '1', pos: 55516888, ref: 'G', alt: 'GA' },
    },
    { input: '1_55516888_G_GA', parsed: { chrom: '1', pos: 55516888, ref: 'G', alt: 'GA' } },
    { input: '1|55516888|G|GA', parsed: { chrom: '1', pos: 55516888, ref: 'G', alt: 'GA' } },
  ]

  testCases.forEach(({ input, parsed }) => {
    it(`should parse ${input} to ${parsed}`, () => {
      expect(parseVariantId(input)).toStrictEqual(parsed)
    })
  })

  it('should throw an error on invalid variant IDs', () => {
    const negativeTestCases = [
      'chr1-',
      'chr2-532434',
      '5-1243421-a-z',
      '6-1a1bc-a-gc',
      'R-1242-A-T',
      'chrX-23532-cG',
      'y-712321-a-',
      'm.B3243C',
      '4-123A->G',
      '2A100T100G',
      '2.100T200A',
      '1T-100-A-G',
      '32-100-C-T',
    ]

    negativeTestCases.forEach(str => {
      expect(() => parseVariantId(str)).toThrow('Invalid variant ID')
    })
  })
})

describe('normalizeVariantId', () => {
  const testCases = [
    { input: 'chr1-13414-a-c', normalized: '1-13414-A-C' },
    { input: 'chr1:13414:a:c', normalized: '1-13414-A-C' },
    { input: '1-15342343-cagc-t', normalized: '1-15342343-CAGC-T' },
    { input: '1-00042343-G-T', normalized: '1-42343-G-T' },
    { input: 'CHR3-12433-A-GATC', normalized: '3-12433-A-GATC' },
    { input: '1-55,516,888-G-GA', normalized: '1-55516888-G-GA' },
    { input: 'm.300-G-A', normalized: 'M-300-G-A' },
    { input: 'm.A3243G', normalized: 'M-3243-A-G' },
    { input: '3-7643T>C', normalized: '3-7643-T-C' },
    { input: 'chr11C308G', normalized: '11-308-C-G' },
    { input: '1G55,516,888GA', normalized: '1-55516888-G-GA' },
    { input: '21:47406495 CT>C', normalized: '21-47406495-CT-C' },
    { input: '1:55516888  G/GA', normalized: '1-55516888-G-GA' },
    {
      input: '1\u201355516888\u2014G\u2014GA',
      normalized: '1-55516888-G-GA',
    },
    { input: '1_55516888_G_GA', normalized: '1-55516888-G-GA' },
    { input: '1|55516888|G|GA', normalized: '1-55516888-G-GA' },
  ]

  testCases.forEach(({ input, normalized }) => {
    it(`should normalize ${input} to ${normalized}`, () => {
      expect(normalizeVariantId(input)).toBe(normalized)
    })
  })
})

describe('isRsId', () => {
  const positiveTestCases = ['rs123', 'rs4']

  const negativeTestCases = ['rs', 'RS123', 'rs123abc']

  test(isRsId, positiveTestCases, negativeTestCases)
})
