import { expect, test } from '@jest/globals'
import path from 'path'
import ts from 'typescript'

// The workspace tsconfig is not strict, so compile consumer code the way strict apps such as gnomAD do.
const strictConsumerDiagnostics = (source: string): string[] => {
  const consumerPath = path.resolve(__dirname, '__strictConsumer.tsx')
  const host = ts.createCompilerHost({})
  const getSourceFile = host.getSourceFile.bind(host)
  host.getSourceFile = (fileName, languageVersion, ...rest) => {
    return fileName === consumerPath
      ? ts.createSourceFile(fileName, source, languageVersion)
      : getSourceFile(fileName, languageVersion, ...rest)
  }
  const fileExists = host.fileExists.bind(host)
  host.fileExists = fileName => fileName === consumerPath || fileExists(fileName)
  const program = ts.createProgram(
    [consumerPath],
    {
      strict: true,
      noEmit: true,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      lib: ['lib.dom.d.ts', 'lib.es2015.d.ts'],
      types: ['react'],
      skipLibCheck: true
    },
    host
  )
  return ts
    .getPreEmitDiagnostics(program)
    .filter(diagnostic => diagnostic.file?.fileName === consumerPath)
    .map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
}

test('strict consumers can pass number-only click handlers to Cursor and Track', () => {
  const diagnostics = strictConsumerDiagnostics(`
    import React from 'react'
    import { Cursor } from './Cursor'
    import { Track } from './Track'

    const scrollToPosition = (position: number) => position.toFixed()

    export const cursor = <Cursor onClick={scrollToPosition} />
    export const track = (
      <Track positionInspection={{ onClick: scrollToPosition }}>{() => <svg />}</Track>
    )
  `)
  expect(diagnostics).toEqual([])
})
