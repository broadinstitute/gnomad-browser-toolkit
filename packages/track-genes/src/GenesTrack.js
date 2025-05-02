import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { Track } from '@gnomad/region-viewer'

import { GenesPlot } from './GenesPlot'

const TitlePanel = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

export const GenesTrack = ({ genes, includeNonCodingGenes, renderGeneLabel, title }) => (
  <Track renderLeftPanel={() => <TitlePanel>{title}</TitlePanel>}>
    {({ scalePosition, width }) => {
      return (
        <GenesPlot
          genes={genes}
          includeNonCodingGenes={includeNonCodingGenes}
          renderGeneLabel={renderGeneLabel}
          scalePosition={scalePosition}
          width={width}
        />
      )
    }}
  </Track>
)

GenesTrack.propTypes = {
  genes: PropTypes.arrayOf(
    PropTypes.shape({
      gene_id: PropTypes.string.isRequired,
      start: PropTypes.number.isRequired,
      stop: PropTypes.number.isRequired,
      exons: PropTypes.arrayOf(
        PropTypes.shape({
          feature_type: PropTypes.oneOf(['CDS', 'exon', 'UTR']).isRequired,
          start: PropTypes.number.isRequired,
          stop: PropTypes.number.isRequired
        })
      ).isRequired
    })
  ).isRequired,
  includeNonCodingGenes: PropTypes.bool,
  renderGeneLabel: PropTypes.func,
  title: PropTypes.string
}

GenesTrack.defaultProps = {
  includeNonCodingGenes: false,
  renderGeneLabel: undefined,
  title: 'Genes'
}
