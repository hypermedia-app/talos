import StreamClient from 'sparql-http-client/StreamClient.js'
import { sparql } from '@tpluscode/rdf-string'
import { DELETE, INSERT } from '@tpluscode/sparql-builder'
import type { SparqlValue } from '@tpluscode/rdf-string'

export const client = new StreamClient({
  endpointUrl: 'http://db.talos.lndo.site/repositories/tests?infer=true',
  updateUrl: 'http://db.talos.lndo.site/repositories/tests',
  user: 'minos',
  password: 'password',
})

export function testData(strings: TemplateStringsArray, ...values: SparqlValue[]): Promise<void> {
  const dataset = sparql(strings, ...values)

  const del = DELETE`?s ?p ?o`.WHERE`?s ?p ?o`
  const insert = INSERT.DATA`${dataset}`

  const query = sparql`${del};${insert}`

  return client.query.update(query.toString())
}
