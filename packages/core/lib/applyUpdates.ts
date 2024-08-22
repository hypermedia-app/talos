import path from 'path'
import fs from 'fs'
import { walk } from '@fcostarodrigo/walk'
import { QueryEngine } from '@comunica/query-sparql'
import { Store } from 'n3'
import type { DatasetCore } from '@rdfjs/types'
import $rdf from '../env.js'
import log from './log.js'
import { baseIRI } from './baseIRI.js'

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
      log.debug('Applying updates from %s, dataset size %s', relative, store.size)
      const query = fs.readFileSync(file, 'utf-8')
      for (const command of query.split(';')) {
        await engine.queryVoid(command, {
          sources: [destination, store],
          destination,
          baseIRI: baseIRI(relative, api),
        })
      }
      log.debug('Applied updates from %s, dataset size %s', relative, store.size)
      results.addAll(destination)
    }
  }
  return $rdf.dataset([...dataset, ...results])
}
