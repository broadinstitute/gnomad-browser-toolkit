# Region viewer

Compose genomic tracks on a shared coordinate scale. Opt tracks into a synchronized cursor, so hovering any
plot draws a line at the same base in every opted-in plot, and let each track report its own value there.

## Quick start

```jsx
import { ReadoutValue, RegionViewer, Track } from '@gnomad/region-viewer'

const GeneViewer = ({ regions, coverageAt, selectBase }) => (
  <RegionViewer width={900} leftPanelWidth={120} rightPanelWidth={80} regions={regions}>
    <Track
      title="Coverage"
      positionInspection={{
        onClick: selectBase,
        renderReadout: ({ position }) => (
          <ReadoutValue label="Coverage" value={coverageAt(position)} unit="×" />
        )
      }}
    >
      {props => <CoveragePlot {...props} />}
    </Track>
    <Track title="Variants" positionInspection={{}}>
      {props => <VariantPlot {...props} />}
    </Track>
  </RegionViewer>
)
```

Omit `positionInspection` and a Track renders exactly as before. `{}` opts its plot in with the defaults below.
Tracks synchronize within one `RegionViewer`; separate viewers stay independent.

## `positionInspection` options

The same options are props on `Cursor` for plots composed without Track.

| Option                   | Default                                        | Effect                                                                                                           |
| ------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `enabled`                | `true`                                         | `false` stops publishing, drawing and selection; the plot stays mounted.                                         |
| `publishPosition`        | `true`                                         | `false` makes a display-only follower that never publishes or selects.                                           |
| `showCursor`             | `true`                                         | `false` hides this plot's line; hovering it still publishes.                                                     |
| `onClick`                | none                                           | Receives the base under a click or tap inside this plot.                                                         |
| `renderCursor`           | 2px line                                       | `(x) => svg` from plot-local pixel X.                                                                            |
| `renderReadout`          | none                                           | `({ position }) => ReactNode` for this plot's value at the hovered base.                                         |
| `readoutY`               | `'top'`                                        | `'top'`, `'middle'`, `'bottom'`, pixels from the plot top, or `({ position, height, readoutHeight }) => number`. |
| `showPositionBadge`      | `true`                                         | Shows the hovered base in a badge, only on the plot under the pointer.                                           |
| `showReadoutWhenHovered` | `true`                                         | `false` hides this plot's badge and value while it is the hovered plot. Use it on plots with their own tooltips. |
| `readoutBackgroundColor` | `DEFAULT_READOUT_BACKGROUND_COLOR` (`#474747`) | Readout pill background. Matches `@gnomad/ui` tooltips.                                                          |
| `readoutBorderColor`     | `DEFAULT_READOUT_BORDER_COLOR` (`#9e9e9e`)     | 1px pill border, which keeps pills distinct over dark plot content.                                              |

## Readouts

The track owns the data lookup; the toolkit measures the readout, places it beside the line, flips it at the
right edge and clamps it inside the plot. Readouts appear only while some plot in the viewer is hovered, and
hiding the line does not hide them. Content inherits white text.

`ReadoutValue` renders `label: value unit` with en-US number formatting. `null` and `undefined` show
"No data"; `0` is a value. Pass `formatValue` for domain formatting, a React element for custom content, and
`fontSize` (default `0.75rem`) to resize the value without changing the badge.

A `readoutY` resolver places the readout from track data, for example just above a curve:
`({ position, readoutHeight }) => yScale(valueAt(position)) - readoutHeight - 8`. `readoutHeight` covers the badge
and value together.

On short plots the margins drop and the pill takes its height from its content, so 8px text with
`lineHeight: 1` fits a 10px row.

`useInspectedPosition()` returns the hovered base, or `null`, for small components such as side-panel values.
Call it inside a `RegionViewer`.

## Track packages

`VariantTrack` (`@gnomad/track-variants`), `GenesTrack` (`@gnomad/track-genes`) and `RegionsTrack`
(`@gnomad/track-regions`) accept `positionInspection` and pass it to their Track. `TranscriptsTrack`
(`@gnomad/track-transcripts`) passes it to every transcript row and adds
`renderTranscriptReadout({ position, transcript })` for per-row values; pass `showPositionBadge: false`, since
rows are 10px tall.

Keep the viewer and every track package on one `@gnomad/region-viewer` installation, or the tracks will not share
a hover. Check with `pnpm -r why @gnomad/region-viewer`.

## Migrating from 6.x

- Remove `Cursor` components that wrap whole Tracks and pass `positionInspection` to each Track instead.
  The old wrapping now maps hover to the wrong base; outside production builds Track logs
  "Track rendered inside Cursor" when it finds one.
- `onClick` receives the base under the click or tap, typed `number`. It used to receive the last hovered base.
- Hover and selection snap to the nearest displayed base. `scalePosition.invert(x)` still floors by default; pass
  `'nearest'` for the new rounding.
- `defaultRenderCursor` is removed; the default cursor is a 2px line in the current text colour.
- `Cursor` and `useInspectedPosition` require a `RegionViewer` ancestor.

## Limitations

- Hover responds to mouse and pen. A tap selects but does not hover. There is no keyboard inspection.
- Readouts stay inside their plot. Very short plots need compact custom readouts.
- `regions` are compared field by field; a new array with equal regions does not reset the cursor or re-render
  tracks.

## Examples

Run the example to see every option:

- [Viewer and controls](example/RegionViewerExample.js)
- [Coverage and score readouts](example/InspectionTrack.js)
- [Readouts above histogram bins](example/HistogramExampleTrack.js)
- [Badge-only annotations](example/AnnotationsExampleTrack.js)
- [Compact readouts on 10px exon rows](example/ExonRowsExampleTrack.js)

## Local development

Run from the workspace root in separate terminals:

```sh
pnpm --filter @gnomad/region-viewer exec tsc --project tsconfig.build.json --watch
pnpm --filter @gnomad/region-viewer example
```

Open http://localhost:8000. The example imports compiled output, so keep the emitting compiler running;
`typecheck:watch` does not emit it.

## Checks

```sh
pnpm --filter @gnomad/region-viewer test --runInBand
pnpm --filter @gnomad/region-viewer typecheck
pnpm --filter @gnomad/region-viewer test:browser
```

`test:browser` runs Cypress against the example, so start the example server first. CI runs all three.
