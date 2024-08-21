import type { NamedNode, DatasetCore } from '@rdfjs/types'
import type { ResourceStore } from '@hydrofoil/resource-store'
import { isNamedNode } from 'is-graph-pointer'
import $rdf from './env.js'
import log from './lib/log.js'

type Bootstrap = {
  store: ResourceStore
  dataset: DatasetCore
  apiUri?: NamedNode
}

export async function bootstrap({ dataset, apiUri, store }: Bootstrap): Promise<void> {
  const graph = $rdf.clownface({ dataset, graph: $rdf.ns.talos.resources })
  const resources = graph.has($rdf.ns.talos.action)
  for (const resource of resources.toArray().filter(isNamedNode)) {
    const resourceData = [...dataset.match(null, null, null, resource.term)]
      .map(({ subject, predicate, object }) => $rdf.quad(subject, predicate, object))
    const pointer = $rdf.clownface({
      dataset: $rdf.dataset(resourceData),
      term: resource.term,
    })

    if (apiUri) {
      pointer.addOut($rdf.ns.hydra.apiDocumentation, apiUri)
    }

    const action = resource.out($rdf.ns.talos.action).term
    const exists = await store.exists(pointer.term)
    if (exists && $rdf.ns.talos.skip.equals(action)) {
      log(`Skipping resource ${resource}`)
      continue
    }

    if (exists) {
      if ($rdf.ns.talos.merge.equals(action)) {
        log(`Merging existing resource ${resource}`)
        const current = await store.load(pointer.term)
        pointer.dataset.addAll(current.dataset)
      } else {
        log(`Replacing resource ${resource}`)
      }
    } else {
      log(`Creating resource ${resource}`)
    }

    await store.save(pointer)
  }
}
