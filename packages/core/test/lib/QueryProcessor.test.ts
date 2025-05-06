import type { SelectQuery } from 'sparqljs'
import { Parser } from 'sparqljs'
import { expect } from 'chai'
import QueryProcessor from '../../lib/QueryProcessor.js'

const parser = new Parser()

describe('@hydrofoil/talos-core/lib/QueryProcessor', () => {
  it('does not modify endpoints without URL', () => {
    // given
    const processor = new QueryProcessor({})
    const query = parser.parse('SELECT * WHERE { SERVICE <urn:endpoint:foobar> { ?s ?p ?o } }') as SelectQuery

    // when
    const result = processor.process(query) as SelectQuery

    // then
    expect(result.where).to.deep.eq(query.where)
  })
})
