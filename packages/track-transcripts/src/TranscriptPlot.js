import React from 'react'
import PropTypes from 'prop-types'

import { RegionsPlot } from '@gnomad/track-regions'

const FEATURE_COLORS = {
  exon: '#bdbdbd',
  CDS: '#424242',
  UTR: '#424242',
}

const FEATURE_HEIGHT_MULTIPLIERS = {
  exon: 0.4,
  CDS: 1.0,
  UTR: 0.4,
}

const FEATURE_ORDER = {
  exon: 0,
  UTR: 1,
  CDS: 2,
}

const featureCompareFn = (r1, r2) => FEATURE_ORDER[r1.feature_type] - FEATURE_ORDER[r2.feature_type]

const transcriptRegionKey = region => `${region.feature_type}-${region.start}-${region.stop}`

const TranscriptPlot = ({
  height,
  scalePosition,
  showUTRs,
  showNonCodingExons,
  transcript,
  width,
  ...otherProps
}) => {
  return (
    <RegionsPlot
      {...otherProps}
      height={height}
      // Sort by feature type to ensure that when regions overlap, the most important region is at the front.
      regions={transcript.exons
        .filter(
          exon =>
            exon.feature_type === 'CDS' ||
            (exon.feature_type === 'UTR' && showUTRs) ||
            (exon.feature_type === 'exon' && showNonCodingExons)
        )
        .sort(featureCompareFn)}
      regionKey={transcriptRegionKey}
      regionAttributes={exon => {
        return {
          fill: FEATURE_COLORS[exon.feature_type] || 'gray',
          height: height * (FEATURE_HEIGHT_MULTIPLIERS[exon.feature_type] || 1.0),
        }
      }}
      scalePosition={scalePosition}
      width={width}
    />
  )
}

TranscriptPlot.propTypes = {
  height: PropTypes.number,
  scalePosition: PropTypes.func.isRequired,
  showNonCodingExons: PropTypes.bool,
  showUTRs: PropTypes.bool,
  transcript: PropTypes.shape({
    exons: PropTypes.arrayOf(
      PropTypes.shape({
        feature_type: PropTypes.string.isRequired,
        start: PropTypes.number.isRequired,
        stop: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  width: PropTypes.number.isRequired,
}

TranscriptPlot.defaultProps = {
  height: 10,
  showNonCodingExons: false,
  showUTRs: false,
}

export default TranscriptPlot
