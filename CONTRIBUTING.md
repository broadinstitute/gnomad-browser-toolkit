# Contributing

## Getting started

- Install dependencies

  ```
  pnpm install
  ```

- Build all packages

  ```
  pnpm -r run build
  ```

## Publishing a package

- Authenticate to NPM using `npm login` or with an auth token.

  - https://docs.npmjs.com/creating-a-new-npm-user-account#testing-your-new-account-with-npm-login
  - https://docs.npmjs.com/creating-and-viewing-authentication-tokens#creating-authentication-tokens
  - https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow#create-and-check-in-a-project-specific-npmrc-file

- Make sure that the package's changelog is up to date.

  To see changes since the last release, use:

  ```
  LAST_RELEASE_TAG=$(git tag --list '<package-name>-*' --sort=-committerdate | head -n1)
  git log $LAST_RELEASE_TAG.. packages/<package-name>
  ```

  For example, the commands for package `@gnomad/ui` are:

  ```
  LAST_RELEASE_TAG=$(git tag --list 'ui-*' --sort=-committerdate | head -n1)
  git log $LAST_RELEASE_TAG.. packages/ui
  ```

- Update version in package.json, replace "unreleased" heading in changelog with the version number, and commit.
  The new version number should be based on changes since the last release.

  https://semver.org

- Tag the release in git.

  ```
  git tag <package-name>-v<version>
  git push origin <package-name>-v<version>
  ```

  For package `@gnomad/ui`, that would be:

  ```shell
  git tag ui-v1.1.0
  git push origin ui-v1.1.0
  ```

- Publish package.

  ```
  cd packages/<package-name>
  npm publish
  ```

  If this is the first time a package is published and you get an error similar to "402 Payment Required - You must sign up for private packages" after running `npm publish`, re-run it with the added flag `--access public`.

- Add release notes to the corresponding tag in GitHub's [releases section](https://github.com/broadinstitute/gnomad-browser-toolkit/releases).
