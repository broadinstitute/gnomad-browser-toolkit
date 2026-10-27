import { expect, test } from '@jest/globals'
import path from 'path'
import ts from 'typescript'

test('the inspection store compiles with declared browser libraries, without ambient Node types', () => {
  const configPath = path.resolve(__dirname, '../tsconfig.build.json')
  const config = ts.readConfigFile(configPath, ts.sys.readFile)
  expect(config.error).toBeUndefined()
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath
  )
  expect(parsed.errors).toEqual([])

  // Node's transitive library references can otherwise hide undeclared browser library requirements.
  const program = ts.createProgram([path.resolve(__dirname, 'positionInspection.ts')], {
    ...parsed.options,
    noEmit: true,
    types: ['react']
  })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  expect(
    diagnostics.map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
  ).toEqual([])
})
