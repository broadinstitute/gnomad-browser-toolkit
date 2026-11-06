# Changes

## Unreleased

- Keep RegionViewer's layout context stable across renders, so memoized tracks re-render only when the layout changes. Compare `regions` field by field: a new array with equal regions keeps the layout. Treat regions as immutable; changing a region in place no longer updates the layout.
- Add floating readouts through `renderReadout` on Cursor and in Track `positionInspection`, with preset or pixel placement inside the plot, edge flipping, and remeasurement on resize.
- Add `ReadoutValue` with formatting, units, custom content, font size, and distinct zero/missing values.
- Draw readouts as white text on `DEFAULT_READOUT_BACKGROUND_COLOR` (`#474747`, matching `@gnomad/ui` tooltips) with a 1px `DEFAULT_READOUT_BORDER_COLOR` (`#9e9e9e`) border; override with `readoutBackgroundColor` and `readoutBorderColor`.
- Fit readouts into short plots: margins drop when there is no room, and bubbles take their height from their content.
- Add opt-in Track `positionInspection`; tracks without it render as before.
- **Breaking:** Mount Cursor inside each plot instead of around whole tracks. Cursors in one RegionViewer synchronize through viewer-scoped inspection.
- **Breaking:** Snap Cursor hover and selection to the nearest displayed base. Keep default scale inversion flooring unchanged.
- **Breaking:** Cursor `onClick` receives the base under the click or tap, typed `number`, instead of the last hovered base. Taps select again.
- **Breaking:** Remove `defaultRenderCursor`. The default cursor is a 2px line in the current text colour.
- Add independent display/publication/enable options and useInspectedPosition for small subscribers.
- Clear inspection after layout changes until actual pointer movement resumes.
- Warn outside production builds when a Track renders inside a Cursor, the pre-7 whole-track wrapping that now reports wrong positions.
- Demonstrate synchronized coverage/score plots with browser regression checks.

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
