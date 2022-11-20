import $rdf from 'rdf-ext'
import { ResourcePerGraphStore } from '@hydrofoil/knossos/lib/store.js'
import StreamClient from 'sparql-http-client'
import nodeFetch from 'node-fetch'
import { bootstrap } from '../bootstrap.js'
import { deleteApi } from '../deleteApi.js'
import { fromDirectories } from '../resources.js'
import type { Command } from '.'

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
    })),
  })

  await deleteApi({ apiUri, token, fetch })
}
