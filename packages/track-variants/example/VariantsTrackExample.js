import React, { useState } from 'react'

import { RegionViewer } from '@gnomad/region-viewer'
import { VariantTrack } from '../src/VariantTrack'

const regions = [
  {
    start: 1,
    stop: 2000
  }
]

const fakeVariants = [
  {
    variant_id: '1-345-AA-CG',
    allele_freq: 0.1345,
    pos: 345,
    consequence: 'benign'
  },
  {
    variant_id: '1-456-GCAG-C',
    allele_freq: 0.1456,
    pos: 456,
    consequence: 'plof'
  },
  {
    variant_id: '1-567-A-C',
    allele_freq: 0.1567,
    pos: 567,
    consequence: 'lof'
  },
  {
    variant_id: '1-678-A-C',
    allele_freq: 0.1678,
    pos: 678,
    consequence: 'benign'
  },
  {
    variant_id: '1-789-A-C',
    allele_freq: 0.1789,
    pos: 789,
    consequence: 'lof'
  }
]

const variantColor = variant => {
  if (variant.consequence === 'lof') {
    return '#222222'
  }
  if (variant.consequence === 'plof') {
    return '#888888'
  }
  return '#aaaaaa'
}

const VariantsTrackExample = () => {
  const [highlightedVariant, setHighlightedVariant] = useState(null)
  const onHoverVariants = variants => {
    const variant = variants[0]
    if (variant) {
      setHighlightedVariant(variant)
    }
  }

  return (
    <>
      <RegionViewer regions={regions} width={1000}>
        <VariantTrack
          variants={fakeVariants}
          variantColor={variantColor}
          onHoverVariants={onHoverVariants}
        />
      </RegionViewer>
      {highlightedVariant && (
        <div>Last highlighted variant was {highlightedVariant.variant_id}</div>
      )}
    </>
  )
}
export default VariantsTrackExample
