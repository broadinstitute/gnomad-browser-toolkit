import React, { useState } from 'react'

import { RegionViewer, Track, PositionAxisTrack, Cursor } from '../src'

const RegionViewerExample = () => {
  const [position, setPosition] = useState(250)
  const [lastClickedPosition, setLastClickedPosition] = useState(null)

  return (
    <div style={{ width: '1000px', margin: '40px auto 0' }}>
      <RegionViewer
        width={1000}
        padding={0}
        regions={[
          { feature_type: 'region', start: 0, stop: 100 },
          { feature_type: 'region', start: 200, stop: 300 },
        ]}
      >
        <Cursor onClick={setLastClickedPosition}>
          <Track>
            {({ scalePosition, width }) => {
              return (
                <svg height={50} width={width}>
                  <circle cx={scalePosition(position)} cy={25} r={10} fill="blue" />
                </svg>
              )
            }}
          </Track>
        </Cursor>
        <PositionAxisTrack />
      </RegionViewer>

      <div
        style={{
          boxSizing: 'border-box',
          margin: '1em 0',
          paddingLeft: '100px',
          width: '1000px',
        }}
      >
        <label htmlFor="position">
          Position:{' '}
          <input
            id="position"
            type="number"
            value={position}
            onChange={e => {
              setPosition(Number(e.target.value))
            }}
          />
        </label>
        {lastClickedPosition && <p>Clicked position: {lastClickedPosition}</p>}
      </div>
    </div>
  )
}

export default RegionViewerExample
