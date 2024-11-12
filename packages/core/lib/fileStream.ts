import fs from 'fs'
import type { Readable } from 'stream'
import path from 'path'
import * as mime from 'mime-types'
import replaceStream from 'replacestream'
import isAbsoluteUrl from 'is-absolute-url'
import rdf from '../env.js'
import log from './log.js'
import { resolveResourceUri } from './streamPatchTransform.js'

function replacer(baseUri: string, resourcePath: string, s: string, e = s) {
  const resolve = resolveResourceUri(baseUri, resourcePath)

  return (_: unknown, match: string) => {
    if (isAbsoluteUrl(match)) {
      return `${s}${match}${e}`
    }

    return `${s}${resolve(match)}${e}`
  }
}

export const angleBracketTransform = (baseUri: string, resourcePath: string) => replaceStream(/<([^>]*)>(?=([^"\\]*(\\.|"([^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g, replacer(baseUri, resourcePath, '<', '>'))
export const jsonTransform = (baseUri: string, resourcePath: string) => replaceStream(/"([./][^"]+)"/g, replacer(baseUri, resourcePath, '"'))

export const filePatchTransforms = new Map([
  ['text/turtle', angleBracketTransform],
  ['application/n-triples', angleBracketTransform],
  ['application/n-quads', angleBracketTransform],
  ['application/trig', angleBracketTransform],
  ['application/ld+json', jsonTransform],
])

export function getPatchedStream(file: string, cwd: string, baseIRI: string, resourcePath: string): Readable | null {
  const relative = path.relative(cwd, file)
  const mediaType = mime.lookup(file)
  if (!mediaType) {
    log.warn(`Could not determine media type for file ${relative}`)
    return null
  }

  let fileStream = fs.createReadStream(file)
  if (filePatchTransforms.has(mediaType)) {
    fileStream = fileStream.pipe(filePatchTransforms.get(mediaType)!(baseIRI, resourcePath))
  }

  const parserStream = rdf.formats.parsers.import(mediaType, fileStream, {
    baseIRI,
    blankNodePrefix: '',
  })

  if (!parserStream) {
    log.warn(`Unsupported media type ${mediaType} from ${relative}`)
  }

  return parserStream as unknown as Readable | null
}
