# Changes

## Version 2.3.2 - October 12, 2021

- Gracefully degrade if Unicode property escapes are not supported [(2fffa99)](https://github.com/broadinstitute/gnomad-browser-toolkit/commit/2fffa996fa8d9642a8850e10d21dcb5063d01519)

## Version 2.3.1 - August 13, 2021

- Match against full string for identifying/parsing region IDs [(b58177b)](https://github.com/broadinstitute/gnomad-browser-toolkit/commit/b58177beba500a5b2d9c5fc84f1f5091b27756f6)

## Version 2.3.0 - June 10, 2021

- Accept underscores and pipes as separators in variant/region IDs ([#62](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/62))

## Version 2.2.1 - May 26, 2021

- Fix for compatibility with IE 11 ([#58](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/58))

## Version 2.2.0 - May 5, 2021

- Accept Unicode dashes as separators in variant/region IDs ([#51](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/51))

## Version 2.1.0 - March 3, 2021

- Accept white space as a separator in variant/region IDs ([#46](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/46))
- Accept `/` as a separator in variant/region IDs ([#46](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/46))

## Version 2.0.0 - September 3, 2020

- Recognize additional forms of variant IDs (m.3243A>G and m.A3243G) ([#20](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/20))
- Normalize positions to 1 base region ([#21](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/21))
- Add `parseVariantId` and `parseRegionId` functions ([#23](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/23))
- Add TypeScript declarations ([#24](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/24))

## Version 1.1.0 - August 25, 2020

Accept "." as a separator between chromosome and position ([#18](https://github.com/broadinstitute/gnomad-browser-toolkit/pull/18)).

## Version 1.0.0 - July 1, 2020

Initial release
