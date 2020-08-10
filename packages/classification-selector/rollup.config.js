import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json'

const extensions = ['.tsx', '.ts', '.js', '.jsx', '.es6', '.es', '.mjs']

const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)]

export default {
  input: 'src/index.ts',
  output: {
    file: 'lib/index.js',
    format: 'cjs',
  },
  external,
  plugins: [
    resolve({ extensions }),
    babel({
      extensions,
      babelHelpers: 'bundled',
    }),
    commonjs(),
  ],
}
