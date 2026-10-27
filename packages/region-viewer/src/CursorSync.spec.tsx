import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/dom'
import React, { act, memo, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Cursor, CursorProps } from './Cursor'
import { Region } from './coordinates'
import { RegionViewer } from './RegionViewer'
import { Track } from './Track'
import { useInspectedPosition } from './useInspectedPosition'

const REGIONS = [
  { start: 1, stop: 5 },
  { start: 10, stop: 14 }
]

const Position = ({ name = 'position' }: { name?: string }) => {
  const position = useInspectedPosition()
  return <output data-testid={name}>{position ?? 'none'}</output>
}

const marker = (name: string) => (x: number) => {
  return <line data-testid={`${name}-cursor`} x1={x} x2={x} y1={0} y2="100%" />
}

const Plot = ({ name }: { name: string }) => {
  return <div data-testid={name}>Plot {name}</div>
}

const TwoTracks = ({
  aOptions,
  bOptions,
  showA = true,
  showB = true,
  showReadout = true,
  width = 360,
  regions = REGIONS
}: {
  aOptions?: CursorProps
  bOptions?: CursorProps
  showA?: boolean
  showB?: boolean
  showReadout?: boolean
  width?: number
  regions?: Region[]
}) => {
  return (
    <RegionViewer width={width} leftPanelWidth={100} rightPanelWidth={160} regions={regions}>
      {showA && (
        <Track>
          {() => {
            return (
              <Cursor
                enabled={aOptions?.enabled}
                publishPosition={aOptions?.publishPosition}
                showCursor={aOptions?.showCursor}
                onClick={aOptions?.onClick}
                renderCursor={marker('a')}
              >
                <Plot name="a" />
              </Cursor>
            )
          }}
        </Track>
      )}
      {showB && (
        <Track>
          {() => {
            return (
              <Cursor
                enabled={bOptions?.enabled}
                publishPosition={bOptions?.publishPosition}
                showCursor={bOptions?.showCursor}
                onClick={bOptions?.onClick}
                renderCursor={marker('b')}
              >
                <Plot name="b" />
              </Cursor>
            )
          }}
        </Track>
      )}
      {showReadout && <Position />}
    </RegionViewer>
  )
}

