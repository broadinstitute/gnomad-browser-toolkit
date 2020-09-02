const REGION_ID_REGEX = /^(chr)?(\d+|x|y|m|mt)[-:.]([\d,]+)([-:]([\d,]+)?)?$/i

export const normalizeRegionId = regionId => {
  const match = REGION_ID_REGEX.exec(regionId)
  if (!match) {
    throw new Error('Invalid region ID')
  }

  const chrom = match[2]
  const chromNumber = Number(chrom)
  if (!Number.isNaN(chromNumber) && (chromNumber < 1 || chromNumber > 22)) {
    throw new Error('Invalid region ID')
  }

  const start = Number(match[3].replace(/,/g, ''))
  const end = match[5] ? Number(match[5].replace(/,/g, '')) : start

  if (end < start) {
    throw new Error('Invalid region ID')
  }

  return `${chrom.toUpperCase()}-${start}-${end}`
}

export const isRegionId = str => {
  try {
    normalizeRegionId(str)
    return true
  } catch (err) {
    return false
  }
}

const VARIANT_ID_REGEX = /^(chr)?(\d+|x|y|m|mt)[-:.]?((([\d,]+)[-:.]?([acgt]+)[-:.>]([acgt]+))|(([acgt]+)[-:.]?([\d,]+)[-:.]?([acgt]+)))$/i

export const normalizeVariantId = variantId => {
  const match = VARIANT_ID_REGEX.exec(variantId)
  if (!match) {
    throw new Error('Invalid variant ID')
  }

  const chrom = match[2]
  const chromNumber = Number(chrom)
  if (!Number.isNaN(chromNumber) && (chromNumber < 1 || chromNumber > 22)) {
    throw new Error('Invalid variant ID')
  }

  let pos
  let ref
  let alt

  /* eslint-disable prefer-destructuring */
  if (match[4]) {
    // chrom-pos-ref-alt
    pos = match[5]
    ref = match[6]
    alt = match[7]
  } else {
    // chrom-ref-pos-alt
    ref = match[9]
    pos = match[10]
    alt = match[11]
  }
  /* eslint-enable prefer-destructuring */

  return `${chrom}-${Number(pos.replace(/,/g, ''))}-${ref}-${alt}`.toUpperCase()
}

export const isVariantId = str => {
  try {
    normalizeVariantId(str)
    return true
  } catch (err) {
    return false
  }
}

const RSID_REGEX = /^rs\d+$/

export const isRsId = rsid => Boolean(rsid.match(RSID_REGEX))
