import { DatasetCore, Quad } from 'rdf-js'
import StreamClient, { StreamClientOptions } from 'sparql-http-client'
import { prefixes, vocabularies as coreVocabularies } from '@zazuko/vocabularies'
import { prefixes as hydrofoilPrefixes, vocabularies as hydrofoilVocabularies } from '@hydrofoil/vocabularies'
import { INSERT } from '@tpluscode/sparql-builder'
import { sparql } from '@tpluscode/rdf-string'
import $rdf from '@hydrofoil/talos-core/env.js'
import log from './log.js'

export interface ExtraVocab {
  package: string
  prefixes?: string[]
}

function toTriple({ subject, predicate, object }: Quad) {
  return $rdf.quad(subject, predicate, object)
}

function loadExtraVocabs(vocabs: ExtraVocab[], allPrefixes: typeof prefixes): Promise<Record<string, DatasetCore>> {
  return vocabs.reduce(async (previous, vocab) => {
    const datasets = await previous
    const { prefixes: extraPrefixes, vocabularies } = await import(vocab.package)

    Object.assign(allPrefixes, extraPrefixes)

    return {
      ...datasets,
      ...await vocabularies({ only: vocab.prefixes }),
    }
  }, Promise.resolve<Record<string, DatasetCore>>({}))
}

function insertVocab(client: StreamClient, allPrefixes: typeof prefixes) {
  return async ([prefix, vocab]: [string, DatasetCore | undefined]): Promise<void> => {
    if (!vocab) return

    const namespace = $rdf.namedNode(allPrefixes[prefix])

    const insert = INSERT.DATA`GRAPH <${namespace.value}> {
      ${[...vocab].map(toTriple)}
    }`
    const query = sparql`DROP SILENT GRAPH <${namespace.value}>;\n${insert}`.toString()

    log('Inserting vocab %s', namespace.value)
    return client.query.update(query)
  }
}

export async function insertVocabs(options: StreamClientOptions, { extraVocabs = [] }: { extraVocabs?: ExtraVocab[] }): Promise<void> {
  const client = new StreamClient(options)

  const allPrefixes: typeof prefixes = { ...prefixes, ...hydrofoilPrefixes }

  const datasets = {
    ...await coreVocabularies({ only: ['hydra', 'acl', 'as', 'rdf', 'rdfs', 'sh'] }),
    ...await hydrofoilVocabularies(),
    ...await loadExtraVocabs(extraVocabs, allPrefixes),
  }

  await Promise.all(Object.entries(datasets).map(insertVocab(client, allPrefixes)))
}