describe('viewer-scoped cursor inspection', () => {
  let host: HTMLDivElement
  let root: ReturnType<typeof createRoot>
  const previousActEnvironment = Reflect.get(globalThis, 'IS_REACT_ACT_ENVIRONMENT')

  beforeEach(() => {
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true)
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 0,
      left: 100,
      top: 0,
      right: 200,
      bottom: 50,
      width: 100,
      height: 50,
      toJSON: () => ({})
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    jest.restoreAllMocks()
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', previousActEnvironment)
  })

  const mount = (children: React.ReactNode) => {
    act(() => root.render(children))
  }

  const pointer = (name: string, type: string, x = 0) => {
    act(() => {
      fireEvent(screen.getByTestId(name), new MouseEvent(type, { bubbles: true, clientX: x }))
    })
  }

  const move = (name: string, x: number) => pointer(name, 'pointermove', x)

  test('the standard synced cursor uses a two-pixel line', () => {
    mount(
      <RegionViewer width={360} leftPanelWidth={100} rightPanelWidth={160} regions={REGIONS}>
        <Cursor>
          <Plot name="standard" />
        </Cursor>
      </RegionViewer>
    )
    move('standard', 170)
    const line = host.querySelector('svg[aria-hidden="true"] line')
    expect(line?.getAttribute('stroke-width')).toBe('2')
  })

  test('hovering either plot mirrors one genomic base in both cursors and the readout', () => {
    mount(<TwoTracks />)
    move('a', 179)

    expect(screen.getByTestId('position').textContent).toBe('13')
    expect(screen.getByTestId('a-cursor').getAttribute('x1')).toBe('80')
    expect(screen.getByTestId('b-cursor').getAttribute('x1')).toBe('80')

    move('b', 120)

    expect(screen.getByTestId('position').textContent).toBe('3')
    expect(screen.getByTestId('a-cursor').getAttribute('x1')).toBe('20')
    expect(screen.getByTestId('b-cursor').getAttribute('x1')).toBe('20')
  })

  test.each([
    [0, '1', '0'],
    [44.9, '5', '40'],
    [45, '10', '50'],
    [49, '10', '50'],
    [50, '10', '50'],
    [100, '14', '90']
  ])('plot X=%s maps to base %s and its scaled cursor X=%s', (x, base, cursorX) => {
    mount(<TwoTracks />)
    move('a', 100 + x)
    expect(screen.getByTestId('position').textContent).toBe(base)
    expect(screen.getByTestId('b-cursor').getAttribute('x1')).toBe(cursorX)
  })

  test('cursor, readout, and local clicks choose the same nearest base on either side of a midpoint', () => {
    const onClick = jest.fn()
    mount(<TwoTracks aOptions={{ onClick }} />)
    move('a', 174.9)
    pointer('a', 'click', 174.9)
    expect(screen.getByTestId('position').textContent).toBe('12')
    expect(screen.getByTestId('b-cursor').getAttribute('x1')).toBe('70')

    move('a', 175)
    pointer('a', 'click', 175)
    expect(screen.getByTestId('position').textContent).toBe('13')
    expect(screen.getByTestId('a-cursor').getAttribute('x1')).toBe('80')
    expect(screen.getByTestId('b-cursor').getAttribute('x1')).toBe('80')
    expect(onClick.mock.calls).toEqual([[12], [13]])
  })

  test('uses the current plot rectangle, including CSS scaling and page offset', () => {
    mount(<TwoTracks />)
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 300,
      y: 0,
      left: 300,
      top: 0,
      right: 500,
      bottom: 50,
      width: 200,
      height: 50,
      toJSON: () => ({})
    })
    move('a', 440)
    expect(screen.getByTestId('position').textContent).toBe('12')
    expect(screen.getByTestId('b-cursor').getAttribute('x1')).toBe('70')
  })

  test.each(['pointerout', 'pointercancel'])(
    '%s clears the source and every mirrored cursor',
    type => {
      mount(<TwoTracks />)
      move('a', 170)
      pointer('a', type)
      expect(screen.getByTestId('position').textContent).toBe('none')
      expect(screen.queryByTestId('a-cursor')).toBeNull()
      expect(screen.queryByTestId('b-cursor')).toBeNull()
    }
  )

  test('moving outside the plot clears instead of clamping to an edge base', () => {
    mount(<TwoTracks />)
    move('a', 170)
    move('a', 201)
    expect(screen.getByTestId('position').textContent).toBe('none')
  })

  test('a display-only cursor follows the source but cannot publish or select', () => {
    const onClick = jest.fn()
    mount(<TwoTracks bOptions={{ publishPosition: false, onClick }} />)
    move('a', 170)
    expect(screen.getByTestId('b-cursor').getAttribute('x1')).toBe('70')
    move('b', 120)
    pointer('b', 'click', 120)
    expect(screen.getByTestId('position').textContent).toBe('12')
    expect(onClick).not.toHaveBeenCalled()
    pointer('a', 'pointerout')
    move('b', 120)
    expect(screen.getByTestId('position').textContent).toBe('none')
  })

  test('a hidden cursor still publishes and selects locally without clicking its follower', () => {
    const selectSource = jest.fn()
    const selectFollower = jest.fn()
    mount(
      <TwoTracks
        aOptions={{ showCursor: false, onClick: selectSource }}
        bOptions={{ onClick: selectFollower }}
      />
    )
    move('a', 170)
    pointer('a', 'click', 170)
    expect(screen.queryByTestId('a-cursor')).toBeNull()
    expect(screen.getByTestId('b-cursor').getAttribute('x1')).toBe('70')
    expect(selectSource.mock.calls).toEqual([[12]])
    expect(selectFollower).not.toHaveBeenCalled()
    pointer('b', 'click', 170)
    expect(selectFollower).not.toHaveBeenCalled()
  })

  test('disabling the source clears hover and leaves its plot mounted and nonpublishing', () => {
    mount(<TwoTracks />)
    const plot = screen.getByTestId('a')
    move('a', 170)
    mount(<TwoTracks aOptions={{ enabled: false }} />)
    expect(screen.getByTestId('a')).toBe(plot)
    expect(screen.getByTestId('position').textContent).toBe('none')
    move('a', 120)
    expect(screen.getByTestId('position').textContent).toBe('none')
    move('b', 170)
    expect(screen.queryByTestId('a-cursor')).toBeNull()
    expect(screen.getByTestId('b-cursor').getAttribute('x1')).toBe('70')
  })

  test('opting an active source out of publishing clears its inspection', () => {
    mount(<TwoTracks />)
    move('a', 170)
    mount(<TwoTracks aOptions={{ publishPosition: false }} />)
    expect(screen.getByTestId('position').textContent).toBe('none')
    move('b', 120)
    expect(screen.getByTestId('a-cursor').getAttribute('x1')).toBe('20')
  })

  test('same-base source handoff survives inactive-source leave, disable, and unmount', () => {
    mount(<TwoTracks />)
    move('a', 170)
    move('b', 170)
    pointer('a', 'pointerout')
    mount(<TwoTracks aOptions={{ enabled: false }} />)
    mount(<TwoTracks showA={false} />)
    expect(screen.getByTestId('position').textContent).toBe('12')
    mount(<TwoTracks showA={false} showB={false} />)
    expect(screen.getByTestId('position').textContent).toBe('none')
  })

  test('a late readout sees the current position without another pointer event', () => {
    mount(<TwoTracks showReadout={false} />)
    move('a', 170)
    mount(<TwoTracks />)
    expect(screen.getByTestId('position').textContent).toBe('12')
  })

  test('resize and replacement regions clear hover and local click eligibility', () => {
    const onClick = jest.fn()
    mount(<TwoTracks aOptions={{ onClick }} />)
    move('a', 170)
    mount(<TwoTracks width={460} aOptions={{ onClick }} />)
    expect(screen.getByTestId('position').textContent).toBe('none')
    pointer('a', 'click', 170)
    expect(onClick).not.toHaveBeenCalled()
    move('a', 170)
    mount(<TwoTracks width={460} regions={[{ start: 100, stop: 109 }]} aOptions={{ onClick }} />)
    expect(screen.getByTestId('position').textContent).toBe('none')
    pointer('a', 'click', 170)
    expect(onClick).not.toHaveBeenCalled()
  })

  test('zoom stays cleared when changed SVG content causes stationary pointer re-entry', () => {
    mount(<TwoTracks />)
    move('a', 170)
    mount(<TwoTracks regions={[{ start: 100, stop: 109 }]} />)
    pointer('a', 'pointerover', 170)
    expect(screen.getByTestId('position').textContent).toBe('none')
    move('a', 170)
    expect(screen.getByTestId('position').textContent).toBe('107')
  })

  test('empty regions and a zero-width plot do not attempt position conversion', () => {
    mount(<TwoTracks regions={[]} />)
    move('a', 170)
    expect(screen.getByTestId('position').textContent).toBe('none')
    mount(<TwoTracks width={260} />)
    move('a', 170)
    expect(screen.getByTestId('position').textContent).toBe('none')
  })

  test('a genomic base of zero is a real inspected position', () => {
    mount(<TwoTracks regions={[{ start: 0, stop: 9 }]} />)
    move('a', 100)
    expect(screen.getByTestId('position').textContent).toBe('0')
    expect(screen.getByTestId('b-cursor').getAttribute('x1')).toBe('0')
  })

  test('touch movement does not create hover inspection', () => {
    mount(<TwoTracks />)
    const event = new MouseEvent('pointermove', { bubbles: true, clientX: 170 })
    Object.defineProperty(event, 'pointerType', { value: 'touch' })
    act(() => fireEvent(screen.getByTestId('a'), event))
    expect(screen.getByTestId('position').textContent).toBe('none')
  })

  test('nested and independent viewers do not receive another viewer’s hover or clicks', () => {
    const selectOuter = jest.fn()
    const Viewer = ({ children }: { children: React.ReactNode }) => {
      return (
        <RegionViewer width={360} leftPanelWidth={100} rightPanelWidth={160} regions={REGIONS}>
          {children}
        </RegionViewer>
      )
    }
    mount(
      <Viewer>
        <Cursor onClick={selectOuter} renderCursor={marker('outer')}>
          <Plot name="outer" />
          <Viewer>
            <Cursor renderCursor={marker('inner')}>
              <Plot name="inner" />
            </Cursor>
            <Position name="inner-position" />
          </Viewer>
        </Cursor>
        <Position name="outer-position" />
        <Viewer>
          <Cursor>
            <Plot name="independent" />
          </Cursor>
          <Position name="independent-position" />
        </Viewer>
      </Viewer>
    )
    move('outer', 120)
    move('inner', 170)
    pointer('inner', 'click', 170)
    expect(screen.getByTestId('inner-position').textContent).toBe('12')
    expect(screen.getByTestId('outer-position').textContent).toBe('3')
    expect(screen.getByTestId('independent-position').textContent).toBe('none')
    expect(selectOuter).not.toHaveBeenCalled()
  })

  test('hover updates only the small subscribers, not expensive Track plot callbacks', () => {
    const renderPlot = jest.fn(() => (
      <Cursor renderCursor={marker('a')}>
        <Plot name="a" />
      </Cursor>
    ))
    const renderReadout = jest.fn(() => {
      const position = useInspectedPosition()
      return <output data-testid="position">{position ?? 'none'}</output>
    })
    const Readout = renderReadout
    mount(
      <StrictMode>
        <RegionViewer width={360} leftPanelWidth={100} rightPanelWidth={160} regions={REGIONS}>
          <Track>{renderPlot}</Track>
          <Readout />
        </RegionViewer>
      </StrictMode>
    )
    const initialPlotRenders = renderPlot.mock.calls.length
    move('a', 170)
    const afterFirstPosition = renderReadout.mock.calls.length
    move('a', 174)
    expect(renderReadout.mock.calls.length).toBe(afterFirstPosition)
    move('a', 120)
    expect(screen.getByTestId('position').textContent).toBe('3')
    expect(renderPlot.mock.calls.length).toBe(initialPlotRenders)
    expect(renderReadout.mock.calls.length).toBeGreaterThan(afterFirstPosition)
  })

  test('Track forwards display-only, hidden-line, and custom-renderer options to Cursor', () => {
    const selectFollower = jest.fn()
    mount(
      <RegionViewer width={360} leftPanelWidth={100} rightPanelWidth={160} regions={REGIONS}>
        <Track positionInspection={{ showCursor: false, renderCursor: marker('source') }}>
          {() => <Plot name="source" />}
        </Track>
        <Track
          positionInspection={{
            publishPosition: false,
            onClick: selectFollower,
            renderCursor: marker('follower')
          }}
        >
          {() => <Plot name="follower" />}
        </Track>
        <Position />
      </RegionViewer>
    )
    move('source', 170)
    expect(screen.getByTestId('follower-cursor').getAttribute('x1')).toBe('70')
    expect(screen.queryByTestId('source-cursor')).toBeNull()
    move('follower', 120)
    pointer('follower', 'click', 120)
    expect(screen.getByTestId('position').textContent).toBe('12')
    expect(selectFollower).not.toHaveBeenCalled()
  })

  test('Track inspection preserves its plot and selection when dynamically disabled', () => {
    const onClick = jest.fn()
    const renderPlot = jest.fn(() => <Plot name="configured" />)
    const viewer = (enabled: boolean) => {
      return (
        <RegionViewer width={360} leftPanelWidth={100} rightPanelWidth={160} regions={REGIONS}>
          <Track positionInspection={{ enabled, onClick }}>{renderPlot}</Track>
          <Position />
        </RegionViewer>
      )
    }
    mount(viewer(true))
    const plot = screen.getByTestId('configured')
    const initialRenders = renderPlot.mock.calls.length
    move('configured', 170)
    expect(renderPlot.mock.calls.length).toBe(initialRenders)
    pointer('configured', 'click', 170)
    expect(onClick.mock.calls).toEqual([[12]])
    mount(viewer(false))
    expect(screen.getByTestId('configured')).toBe(plot)
    expect(screen.getByTestId('position').textContent).toBe('none')
    move('configured', 120)
    pointer('configured', 'click', 120)
    expect(onClick.mock.calls).toEqual([[12]])
  })

  test('stable layout inputs do not notify memoized plots, while resize and data changes do', () => {
    const renderPlot = jest.fn(() => <div>expensive plot</div>)
    const StableTrack = memo(({ value }: { value: number }) => {
      return (
        <Track>
          {() => {
            renderPlot()
            return <div>{value}</div>
          }}
        </Track>
      )
    })
    const viewer = (width: number, value: number) => {
      return (
        <RegionViewer width={width} leftPanelWidth={100} rightPanelWidth={160} regions={REGIONS}>
          <StableTrack value={value} />
        </RegionViewer>
      )
    }
    mount(viewer(360, 1))
    const initial = renderPlot.mock.calls.length
    mount(viewer(360, 1))
    expect(renderPlot.mock.calls.length).toBe(initial)
    mount(viewer(460, 1))
    expect(renderPlot.mock.calls.length).toBeGreaterThan(initial)
    const afterResize = renderPlot.mock.calls.length
    mount(viewer(460, 2))
    expect(renderPlot.mock.calls.length).toBeGreaterThan(afterResize)
    expect(screen.getByText('2')).not.toBeNull()
  })
})
