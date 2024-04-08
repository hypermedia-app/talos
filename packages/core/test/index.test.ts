import path from 'path'
import url from 'url'
import { expect } from 'chai'
import formats from '@rdfjs-elements/formats-pretty'
import type { Dataset } from '@zazuko/env/lib/DatasetExt.js'
import $rdf from '../env.js'
import { fromDirectories } from '../index.js'

const testDir = url.fileURLToPath(new URL('../../../test-resources', import.meta.url))
const ns = $rdf.namespace('https://example.com')

$rdf.formats.import(formats)

describe('@hydrofoil/talos-core', () => {
  describe('fromDirectories', () => {
    let dataset: Dataset

    beforeEach(async () => {
      const dirs = [
        path.resolve(testDir, './resources'),
        path.resolve(testDir, './resources.foo'),
        path.resolve(testDir, './resources.bar'),
      ]
      dataset = await fromDirectories(dirs, ns().value)
    })

    it('merges resources from multiple graph documents', async function () {
      const resource = dataset.match(null, null, null, ns())

      expect(await resource.serialize({ format: 'application/trig' })).to.matchSnapshot(this)
    })

    it('merges resources from dataset and graph documents', async function () {
      const resource = dataset.match(null, null, null, ns('/trig/users/john-doe'))

      expect(await resource.serialize({ format: 'application/trig' })).to.matchSnapshot(this)
    })

    it('merges resources from multiple dataset documents', async function () {
      const resource = dataset.match(null, null, null, ns('/trig/users/jane-doe'))

      expect(await resource.serialize({ format: 'application/trig' })).to.matchSnapshot(this)
    })

    it('marks a resource for "overwrite" by default', () => {
      const match = dataset.match(ns(), $rdf.ns.talos.action, null, $rdf.ns.talos.resources)
      const [{ object: action }, ...more] = match

      expect(action).to.deep.eq($rdf.ns.talos.overwrite)
      expect(more).to.be.empty
    })

    it('marks a resource for "merge" when prefix is used', () => {
      const datasetCore = dataset.match(ns('/project/creta/user.group/admins'), $rdf.ns.talos.action, null, $rdf.ns.talos.resources)
      const [{ object: action }, ...more] = datasetCore

      expect(action).to.deep.eq($rdf.ns.talos.merge)
      expect(more).to.be.empty
    })

    it('uses the last representation when is marked to replace other envs', async function () {
      const resource = dataset.match(null, null, null, ns('/only/one'))

      expect(await resource.serialize({ format: 'application/trig' })).to.matchSnapshot(this)
    })

    it('uses the last representation when is marked in another env', async function () {
      const resource = dataset.match(null, null, null, ns('/only/two'))

      expect(await resource.serialize({ format: 'application/trig' })).to.matchSnapshot(this)
    })

    it('uses the last representation when is marked in a dataset document', async function () {
      const resource = dataset.match(null, null, null, ns('/only/three'))

      expect(await resource.serialize({ format: 'application/trig' })).to.matchSnapshot(this)
    })
  })
})
