import type { Readable, Stream } from 'stream'
import { expect } from 'chai'
import rdf from '@zazuko/env-node'
import toStream from 'into-stream'
import getStream from 'get-stream'
import { optionsFromPrefixes } from '../../lib/prefixHandler.js'

describe('@hydrofoil/talos-core/lib/prefixHandler', () => {
  function parse(str: string) {
    return rdf.formats.parsers.import('text/turtle', toStream(str)) as unknown as Stream & Readable
  }

  describe('optionsFromPrefixes', () => {
    it('sets options from parsed prefixes', async () => {
      // given
      const options = {}

      // when
      const stream = parse(`prefix talos: <foo:bar>
prefix talos: <foo:baz>
prefix talos: <another:also%20baz>`)
      stream.on('prefix', optionsFromPrefixes(options))
      await getStream(stream)

      // then
      expect(options).to.have.property('foo', 'baz')
      expect(options).to.have.property('another', 'also baz')
    })

    it('ignores other prefixes', async () => {
      // given
      const options = {}

      // when
      const stream = parse('prefix schema: <http://schema.org/>')
      stream.on('prefix', optionsFromPrefixes(options))
      await getStream(stream)

      // then
      expect(options).to.deep.eq({})
    })
  })
})
