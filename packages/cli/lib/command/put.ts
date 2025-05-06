import $rdf from '@hydrofoil/talos-core/env.js'
import { ResourcePerGraphStore } from '@hydrofoil/resource-store'
import StreamClient from 'sparql-http-client'
import { fromDirectories } from '@hydrofoil/talos-core'
import { bootstrap } from '@hydrofoil/talos-core/bootstrap.js'
import type { Command } from './index.js'

export interface Put extends Command {
  base: string
}

export async function put(directories: string[], { base, endpoint, updateEndpoint, user, password, remoteEndpoint }: Put) {
  const dataset = await fromDirectories(directories, base, {
    endpoints: remoteEndpoint,
  })

  await bootstrap({
    dataset,
    store: new ResourcePerGraphStore(new StreamClient({
      endpointUrl: endpoint,
      updateUrl: updateEndpoint || endpoint,
      user,
      password,
    }), $rdf),
  })
}
