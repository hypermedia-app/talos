import { Transform } from 'node:stream'
import type { Quad } from '@rdfjs/types'
import $rdf from '@hydrofoil/talos-core/env.js'

interface Options {
  includeTalosMetaGraph?: boolean
}

export default ({ includeTalosMetaGraph }: Options) => Transform.from(async function * (source: AsyncIterable<Quad>) {
  for await (const quad of source) {
    if (includeTalosMetaGraph || !quad.graph.equals($rdf.ns.talos.resources)) {
      yield quad
    }
  }
})
