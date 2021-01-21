import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

const GeneName = styled.text`
  fill: #428bca;

  &:hover {
    fill: #be4248;
    cursor: pointer;
  }
`

const layoutRows = (genes, scalePosition) => {
  if (genes.length === 0) {
    return []
  }

  const sortedGenes = [...genes].sort((gene1, gene2) => gene1.start - gene2.start)

  const rows = [[sortedGenes[0]]]

  for (let i = 1; i < sortedGenes.length; i += 1) {
    const gene = sortedGenes[i]

    let newRow = true
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const lastGeneInRow = rows[rowIndex][rows[rowIndex].length - 1]
      if (scalePosition(gene.start) - scalePosition(lastGeneInRow.stop) > 60) {
        rows[rowIndex].push(gene)
        newRow = false
        break
      }
    }

    if (newRow) {
      rows.push([gene])
    }
  }

  return rows
}

const featureAttributes = {
  exon: {
    fill: '#bdbdbd',
    height: 6,
  },
  CDS: {
    fill: '#424242',
    height: 16,
  },
  UTR: {
    fill: '#424242',
    height: 6,
  },
}

const featureTypeOrder = {
  exon: 0,
  UTR: 1,
  CDS: 2,
}

const featureTypeCompareFn = (r1, r2) =>
  featureTypeOrder[r1.feature_type] - featureTypeOrder[r2.feature_type]

const isCodingGene = gene => gene.exons.some(exon => exon.feature_type === 'CDS')

export const GenesPlot = ({ genes, includeNonCodingGenes, onGeneClick, scalePosition, width }) => {
  const rows = layoutRows(includeNonCodingGenes ? genes : genes.filter(isCodingGene), scalePosition)
  const rowHeight = 50
  return (
    <svg height={rowHeight * rows.length} width={width}>
      {rows.map((track, trackNumber) =>
        track.map(gene => {
          const textYPosition = rowHeight * trackNumber + 33
          const exonsYPosition = rowHeight * trackNumber + 8
          const geneStart = scalePosition(gene.start)
          const geneStop = scalePosition(gene.stop)
          return (
            <g key={gene.gene_id}>
              <GeneName
                x={(geneStop + geneStart) / 2}
                y={textYPosition}
                onClick={() => onGeneClick(gene)}
              >
                {gene.symbol}
              </GeneName>
              <line
                x1={geneStart}
                x2={geneStop}
                y1={exonsYPosition}
                y2={exonsYPosition}
                stroke="#424242"
                strokeWidth={1}
              />
              {[...gene.exons].sort(featureTypeCompareFn).map(exon => {
                const exonStart = scalePosition(exon.start)
                const exonStop = scalePosition(exon.stop)
                const { fill, height: exonHeight } = featureAttributes[exon.feature_type]

                return (
                  <rect
                    key={`${gene.gene_id}-${exon.feature_type}-${exon.start}-${exon.stop}`}
                    x={exonStart}
                    y={rowHeight * trackNumber + (16 - exonHeight) / 2}
                    width={exonStop - exonStart}
                    height={exonHeight}
                    fill={fill}
                    stroke={fill}
                  />
                )
              })}
            </g>
          )
        })
      )}
    </svg>
  )
}

GenesPlot.propTypes = {
  genes: PropTypes.arrayOf(
    PropTypes.shape({
      gene_id: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired,
      start: PropTypes.number.isRequired,
      stop: PropTypes.number.isRequired,
      exons: PropTypes.arrayOf(
        PropTypes.shape({
          feature_type: PropTypes.oneOf(['CDS', 'exon', 'UTR']).isRequired,
          start: PropTypes.number.isRequired,
          stop: PropTypes.number.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  includeNonCodingGenes: PropTypes.bool,
  onGeneClick: PropTypes.func,
  scalePosition: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
}

GenesPlot.defaultProps = {
  includeNonCodingGenes: false,
  onGeneClick: () => {},
}
