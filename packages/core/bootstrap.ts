import type { DatasetCore } from '@rdfjs/types'
import type { ResourceStore } from '@hydrofoil/resource-store'
import { isNamedNode } from 'is-graph-pointer'
import $rdf from './env.js'
import log from './lib/log.js'

type Bootstrap = {
  store: ResourceStore
  dataset: DatasetCore
}

export async function bootstrap({ dataset, store }: Bootstrap): Promise<void> {
  const graph = $rdf.clownface({ dataset, graph: $rdf.ns.talos.resources })
  const resources = graph.has($rdf.ns.talos.action)
  const summary = {
    created: 0,
    updated: 0,
    skipped: 0,
  }

  for (const resource of resources.toArray().filter(isNamedNode)) {
    const resourceData = [...dataset.match(null, null, null, resource.term)]
      .map(({ subject, predicate, object }) => $rdf.quad(subject, predicate, object))
    const pointer = $rdf.clownface({
      dataset: $rdf.dataset(resourceData),
      term: resource.term,
    })

    const action = resource.out($rdf.ns.talos.action).term
    const exists = await store.exists(pointer.term)
    if (exists && $rdf.ns.talos.skip.equals(action)) {
      summary.skipped++
      log(`Skipping graph ${resource}`)
      continue
    }

    if (exists) {
      summary.updated++
      if ($rdf.ns.talos.merge.equals(action)) {
        log(`Merging with existing graph ${resource}`)
        const current = await store.load(pointer.term)
        pointer.dataset.addAll(current.dataset)
      } else {
        log(`Replacing graph ${resource}`)
      }
    } else {
      summary.created++
      log(`Creating graph ${resource}`)
    }

    await store.save(pointer)
  }

  log.info('Graphs bootstrapped: %o', summary)
}
