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
      log.debug('Applying updates from %s, dataset size %s', relative, store.size)
      const query = fs.readFileSync(file, 'utf-8')

      const algebra = translate(query, { quads: true, baseIRI })
      for (const command of getUpdates(algebra)) {
        await engine.queryVoid(command, {
          sources: [destination, store],
          destination,
          baseIRI,
        })
      }
      log.debug('Applied updates from %s, dataset size %s', relative, store.size)
      results.addAll(destination)
    }
  }
  return $rdf.dataset([...dataset, ...results])
}

function getUpdates(query: Operation) {
  switch (query.type) {
    case types.COMPOSITE_UPDATE:
      return query.updates
    case types.DELETE_INSERT:
      return [query]
    default:
      log.debug('Only update queries are allowed')
      return []
  }
}
