import { dirname, join } from "path";
module.exports = {
  stories: ['../src/**/*.stories.@(ts|js)'],

  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {}
  },

  docs: {
    autodocs: true
  }
}

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
