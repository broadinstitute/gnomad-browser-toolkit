import React, { useState } from 'react'

import { RegionViewer, Track, PositionAxisTrack } from '../src'

const RegionViewerExample = () => {
  const [position, setPosition] = useState(250)

  return (
    <div>
      <RegionViewer
        width={1000}
        padding={0}
        regions={[
          { feature_type: 'region', start: 0, stop: 100 },
          { feature_type: 'region', start: 200, stop: 300 },
        ]}
      >
        <Track>
          {({ scalePosition, width }) => {
            return (
              <svg height={50} width={width}>
                <circle cx={scalePosition(position)} cy={25} r={10} fill="blue" />
              </svg>
            )
          }}
        </Track>
        <PositionAxisTrack />
      </RegionViewer>

      <div
        style={{ boxSizing: 'border-box', margin: '0 auto', paddingLeft: '100px', width: '1000px' }}
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
      </div>
    </div>
  )
}

export default RegionViewerExample
