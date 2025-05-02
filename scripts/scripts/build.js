const { spawnSync } = require('child_process')

process.on('unhandledRejection', err => {
  throw err
})

const result = spawnSync(
  'babel',
  [
    '--root-mode=upward',
    'src',
    '--out-dir=lib/cjs',
    '--delete-dir-on-start',
    '--ignore=src/**/*.spec.js,src/**/*.test.js'
  ],
  {
    stdio: 'inherit'
  }
)

if (result.signal) {
  process.exit(1)
}
process.exit(result.status)
