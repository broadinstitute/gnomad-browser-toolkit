const { spawnSync } = require('child_process')

process.on('unhandledRejection', err => {
  throw err
})

// babel src --extensions=.ts --ignore=src/**/*.spec.js --out-dir=lib/cjs
const result = spawnSync(
  'babel',
  [
    'src',
    '--extensions=.ts',
    '--ignore=src/**/*.spec.js',
    '--out-dir=lib/cjs',
  ],
  {
    stdio: 'inherit',
  }
)

if (result.signal) {
  process.exit(1)
}
process.exit(result.status)
