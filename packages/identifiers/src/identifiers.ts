const REGION_ID_REGEX = /^(chr)?(\d+|x|y|m|mt)[-:.]([\d,]+)([-:]([\d,]+)?)?$/i

export const parseRegionId = (regionId: string): { chrom: string; start: number; stop: number } => {
  const match = REGION_ID_REGEX.exec(regionId)
  if (!match) {
    throw new Error('Invalid region ID')
  }

  const chrom = match[2].toUpperCase()
  const chromNumber = Number(chrom)
  if (!Number.isNaN(chromNumber) && (chromNumber < 1 || chromNumber > 22)) {
    throw new Error('Invalid region ID')
  }

  const start = Number(match[3].replace(/,/g, ''))
  const stop = match[5] ? Number(match[5].replace(/,/g, '')) : start

  if (stop < start) {
    throw new Error('Invalid region ID')
  }

  return { chrom, start, stop }
}

export const normalizeRegionId = (regionId: string): string => {
  const { chrom, start, stop } = parseRegionId(regionId)
  return `${chrom}-${start}-${stop}`
}

export const isRegionId = (str: string): boolean => {
  try {
    parseRegionId(str)
    return true
  } catch (err) {
    return false
  }
}

const VARIANT_ID_REGEX = /^(chr)?(\d+|x|y|m|mt)[-:.]?((([\d,]+)[-:.]?([acgt]+)[-:.>]([acgt]+))|(([acgt]+)[-:.]?([\d,]+)[-:.]?([acgt]+)))$/i

export const parseVariantId = (
  variantId: string
): { chrom: string; pos: number; ref: string; alt: string } => {
  const match = VARIANT_ID_REGEX.exec(variantId)
  if (!match) {
    throw new Error('Invalid variant ID')
  }

  const chrom = match[2].toUpperCase()
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

  pos = Number(pos.replace(/,/g, ''))
  ref = ref.toUpperCase()
  alt = alt.toUpperCase()

  return { chrom, pos, ref, alt }
}

export const normalizeVariantId = (variantId: string): string => {
  const { chrom, pos, ref, alt } = parseVariantId(variantId)
  return `${chrom}-${pos}-${ref}-${alt}`
}

export const isVariantId = (str: string): boolean => {
  try {
    parseVariantId(str)
    return true
  } catch (err) {
    return false
  }
}

const RSID_REGEX = /^rs\d+$/

export const isRsId = (rsid: string): boolean => Boolean(rsid.match(RSID_REGEX))
