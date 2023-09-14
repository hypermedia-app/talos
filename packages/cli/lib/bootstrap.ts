import { NamedNode, DatasetCore } from 'rdf-js'
import type { ResourceStore } from '@hydrofoil/resource-store'
import { isNamedNode } from 'is-graph-pointer'
import $rdf from '@zazuko/env'
import { ns as talosNs } from '@hydrofoil/talos-core'
import addAll from 'rdf-dataset-ext/addAll.js'
import log from './log.js'

type Bootstrap = {
  store: ResourceStore
  dataset: DatasetCore
  apiUri: NamedNode
}

export async function bootstrap({ dataset, apiUri, store }: Bootstrap): Promise<void> {
  const graph = $rdf.clownface({ dataset, graph: talosNs.resources })
  const resources = graph.has(talosNs.action)
  for (const resource of resources.toArray().filter(isNamedNode)) {
    const resourceData = [...dataset.match(null, null, null, resource.term)]
      .map(({ subject, predicate, object }) => $rdf.quad(subject, predicate, object))
    const pointer = $rdf.clownface({
      dataset: $rdf.dataset(resourceData),
    })
      .namedNode(resource)
      .addOut($rdf.ns.hydra.apiDocumentation, apiUri)

    const action = resource.out(talosNs.action).term
    const exists = await store.exists(pointer.term)
    if (exists && talosNs.skip.equals(action)) {
      log(`Skipping resource ${resource}`)
      continue
    }

    if (exists) {
      if (talosNs.merge.equals(action)) {
        log(`Merging existing resource ${resource}`)
        const current = await store.load(pointer.term)
        addAll(pointer.dataset, current.dataset)
      } else {
        log(`Replacing resource ${resource}`)
      }
    } else {
      log(`Creating resource ${resource}`)
    }

    await store.save(pointer)
  }
}
