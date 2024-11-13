import path from 'path'
import fs from 'fs'
import { walk } from '@fcostarodrigo/walk'
import { QueryEngine } from '@comunica/query-sparql'
import { Store } from 'n3'
import type { DatasetCore } from '@rdfjs/types'
import { translate } from 'sparqlalgebrajs'
import type { Operation } from 'sparqlalgebrajs/lib/algebra.js'
import { types } from 'sparqlalgebrajs/lib/algebra.js'
import toString from 'stream-to-string'
import $rdf from '../env.js'
import log from './log.js'
import { resourcePathFromFilePath } from './iri.js'
import { angleBracketTransform } from './fileStream.js'

export async function applyUpdates(api: string, validDirs: string[], dataset: DatasetCore) {
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
      const algebra = translate(query, { quads: true, baseIRI })

      for (const command of getUpdates(algebra)) {
        await engine.queryVoid(command, {
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

function getUpdates(query: Operation) {
  switch (query.type) {
    case types.COMPOSITE_UPDATE:
      return query.updates
    case types.DELETE_INSERT:
      return [query]
    default:
      log.warn(`Only update queries are supported, got ${query.type}`)
      return []
  }
}
