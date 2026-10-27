import PropTypes from 'prop-types'
import React, { useState } from 'react'

import { Cursor, PositionAxisTrack, RegionViewer, Track } from '../lib/cjs'

import InspectionTrack, { COVERAGE, SCORES } from './InspectionTrack'

const REGIONS = [
  { start: 1, stop: 100 },
  { start: 201, stop: 300 }
]
const ZOOMED_REGIONS = [
  { start: 41, stop: 80 },
  { start: 221, stop: 260 }
]
const CUSTOM_REGIONS = [
  { start: 0, stop: 100 },
  { start: 200, stop: 300 }
]
const INDEPENDENT_REGIONS = [{ start: 1001, stop: 1200 }]
const DEFAULT_SETTINGS = {
  enabled: true,
  publish: true,
  cursor: true
}

const TrackControls = ({ label, settings, onChange }) => {
  return (
    <fieldset>
      <legend>{label}</legend>
      {[
        ['enabled', 'Enable inspection'],
        ['publish', 'Publish hover'],
        ['cursor', 'Show hover line']
      ].map(([key, text]) => {
        return (
          <label
            key={key}
            htmlFor={`${label.replace(/ /g, '-')}-${key}`}
            style={{ display: 'block' }}
          >
            <input
              id={`${label.replace(/ /g, '-')}-${key}`}
              type="checkbox"
              checked={settings[key]}
              onChange={event => onChange({ ...settings, [key]: event.target.checked })}
            />
            {text}
          </label>
        )
      })}
    </fieldset>
  )
}

TrackControls.propTypes = {
  label: PropTypes.string.isRequired,
  settings: PropTypes.shape({
    enabled: PropTypes.bool.isRequired,
    publish: PropTypes.bool.isRequired,
    cursor: PropTypes.bool.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
}

const RegionViewerExample = () => {
  const [width, setWidth] = useState(900)
  const [isZoomed, setIsZoomed] = useState(false)
  const [coverageSettings, setCoverageSettings] = useState(DEFAULT_SETTINGS)
  const [scoreSettings, setScoreSettings] = useState(DEFAULT_SETTINGS)
  const [showScore, setShowScore] = useState(true)
  const [lastClickedPosition, setLastClickedPosition] = useState(null)
  const [details, setDetails] = useState('None')
  const [customPosition, setCustomPosition] = useState(250)
  const [lastCustomClick, setLastCustomClick] = useState(null)
  const regions = isZoomed ? ZOOMED_REGIONS : REGIONS
  const scoreTrack = (
    <InspectionTrack
      label="Score"
      intervals={SCORES}
      settings={scoreSettings}
      onSelect={setLastClickedPosition}
      onDetails={setDetails}
    />
  )
  const optionalScore = showScore ? scoreTrack : null
  const renderCustomCursor = x => {
    return <rect x={x} y={0} width={2} height="100%" fill="#333" />
  }

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: '24px auto',
        padding: '0 16px',
        fontFamily: 'sans-serif',
        color: '#222'
      }}
    >
      <h1>Synchronized cursor reporting</h1>
      <p>
        Hover either plot to inspect the nearest genomic base in both tracks. Click a plot to select
        its last hovered base. Headings and gaps do not publish hover.
      </p>
      <p>
        Explore 200 bases across regions 1 to 100 and 201 to 300. Coverage at base 50 is zero; base
        230 has no coverage data. Score at base 270 has no data. The small outlined circles open
        details without selecting a base.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <TrackControls
          label="Coverage controls"
          settings={coverageSettings}
          onChange={setCoverageSettings}
        />
        <TrackControls
          label="Score controls"
          settings={scoreSettings}
          onChange={setScoreSettings}
        />
        <fieldset>
          <legend>Layout and content</legend>
          <label htmlFor="viewer-width" style={{ display: 'block' }}>
            Viewer width: {width}px
            <input
              id="viewer-width"
              aria-label="Viewer width"
              type="range"
              min={520}
              max={1000}
              step={20}
              value={width}
              onChange={event => setWidth(Number(event.target.value))}
            />
          </label>
          <label htmlFor="zoom-regions" style={{ display: 'block' }}>
            <input
              id="zoom-regions"
              type="checkbox"
              checked={isZoomed}
              onChange={event => setIsZoomed(event.target.checked)}
            />
            Zoom regions
          </label>
          <label htmlFor="mount-score" style={{ display: 'block' }}>
            <input
              id="mount-score"
              type="checkbox"
              checked={showScore}
              onChange={event => setShowScore(event.target.checked)}
            />
            Mount score track
          </label>
        </fieldset>
      </div>

      <section aria-label="Shared inspection viewer" style={{ overflowX: 'auto', marginTop: 16 }}>
        <RegionViewer width={width} leftPanelWidth={120} rightPanelWidth={0} regions={regions}>
          <InspectionTrack
            label="Coverage"
            intervals={COVERAGE}
            settings={coverageSettings}
            onSelect={setLastClickedPosition}
            onDetails={setDetails}
          />
          {optionalScore}
          <PositionAxisTrack />
        </RegionViewer>
      </section>
      <div id="details">
        <p>
          Last selected base:{' '}
          <output aria-label="Last selected base">{lastClickedPosition ?? 'None'}</output>
        </p>
        <p>
          Opened details: <output aria-label="Opened details">{details}</output>
        </p>
      </div>

      <h2>Independent viewer</h2>
      <p>Hover here to inspect bases 1,001 to 1,200 without moving the lines above.</p>
      <section aria-label="Independent viewer" style={{ overflowX: 'auto' }}>
        <RegionViewer
          width={520}
          leftPanelWidth={120}
          rightPanelWidth={0}
          regions={INDEPENDENT_REGIONS}
        >
          <Track title="Independent" positionInspection={{}}>
            {({ width: plotWidth }) => {
              return (
                <svg
                  role="img"
                  aria-label="Independent plot"
                  width={plotWidth}
                  height={50}
                  style={{ display: 'block', background: '#eee' }}
                >
                  <title>Independent plot</title>
                </svg>
              )
            }}
          </Track>
        </RegionViewer>
      </section>

      <h2>Custom cursor and existing click callback</h2>
      <p>
        Use the same Cursor with custom SVG rendering. Click to exercise the existing callback,
        including genomic base zero.
      </p>
      <section aria-label="Custom cursor viewer" style={{ overflowX: 'auto' }}>
        <RegionViewer width={900} leftPanelWidth={120} rightPanelWidth={0} regions={CUSTOM_REGIONS}>
          <Track title="Custom cursor">
            {({ scalePosition, width: plotWidth }) => {
              return (
                <Cursor onClick={setLastCustomClick} renderCursor={renderCustomCursor}>
                  <svg
                    height={50}
                    width={plotWidth}
                    role="img"
                    aria-label="Custom cursor plot"
                    style={{ display: 'block' }}
                  >
                    <title>Custom cursor plot</title>
                    <circle cx={scalePosition(customPosition)} cy={25} r={10} fill="#0072B2" />
                  </svg>
                </Cursor>
              )
            }}
          </Track>
          <PositionAxisTrack />
        </RegionViewer>
      </section>
      <label htmlFor="marker-position">
        Marker position:{' '}
        <input
          id="marker-position"
          type="number"
          value={customPosition}
          onChange={event => setCustomPosition(Number(event.target.value))}
        />
      </label>
      <p>Custom cursor clicked base: {lastCustomClick ?? 'None'}</p>
    </main>
  )
}

export default RegionViewerExample
