# Changes

## Version 7.0.0 - November 7, 2026

### Breaking

- Mount Cursor inside each plot, not around whole tracks. Cursors in one RegionViewer share the hovered base; separate viewers stay independent.
- Hover and selection snap to the nearest displayed base. `scalePosition.invert` keeps flooring by default.
- Cursor `onClick` receives the base under the click or tap, typed `number`, instead of the last hovered base. Taps select again.
- Remove `defaultRenderCursor`. The default cursor is a 2px line in the current text colour.
- Cursor and `useInspectedPosition` require a RegionViewer ancestor.

### Added

- Track `positionInspection` opts a plot in with any Cursor option; tracks without it render as before.
- Cursor options `enabled`, `publishPosition` and `showCursor`, and `useInspectedPosition` for small subscribers.
- Floating readouts through `renderReadout`, placed with `readoutY` presets, pixels, or resolvers that receive the hovered base, plot height and measured readout height.
- `ReadoutValue` with formatting, units, custom content, font size, and distinct zero and missing values.
- A position badge on the hovered plot (`showPositionBadge`, default on) and `showReadoutWhenHovered` for plots with their own tooltips.
- Readout colours `readoutBackgroundColor` and `readoutBorderColor`, defaulting to the exported `DEFAULT_READOUT_BACKGROUND_COLOR` (`#474747`, matching `@gnomad/ui` tooltips) and `DEFAULT_READOUT_BORDER_COLOR` (`#9e9e9e`).
- `scalePosition.invert(x, 'nearest')`.
- A development warning when a Track renders inside a Cursor.
- Examples for coverage, score, histogram, annotations and exon rows, with browser tests run in CI.

### Changed

- RegionViewer compares `regions` field by field and keeps its layout context stable, so equal region arrays do not re-render tracks. Treat regions as immutable; changing a region in place no longer updates the layout.
- Inspection clears after layout changes until the pointer moves again.
- Readouts fit short plots: margins drop when there is no room, and pills size to their content.

## Version 3.0.0 - December 1, 2021

- **Breaking** `RegionViewer` no longer extends input regions and its `padding` prop has been removed [(8833edd)](https://github.com/broadinstitute/gnomad-browser-toolkit/commit/8833edd0a311f8eb19103a1c284a5fff4f6f3bfe)
- `feature_type` property is no longer required on `regions` [(66c8c8d)](https://github.com/broadinstitute/gnomad-browser-toolkit/commit/66c8c8df307a52d5115fa252aeb0ff6f7e115d4e)
- Removed margin and font size styles from `RegionViewer` component [(d06e5a5)](https://github.com/broadinstitute/gnomad-browser-toolkit/commit/d06e5a5ffaee3fc85aab32a1228414623fe334a4)

## Version 2.0.0 - July 20, 2021

- Changed objects passed to tracks through `RegionViewerContext` ([#48](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/48))
  - Replaced `offsetRegions` with `regions`. Regions no longer include an `offset` field.
  - Removed `positionOffset`.

## Version 1.1.0 - December 16, 2020

- Add `renderCursor` prop to `Cursor` component ([#34](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/34))

## Version 1.0.0 - July 1, 2020

Initial release
