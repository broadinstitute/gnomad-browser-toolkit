# Contributing

## Getting started

- Install dependencies

  ```
  yarn install
  ```

- Build all packages

  ```
  yarn workspaces run build
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

- Update version in package.json, replace "unreleased" heading in changelog with the version number, and commit.
  The new version number should be based on changes since the last release.

  https://semver.org

- Tag the release in git.

  ```
  git tag <package-name>-v<version>
  git push origin <package-name>-v<version>
  ```

- Publish package.

  ```
  cd packages/<package-name>
  npm publish
  ```
