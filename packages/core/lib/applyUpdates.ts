import path from 'path'
import fs from 'fs'
import { walk } from '@fcostarodrigo/walk'
import { QueryEngine } from '@comunica/query-sparql'
import { Store } from 'n3'
import type { DatasetCore } from '@rdfjs/types'
import type { SparqlQuery } from 'sparqljs'
import { Parser, Generator } from 'sparqljs'
import toString from 'stream-to-string'
import $rdf from '../env.js'
import log from './log.js'
import { resourcePathFromFilePath } from './iri.js'
import { angleBracketTransform } from './fileStream.js'
import QueryProcessor from './QueryProcessor.js'

const generator = new Generator()

export async function applyUpdates(api: string, validDirs: string[], dataset: DatasetCore, endpoints: Record<string, string>) {
  const queryProcessor = new QueryProcessor(endpoints)
  const engine = new QueryEngine()
  const store = new Store([...dataset])
  const results = $rdf.dataset()
  for (const dir of validDirs) {
    for await (const file of walk(dir)) {
      if (!file.endsWith('.ru')) {
        continue
      }
      const destination = new Store()
      const relative = path.relative(dir, file)
      const resourcePath = resourcePathFromFilePath(relative)
      const baseIRI = api + '/' + resourcePath + '/'
      log.trace(`Applying updates from ${relative}`)
      const query = await toString(fs.createReadStream(file, 'utf-8').pipe(angleBracketTransform(api, resourcePath)))

      if (!hasBaseIRI(query)) {
        log.info(`No BASE clause in ${relative}. Effective base IRI: ${baseIRI}`)
      }

      const parser = new Parser({ baseIRI })
      const algebra = queryProcessor.process(parser.parse(query))

      for (const command of getUpdates(algebra)) {
        await engine.queryVoid(generator.stringify({
          prefixes: algebra.prefixes,
          type: 'update',
          updates: [command],
        }), {
          sources: [destination, store],
          destination,
          baseIRI,
        })
      }
      results.addAll(destination)
      log.debug(`Applied updates from ${relative}, added ${destination.size} triples`)
    }
  }
  const result = $rdf.dataset([...dataset, ...results])

  log.info(`SPARQL updates applied. Triples before: ${store.size}. Triples after: ${result.size}`)
  return result
}

function hasBaseIRI(query: string) {
  return query.match(/^(?!\s*#)\s*BASE\s+<[^>]*>/m)
}

function getUpdates(query: SparqlQuery) {
  switch (query.type) {
    case 'update':
      return query.updates
    default:
      log.warn(`Only update queries are supported, got ${query.type}`)
      return []
  }
}
