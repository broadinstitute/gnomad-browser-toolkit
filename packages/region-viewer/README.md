# Region viewer

Compose genomic tracks with a shared coordinate scale, synchronized plot cursors,
and floating value readouts. Opt in per Track with `positionInspection`.

## Examples

Use the runnable examples for composition and readout configuration:

- [Viewer and controls](example/RegionViewerExample.js)
- [Coverage and score readouts](example/InspectionTrack.js)
- [Binned histogram readouts](example/HistogramExampleTrack.js)
- [Coordinate-only annotations](example/AnnotationsExampleTrack.js)

See the [exported TypeScript API](src/index.ts) for types and options.

## Dependency instances

Keep the viewer and participating tracks on one `@gnomad/region-viewer` module
instance. The existing track packages pin 6.1.0; installing a newer app dependency
alone can split their React contexts. Coordinate those dependency updates and
check the resolved graph with `pnpm -r why @gnomad/region-viewer`.

## Local development

Run from the workspace root in separate terminals:

```sh
pnpm --filter @gnomad/region-viewer exec tsc --project tsconfig.build.json --watch
```

```sh
pnpm --filter @gnomad/region-viewer example
```

Open http://localhost:8000. The example imports compiled output, so keep the
emitting compiler running; `typecheck:watch` does not emit library changes.

## Checks

```sh
pnpm --filter @gnomad/region-viewer test --runInBand
pnpm --filter @gnomad/region-viewer typecheck
pnpm --filter @gnomad/classification-selector exec cypress run --project ../region-viewer --browser electron
```

Keep the example server running for Cypress. Reuse the runner declared by the
sibling classification-selector package.
