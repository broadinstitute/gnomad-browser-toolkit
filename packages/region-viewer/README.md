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

## Run the example

Run the emitting compiler and example server in separate toolkit-root terminals:

```sh
pnpm --filter @gnomad/region-viewer exec tsc --project tsconfig.build.json --watch
pnpm --filter @gnomad/region-viewer example
```

Open http://localhost:8000 on that machine. The example imports compiled output; `typecheck:watch` does not emit it.
