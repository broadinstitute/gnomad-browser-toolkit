import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Track } from '@gnomad/region-viewer'

import TranscriptPlot from './TranscriptPlot'

const TranscriptWrapper = styled.div`
  display: flex;
  margin-bottom: 5px;
`

const TranscriptLabel = styled.span`
  font-size: 11px;
`

const isTranscriptCoding = transcript => transcript.exons.some(exon => exon.feature_type === 'CDS')

const exportTranscriptsPlot = (containerElement, filename) => {
  const transcriptPlots = containerElement.querySelectorAll('.transcript-plot')
  const { width } = containerElement.getBoundingClientRect()

  const svgNS = 'http://www.w3.org/2000/svg'
  const plot = document.createElementNS(svgNS, 'svg')
  plot.setAttribute('width', width)
  plot.setAttribute('height', 15 * transcriptPlots.length)

  Array.from(transcriptPlots).forEach((plotElement, i) => {
    const transcriptGroup = document.createElementNS(svgNS, 'g')
    transcriptGroup.setAttribute('transform', `translate(0,${i * 15})`)
    plot.appendChild(transcriptGroup)

    const plotGroup = document.createElementNS(svgNS, 'g')
    plotGroup.setAttribute('transform', `translate(100 , 0)`)
    plotGroup.innerHTML = plotElement.innerHTML
    transcriptGroup.appendChild(plotGroup)

    const transcriptIdLabel = document.createElementNS(svgNS, 'text')
    transcriptIdLabel.textContent = plotElement.getAttribute('data-transcript-id')
    transcriptIdLabel.setAttribute('font-family', 'sans-serif')
    transcriptIdLabel.setAttribute('font-size', 11)
    transcriptIdLabel.setAttribute('dy', '0.7em')
    transcriptIdLabel.setAttribute('x', 0)
    transcriptIdLabel.setAttribute('y', 0)
    transcriptGroup.appendChild(transcriptIdLabel)
  })

  const serializer = new XMLSerializer()
  const data = serializer.serializeToString(plot)

  const blob = new Blob(['<?xml version="1.0" standalone="no"?>\r\n', data], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.svg`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export const TranscriptsTrack = forwardRef(
  (
    {
      renderTranscriptLeftPanel,
      renderTranscriptRightPanel,
      transcripts,
      showUTRs,
      showNonCodingTranscripts,
      transcriptHeight,
    },
    ref
  ) => {
    const transcriptsContainer = useRef(null)

    useImperativeHandle(ref, () => ({
      downloadPlot: (filename = 'transcripts') => {
        exportTranscriptsPlot(transcriptsContainer.current, filename)
      },
    }))

    return (
      <div ref={transcriptsContainer}>
        {(showNonCodingTranscripts ? transcripts : transcripts.filter(isTranscriptCoding)).map(
          transcript => (
            <TranscriptWrapper key={transcript.transcript_id}>
              <Track
                renderLeftPanel={
                  renderTranscriptLeftPanel
                    ? ({ width }) => renderTranscriptLeftPanel({ transcript, width })
                    : undefined
                }
                renderRightPanel={
                  renderTranscriptRightPanel
                    ? ({ width }) => renderTranscriptRightPanel({ transcript, width })
                    : undefined
                }
              >
                {({ scalePosition, width }) => (
                  <TranscriptPlot
                    className="transcript-plot"
                    data-transcript-id={transcript.transcript_id}
                    height={transcriptHeight}
                    scalePosition={scalePosition}
                    showNonCodingExons={showNonCodingTranscripts}
                    showUTRs={showUTRs}
                    transcript={transcript}
                    width={width}
                  />
                )}
              </Track>
            </TranscriptWrapper>
          )
        )}
      </div>
    )
  }
)

TranscriptsTrack.propTypes = {
  renderTranscriptLeftPanel: PropTypes.func,
  renderTranscriptRightPanel: PropTypes.func,
  showNonCodingTranscripts: PropTypes.bool,
  showUTRs: PropTypes.bool,
  transcriptHeight: PropTypes.number,
  transcripts: PropTypes.arrayOf(
    PropTypes.shape({
      transcript_id: PropTypes.string.isRequired,
      exons: PropTypes.arrayOf(
        PropTypes.shape({
          feature_type: PropTypes.string.isRequired,
          start: PropTypes.number.isRequired,
          stop: PropTypes.number.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
}

TranscriptsTrack.defaultProps = {
  /* eslint-disable react/prop-types */
  renderTranscriptLeftPanel: ({ transcript }) => (
    <TranscriptLabel>{transcript.transcript_id}</TranscriptLabel>
  ),
  /* eslint-enable react/prop-types */
  renderTranscriptRightPanel: undefined,
  showNonCodingTranscripts: false,
  showUTRs: false,
  transcriptHeight: 10,
}
