// The Unicode flag is not supported in IE 11.
const isRegExpUnicodeFlagSupported = (() => {
  try {
    new RegExp('test', 'u') // eslint-disable-line no-new
    return true
  } catch (err) {
    return false
  }
})()

const CHROMOSOME = '(?:chr)?(?:\\d+|x|y|m|mt)'
const POSITION = '[\\d,]+'
const DASH = isRegExpUnicodeFlagSupported ? '\\p{Pd}' : '-'
const SEPARATOR = `(?:${DASH}|[:./_|]|\\s+)`

const REGEXP_FLAGS = `i${isRegExpUnicodeFlagSupported ? 'u' : ''}`

const REGION_ID_REGEX = new RegExp(
  `(${CHROMOSOME})${SEPARATOR}(${POSITION})(?:${SEPARATOR}(${POSITION})?)?$`,
  REGEXP_FLAGS
)

export const parseRegionId = (regionId: string) => {
  const match = REGION_ID_REGEX.exec(regionId)
  if (!match) {
    throw new Error('Invalid region ID')
  }

  const chrom = match[1].toUpperCase().replace(/^chr/i, '')
  const chromNumber = Number(chrom)
  if (!Number.isNaN(chromNumber) && (chromNumber < 1 || chromNumber > 22)) {
    throw new Error('Invalid region ID')
  }

  const start = Number(match[2].replace(/,/g, ''))
  const stop = match[3] ? Number(match[3].replace(/,/g, '')) : start

  if (stop < start) {
    throw new Error('Invalid region ID')
  }

  return { chrom, start, stop }
}

export const normalizeRegionId = (regionId: string) => {
  const { chrom, start, stop } = parseRegionId(regionId)
  return `${chrom}-${start}-${stop}`
}

export const isRegionId = (str: string) => {
  try {
    parseRegionId(str)
    return true
  } catch (err) {
    return false
  }
}

const ALLELE = '[acgt]+'

const VARIANT_ID_REGEX = new RegExp(
  `^(${CHROMOSOME})${SEPARATOR}?(?:((${POSITION})${SEPARATOR}?(${ALLELE})(?:${SEPARATOR}|>)(${ALLELE}))|((${ALLELE})${SEPARATOR}?(${POSITION})${SEPARATOR}?(${ALLELE})))$`,
  REGEXP_FLAGS
)

export const parseVariantId = (variantId: string) => {
  const match = VARIANT_ID_REGEX.exec(variantId)
  if (!match) {
    throw new Error('Invalid variant ID')
  }

  const chrom = match[1].toUpperCase().replace(/^chr/i, '')
  const chromNumber = Number(chrom)
  if (!Number.isNaN(chromNumber) && (chromNumber < 1 || chromNumber > 22)) {
    throw new Error('Invalid variant ID')
  }

  let pos
  let ref
  let alt

  /* eslint-disable prefer-destructuring */
  if (match[2]) {
    // chrom-pos-ref-alt
    pos = match[3]
    ref = match[4]
    alt = match[5]
  } else {
    // chrom-ref-pos-alt
    ref = match[7]
    pos = match[8]
    alt = match[9]
  }
  /* eslint-enable prefer-destructuring */

  pos = Number(pos.replace(/,/g, ''))
  ref = ref.toUpperCase()
  alt = alt.toUpperCase()

  return { chrom, pos, ref, alt }
}

export const normalizeVariantId = (variantId: string) => {
  const { chrom, pos, ref, alt } = parseVariantId(variantId)
  return `${chrom}-${pos}-${ref}-${alt}`
}

export const isVariantId = (str: string) => {
  try {
    parseVariantId(str)
    return true
  } catch (err) {
    return false
  }
}

const RSID_REGEX = /^rs\d+$/

export const isRsId = (rsid: string) => Boolean(rsid.match(RSID_REGEX))
