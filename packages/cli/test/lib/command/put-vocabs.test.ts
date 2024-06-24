import type { NamedNode } from '@rdfjs/types'
import ParsingClient from 'sparql-http-client/ParsingClient.js'
import { ASK, DELETE, SELECT } from '@tpluscode/sparql-builder'
import { acl, as, hydra, rdfs } from '@tpluscode/rdf-ns-builders'
import { expect } from 'chai'
import * as externalVocabs from '@zazuko/vocabulary-extras/builders'
import { putVocabs, PutVocabs } from '../../../lib/command/put-vocabs.js'

describe('@hydrofoil/talos/lib/command/put-vocabs', function () {
  this.timeout(5000)

  const params: PutVocabs = {
    endpoint: 'http://db.talos.lndo.site/repositories/tests',
    user: 'minos',
    password: 'password',
  }

  const client = new ParsingClient({
    endpointUrl: 'http://db.talos.lndo.site/repositories/tests',
    updateUrl: 'http://db.talos.lndo.site/repositories/tests',
    user: 'minos',
    password: 'password',
  })

  before(async () => {
    await DELETE`?s ?p ?o`.WHERE`?s ?p ?o`.execute(client)
  })

  describe('--', () => {
    before(async () => {
      await putVocabs(params)
    })

    const vocabs: Array<[string, NamedNode]> = [
      ['hydra', hydra()],
      ['acl', acl()],
      ['as', as()],
      ['rdfs', rdfs()],
      ['rdf', rdfs()],
      ['sh', rdfs()],
    ]

    for (const [prefix, namespace] of vocabs) {
      it(`inserts ${prefix} into graph ${namespace.value}`, async () => {
        const results = await SELECT`(count(*) as ?count)`
          .WHERE`?s ?p ?o`
          .FROM(namespace).execute(client)

        expect(parseInt(results[0].count.value)).to.be.greaterThan(0)
      })
    }
  })

  describe('--extraVocab', () => {
    const vocabs = Object.values(externalVocabs).map((ns) => ns())

    beforeEach(async () => {
      await DELETE`?s ?p ?o`.WHERE`?s ?p ?o`.execute(client)
    })

    it('inserts all vocabs when no specific prefixes selected', async () => {
      // when
      await putVocabs({
        ...params,
        extraVocabs: [{
          package: '@zazuko/vocabulary-extras',
        }],
      })

      // then
      for (const namespace of vocabs) {
        const results = await SELECT`(count(*) as ?count)`
          .WHERE`?s ?p ?o`
          .FROM(namespace).execute(client)

        expect(parseInt(results[0].count.value)).to.be.greaterThan(0)
      }
    })

    it('inserts specific vocabs', async () => {
      // when
      await putVocabs({
        ...params,
        extraVocabs: [{
          package: '@zazuko/vocabulary-extras',
          prefixes: ['code'],
        }],
      })

      // then
      const hasWba = await ASK`?s ?p ?o`.FROM(externalVocabs.code()).execute(client)
      expect(hasWba).to.be.true

      const hasOther = await ASK`?s ?p ?o`
        .FROM(externalVocabs.b59()).FROM(externalVocabs.meta())
        .execute(client)
      expect(hasOther).to.be.false
    })
  })
})
