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

`onClick` receives the base under the click or tap. A plot's click never calls another plot's `onClick`, and followers with `publishPosition={false}` never select. Native child links retain their click behavior. Mouse and pen hover publish inspection; touch movement does not, but a tap still selects.

`useInspectedPosition()` subscribes a small component to the shared base, or null when inactive. Keep expensive plots outside that subscription. Inspection clears on source leave, cancellation, disable/unmount, publication opt-out, and coordinate/layout changes. After a layout change, actual pointer movement must resume inspection.

Cursor uses `scalePosition.invert(x, 'nearest')`. Halfway ties choose the next displayed base across disjoint regions. Existing `invert(x)` callers retain floor rounding.

## Track configuration

Set `positionInspection={{}}` on Track to wrap only its center plot in Cursor. Pass any Cursor option (`enabled`, `publishPosition`, `showCursor`, `onClick`, `renderCursor`) in that object. Tracks without configuration keep their existing output. Keep `children` responsible for the plot and its data lookup.

```jsx
<Track title="Coverage" positionInspection={{ onClick: selectBase }}>
  {props => <CoveragePlot {...props} />}
</Track>
```

## Floating values

Set `renderReadout: ({ position }) => ...` in Track's `positionInspection` (or `renderReadout` on Cursor) to return JSX for the hovered genomic base. Own the data lookup in the track. The toolkit measures and positions the pointer-transparent bubble inside the plot, flips it at horizontal edges, and clamps it to plot bounds. Readouts never extend outside their plot; on short plots the 8px margins drop, and a compact readout (for example 8px text with `lineHeight: 1`) fits a 10px row.

Use `ReadoutValue` for standard labels, React-node values, units, and `formatValue`. Zero remains a value; null/undefined show No data. Set `fontSize` to a pixel number or CSS string; the default is 0.75rem.

Readout content inherits white text on a dark grey (`DEFAULT_READOUT_BACKGROUND_COLOR`, matching `@gnomad/ui` tooltips) pill with a mid-grey border (`DEFAULT_READOUT_BORDER_COLOR`). Override them with `readoutBackgroundColor` and `readoutBorderColor`.

Use `readoutY` for top, middle, bottom, or a pixel offset from the plot top. Readouts float only during active inspection; hiding the line does not hide the value.

## Position badge

Cursor and configured Tracks default `showPositionBadge` to true. The badge shows the hovered base only on the plot under the pointer, above any value bubble; other plots still show their own values. The badge moves on a same-base handoff without re-rendering numeric-position subscribers.

Set `showPositionBadge: false` to keep the line and values without a badge. Omit `renderReadout` for badge-only inspection. The badge and value are positioned and measured together. Value font overrides do not change the badge's typography.

## Data-driven placement

Set `readoutY` to `({ position, height, readoutHeight }) => number` to follow track data. Resolve local pixels with the same Y scale as the plot. `readoutHeight` covers the badge and value together, so subtract it when placing the group above a curve or bar. The toolkit still clamps the result to plot bounds and remeasures after content or font changes.

Coverage demonstrates curve-relative placement; Histogram positions values above each 10-base bin, including zero-count bins. Keep lookups cheap and local to each track.

## Run the example

Run the emitting compiler and example server in separate toolkit-root terminals:

```sh
pnpm --filter @gnomad/region-viewer exec tsc --project tsconfig.build.json --watch
pnpm --filter @gnomad/region-viewer example
```

Open http://localhost:8000 on that machine. The example imports compiled output; `typecheck:watch` does not emit it.
