import path from 'path'
import fs from 'fs'
import { walk } from '@fcostarodrigo/walk'
import { QueryEngine } from '@comunica/query-sparql'
import { Store } from 'n3'
import type { DatasetCore } from '@rdfjs/types'
import { translate } from 'sparqlalgebrajs'
import type { Operation } from 'sparqlalgebrajs/lib/algebra.js'
import { types } from 'sparqlalgebrajs/lib/algebra.js'
import $rdf from '../env.js'
import log from './log.js'
import { baseIRI as getBaseIRI } from './baseIRI.js'

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
      const baseIRI = getBaseIRI(relative, api)
      log.trace(`Applying updates from ${relative}`)
      const query = fs.readFileSync(file, 'utf-8')

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
