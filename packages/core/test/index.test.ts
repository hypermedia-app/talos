import { DatasetCore } from 'rdf-js'
import path from 'path'
import url from 'url'
import { expect } from 'chai'
import toCanonical from 'rdf-dataset-ext/toCanonical.js'
import $rdf from '@zazuko/env'
import { talosNs } from '../lib/ns.js'
import { fromDirectories } from '../index.js'

const testDir = url.fileURLToPath(new URL('../../../test-resources', import.meta.url))
const ns = $rdf.namespace('https://example.com')

describe('@hydrofoil/talos-core', () => {
  describe('fromDirectories', () => {
    let dataset: DatasetCore

    beforeEach(async () => {
      const dirs = [
        path.resolve(testDir, './resources'),
        path.resolve(testDir, './resources.foo'),
        path.resolve(testDir, './resources.bar'),
      ]
      dataset = await fromDirectories(dirs, ns().value)
    })

    it('merges resources from multiple graph documents', function () {
      const resource = dataset.match(null, null, null, ns())

      expect(toCanonical(resource)).to.matchSnapshot(this)
    })

    it('merges resources from dataset and graph documents', function () {
      const resource = dataset.match(null, null, null, ns('/trig/users/john-doe'))

      expect(toCanonical(resource)).to.matchSnapshot(this)
    })

    it('merges resources from multiple dataset documents', function () {
      const resource = dataset.match(null, null, null, ns('/trig/users/jane-doe'))

      expect(toCanonical(resource)).to.matchSnapshot(this)
    })

    it('marks a resource for "overwrite" by default', () => {
      const [{ object: action }, ...more] = dataset.match(ns(), talosNs.action, null, talosNs.resources)

      expect(action).to.deep.eq(talosNs.overwrite)
      expect(more).to.be.empty
    })

    it('marks a resource for "merge" when prefix is used', () => {
      const datasetCore = dataset.match(ns('/project/creta/user.group/admins'), talosNs.action, null, talosNs.resources)
      const [{ object: action }, ...more] = datasetCore

      expect(action).to.deep.eq(talosNs.merge)
      expect(more).to.be.empty
    })

    it('uses the last representation when is marked to replace other envs', function () {
      const resource = dataset.match(null, null, null, ns('/only/one'))

      expect(toCanonical(resource)).to.matchSnapshot(this)
    })

    it('uses the last representation when is marked in another env', function () {
      const resource = dataset.match(null, null, null, ns('/only/two'))

      expect(toCanonical(resource)).to.matchSnapshot(this)
    })

    it('uses the last representation when is marked in a dataset document', function () {
      const resource = dataset.match(null, null, null, ns('/only/three'))

      expect(toCanonical(resource)).to.matchSnapshot(this)
    })
  })
})
