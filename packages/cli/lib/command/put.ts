import $rdf from '@hydrofoil/talos-core/env.js'
import { ResourcePerGraphStore } from '@hydrofoil/resource-store'
import StreamClient from 'sparql-http-client'
import type nodeFetch from 'node-fetch'
import { fromDirectories } from '@hydrofoil/talos-core'
import { bootstrap } from '@hydrofoil/talos-core/bootstrap.js'
import { deleteApi } from '../deleteApi.js'
import type { Command } from './index.js'

export interface Put extends Command {
  api: string
  apiPath?: string
  fetch?: typeof nodeFetch
}

export async function put(directories: string[], { token, api, endpoint, updateEndpoint, user, password, apiPath = '/api', fetch }: Put) {
  const apiUri = $rdf.namedNode(`${api}${apiPath}`)

  const dataset = await fromDirectories(directories, api)

  await bootstrap({
    dataset,
    apiUri,
    store: new ResourcePerGraphStore(new StreamClient({
      endpointUrl: endpoint,
      updateUrl: updateEndpoint || endpoint,
      user,
      password,
    }), $rdf),
  })

  await deleteApi({ apiUri, token, fetch })
}
