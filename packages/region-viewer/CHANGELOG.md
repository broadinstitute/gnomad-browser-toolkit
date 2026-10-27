# Changes

## Unreleased

- **Breaking:** Wrap each plot with Cursor inside Track's center panel, rather than wrapping whole tracks. Share hover within one actual RegionViewer; separate viewers remain independent.
- **Breaking:** Snap Cursor hover, custom-renderer X, and local click selection to the nearest displayed base. Preserve last-local-hover click semantics and default floor inversion for other scale callers.
- **Breaking:** Reserve Track's `positionInspection` and `renderPositionReadout` props for inspection. Require an actual RegionViewer for Cursor and `useInspectedPosition`; a layout-context provider alone is insufficient.
- Add opt-in Track inspection, independent publication/display controls, and cleanup on leave, disable, unmount, or layout changes without rerendering plot callbacks on hover.
- Default to a 2px cursor line and a source-only coordinate badge. Retain the explicit `defaultRenderCursor` renderer and allow coordinate opt-out.
- Add floating PositionReadout values with formatting, zero/missing handling, custom content, and configurable fonts. Support preset, pixel, and track-data-driven Y placement within plot bounds.
- Add interactive Coverage, Score, Histogram, and Annotations examples with component and browser regression tests.

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
