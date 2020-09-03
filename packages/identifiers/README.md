# @gnomad/identifiers

Recognize and parse different forms of variant and region identifiers.

- `parseVariantId` parse a variant ID string into an object with chrom, pos, ref, and alt fields.
- `normalizeVariantId` normalize a variant ID string into `chrom-pos-ref-alt` format.
- `isVariantId` check whether a string can be parsed as a variant ID.
- `isRsId` check whether a string looks like a dbSNP rsID.

- `parseRegionId` parse a region ID string into an object with chrom, start, and stop fields.
- `normalizeRegionId` normalize a region ID string into `chrom-start-stop` format.
- `isRegionId` check whether a string can be parsed as a region ID.
