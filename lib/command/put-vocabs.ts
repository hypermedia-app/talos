import $rdf from 'rdf-ext'
import { ExtraVocab, insertVocabs } from '../insertVocabs.js'
import { deleteApi } from '../deleteApi.js'
import { log } from '../log.js'
import type { Command } from '.'

export interface PutVocabs extends Command {
  apiDoc?: string
  extraVocabs?: Array<ExtraVocab>
}

export async function putVocabs({ token, endpoint, user, password, extraVocabs, apiDoc }: PutVocabs) {
  await insertVocabs({
    endpointUrl: endpoint,
    updateUrl: endpoint,
    user,
    password,
  }, {
    extraVocabs,
  }).then(() => log('Inserted vocabularies'))

  if (apiDoc) {
    await deleteApi({
      apiUri: $rdf.namedNode(apiDoc),
      token,
    })
  }
}
