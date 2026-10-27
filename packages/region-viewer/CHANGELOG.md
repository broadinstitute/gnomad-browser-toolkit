# Changes

## Unreleased

- Add track-owned readoutY resolvers with genomic position, plot height, and combined measured readout height.
- Demonstrate curve-relative Coverage and bin-relative Histogram readouts, including font remeasurement and zero values.

- Add source-only genomic position badges, default on, with per-track opt-out and same-base ownership transfer.
- Demonstrate coordinate-only Annotations and value-only Histogram alongside Coverage/Score.

- Add floating Track/Cursor value readouts with preset/pixel placement, bounds measurement, and font-size overrides.
- Add PositionReadout formatting, units, custom content, and distinct zero/missing values.

- Add opt-in Track positionInspection configuration without changing unconfigured tracks.

- **Breaking:** Mount Cursor inside each plot instead of around whole tracks. Cursors in one RegionViewer synchronize through viewer-scoped inspection.
- **Breaking:** Snap Cursor hover and local selection to the nearest displayed base. Keep default scale inversion flooring unchanged.
- Add independent display/publication/enable options and useInspectedPosition for small subscribers.
- Clear inspection after layout changes until actual pointer movement resumes.
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
