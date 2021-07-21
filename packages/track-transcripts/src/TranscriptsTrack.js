import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Track } from '@gnomad/region-viewer'
import { Button } from '@gnomad/ui'

import TranscriptPlot from './TranscriptPlot'

const ControlPanelWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ControlPanel = styled.div`
  display: flex;
`

const TranscriptsWrapper = styled.div`
  margin-bottom: 1em;
`

const TranscriptWrapper = styled.div`
  display: flex;
  margin-bottom: 5px;
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

export const TranscriptsTrack = ({
  children,
  exportFilename,
  renderTranscriptLeftPanel,
  renderTranscriptRightPanel,
  transcripts,
  showUTRs,
  showNonCodingTranscripts,
}) => {
  const transcriptsContainer = useRef(null)

  return (
    <div>
      <TranscriptsWrapper>
        <Track>
          {({ width }) => (
            <ControlPanelWrapper>
              <ControlPanel>{children}</ControlPanel>
              <Button
                onClick={() =>
                  exportTranscriptsPlot(transcriptsContainer.current, exportFilename, { width })
                }
              >
                Save plot
              </Button>
            </ControlPanelWrapper>
          )}
        </Track>
      </TranscriptsWrapper>
      <TranscriptsWrapper ref={transcriptsContainer}>
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
                    height={10}
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
      </TranscriptsWrapper>
    </div>
  )
}

TranscriptsTrack.propTypes = {
  children: PropTypes.node,
  exportFilename: PropTypes.string,
  renderTranscriptLeftPanel: PropTypes.func,
  renderTranscriptRightPanel: PropTypes.func,
  showNonCodingTranscripts: PropTypes.bool,
  showUTRs: PropTypes.bool,
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
  children: undefined,
  exportFilename: 'transcripts',
  // eslint-disable-next-line react/prop-types
  renderTranscriptLeftPanel: ({ transcript }) => <span>{transcript.transcript_id}</span>,
  renderTranscriptRightPanel: undefined,
  showNonCodingTranscripts: false,
  showUTRs: false,
}
