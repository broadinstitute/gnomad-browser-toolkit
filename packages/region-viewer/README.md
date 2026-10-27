# Region viewer

Mount one `RegionViewer` around tracks that inspect the same genomic position. Independent and nested viewers keep separate inspection state. Pass new region arrays when coordinates change.

## Synchronized cursors

Mount `Cursor` around plot content inside a Track's center-panel renderer. Do not wrap headings, side panels, or several whole tracks. Hovering a plot publishes a genomic base; each participating Cursor draws its own pointer-transparent line.

```jsx
<RegionViewer width={900} leftPanelWidth={120} rightPanelWidth={0} regions={regions}>
  <Track title="Coverage">
    {props => (
      <Cursor onClick={selectBase}>
        <CoveragePlot {...props} />
      </Cursor>
    )}
  </Track>
</RegionViewer>
```

Use `enabled={false}` to disable inspection, `publishPosition={false}` for a display-only follower, and `showCursor={false}` to hide the line without disabling publication. Use `renderCursor(x)` to customize the SVG mark.

Cursor selects the latest locally hovered base, not the click event's X coordinate. Followers never call another track's selection callback. Native child links retain their click behavior. Mouse and pen hover publish inspection; touch movement does not.

`useInspectedPosition()` subscribes a small component to the shared base, or null when inactive. Keep expensive plots outside that subscription. Inspection clears on source leave, cancellation, disable/unmount, publication opt-out, and coordinate/layout changes. After a layout change, actual pointer movement must resume inspection.

Cursor uses `scalePosition.invert(x, 'nearest')`. Halfway ties choose the next displayed base across disjoint regions. Existing `invert(x)` callers retain floor rounding.

## Track configuration

Set `positionInspection={{}}` on Track to wrap only its center plot in Cursor. Pass `enabled`, `publishPosition`, `showCursor`, `onClick`, and `renderCursor` in that object. Tracks without configuration keep their existing output. Keep `children` responsible for the plot and its data lookup.

```jsx
<Track title="Coverage" positionInspection={{ onClick: selectBase }}>
  {props => <CoveragePlot {...props} />}
</Track>
```

## Floating values

Set `renderPositionReadout={({ position }) => ...}` on Track or Cursor to return JSX for the active genomic base. Own the data lookup in the track. The toolkit measures and positions the pointer-transparent bubble inside the plot, flips at horizontal edges, and clamps it to plot bounds.

Use `PositionReadout` for standard labels, React-node values, units, and `formatValue`. Zero remains a value; null/undefined show No data. Set `fontSize` to a pixel number or CSS string; the default is 0.75rem. Set `showPosition` explicitly if the value itself needs a coordinate.

Use `readoutY` on Cursor or in Track's `positionInspection` object. Accept top, middle, bottom, or a local pixel number. Float only during active inspection; disabling the line does not disable the value. Very short plots can clip the readout.

## Source coordinate badge

Cursor and configured Tracks default `showGenomicPositionOnHover` to true. Show the automatic coordinate only on the active publishing plot, above any optional value bubble. Followers still show their own values. Transfer the badge on a same-base source handoff without rerendering numeric-position subscribers.

Set the option false to keep values and the line without a coordinate badge. Omit the value renderer for coordinate-only inspection. Position and measure coordinate/value bubbles together. Value font overrides do not change the automatic coordinate's typography.

## Data-driven placement

Set `readoutY` to `({ position, height, readoutHeight }) => number` to follow track data. Resolve local pixels with the same Y scale as the plot. `readoutHeight` includes the combined coordinate/value group, so subtract it when placing a group above a curve or bar. The toolkit still clamps the result to plot bounds and remeasures after content/font changes.

Coverage demonstrates curve-relative placement; Histogram positions values above each 10-base bin, including zero-count bins. Keep lookups cheap and local to each track.

## Run the example

Run the emitting compiler and example server in separate toolkit-root terminals:

```sh
pnpm --filter @gnomad/region-viewer exec tsc --project tsconfig.build.json --watch
pnpm --filter @gnomad/region-viewer example
```

Open http://localhost:8000 on that machine. The example imports compiled output; `typecheck:watch` does not emit it.
