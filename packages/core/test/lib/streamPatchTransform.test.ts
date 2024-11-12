import { expect } from 'chai'
import { resolveResourceUri } from '../../lib/streamPatchTransform.js'

describe('@hydrofoil/talos-core/lib/streamPatchTransform.js', () => {
  describe('resolveResourceUri', () => {
    [
      // base is bare domain
      ['http://example.com', 'foo', '', 'http://example.com/foo'],
      ['http://example.com', 'foo', 'bar', 'http://example.com/foo/bar'],
      ['http://example.com', 'foo', '.', 'http://example.com/foo'],
      ['http://example.com', 'foo', './', 'http://example.com/foo/'],
      // base is bare domain, root resource
      ['http://example.com', '', '', 'http://example.com/'],
      ['http://example.com', '', 'bar', 'http://example.com/bar'],
      ['http://example.com', '', '.', 'http://example.com/'],
      ['http://example.com', '', './', 'http://example.com/'],
      ['http://example.com', '', '/', 'http://example.com/'],
      // base is URL with path
      ['http://example.com/foo', 'bar', '', 'http://example.com/foo/bar'],
      ['http://example.com/foo', 'bar', 'baz', 'http://example.com/foo/bar/baz'],
      ['http://example.com/foo', 'bar', '.', 'http://example.com/foo/bar'],
      ['http://example.com/foo', 'bar', '..', 'http://example.com/foo'],
      ['http://example.com/foo', 'bar', '../', 'http://example.com/foo/'],
      ['http://example.com/foo', 'bar', '../baz', 'http://example.com/foo/baz'],
      ['http://example.com/foo', 'bar', '../baz/', 'http://example.com/foo/baz/'],
      ['http://example.com/foo', 'bar', './', 'http://example.com/foo/bar/'],
      ['http://example.com/foo/bar/baz', 'lol', '../../..', 'http://example.com/foo'],
      ['http://example.com/foo/bar/baz', 'lol', '../../../', 'http://example.com/foo/'],
      ['http://example.com/foo/bar/baz', 'lol', '../../../..', 'http://example.com/'],
      ['http://example.com/foo/bar/baz', 'lol', '../../../../', 'http://example.com/'],
      // URL reference is absolute
      ['http://example.com', 'ignore', '/xyz', 'http://example.com/xyz'],
      ['http://example.com/foo', 'ignore', '/xyz', 'http://example.com/foo/xyz'],
      ['http://example.com/foo/bar', 'ignore', '/xyz', 'http://example.com/foo/bar/xyz'],
      ['http://example.com', 'ignore', '/xyz/', 'http://example.com/xyz/'],
      ['http://example.com/foo', 'ignore', '/xyz/', 'http://example.com/foo/xyz/'],
      ['http://example.com/foo/bar', 'ignore', '/xyz/', 'http://example.com/foo/bar/xyz/'],
      // URL reference is plain slash => keep base as-is
      ['http://example.com', 'ignore', '/', 'http://example.com/'],
      ['http://example.com/', 'ignore', '/', 'http://example.com/'],
      ['http://example.com/foo', 'ignore', '/', 'http://example.com/foo'],
      ['http://example.com/foo/bar', 'ignore', '/', 'http://example.com/foo/bar'],
      ['http://example.com/foo', 'ignore', '/', 'http://example.com/foo'],
      ['http://example.com/foo/bar', 'ignore', '/', 'http://example.com/foo/bar'],
      // hash references
      ['http://example.com', '', '#this', 'http://example.com/#this'],
      ['http://example.com/', '', '#this', 'http://example.com/#this'],
      ['http://example.com', 'bar', '#this', 'http://example.com/bar#this'],
      ['http://example.com/', 'bar', '#this', 'http://example.com/bar#this'],
      ['http://example.com/baz', 'bar', '#this', 'http://example.com/baz/bar#this'],
      ['http://example.com/baz/', 'bar', '#this', 'http://example.com/baz/bar#this'],
      ['http://example.com', '', 'foo#this', 'http://example.com/foo#this'],
      ['http://example.com/', '', 'foo#this', 'http://example.com/foo#this'],
      ['http://example.com', 'bar', 'foo#this', 'http://example.com/bar/foo#this'],
      ['http://example.com/', 'bar', 'foo#this', 'http://example.com/bar/foo#this'],
      ['http://example.com/baz', 'bar', 'foo#this', 'http://example.com/baz/bar/foo#this'],
      ['http://example.com/baz/', 'bar', 'foo#this', 'http://example.com/baz/bar/foo#this'],
    ].forEach(([baseUri, resourcePath, input, expected]) => {
      it(`${baseUri} + <${resourcePath}> + <${input}> -> ${expected}`, () => {
        expect(resolveResourceUri(baseUri, resourcePath)(input)).to.equal(expected)
      })
    })
  })
})
