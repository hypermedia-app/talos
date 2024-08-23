import path from 'path'
import url from 'url'
import chai, { expect } from 'chai'
import formats from '@rdfjs-elements/formats-pretty'
import type { Dataset } from '@zazuko/env/lib/DatasetExt.js'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import $rdf from '../env.js'
import { fromDirectories } from '../index.js'

const testDir = url.fileURLToPath(new URL('../../../test-resources', import.meta.url))
const ns = $rdf.namespace('https://example.com')

$rdf.formats.import({
  serializers: formats.serializers,
})

describe('@hydrofoil/talos-core', () => {
  chai.use(jestSnapshotPlugin())

  describe('fromDirectories', function () {
    this.timeout(10000)

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

      expect(await resource.serialize({ format: 'application/trig' })).toMatchSnapshot()
    })

    it('merges resources from dataset and graph documents', async function () {
      const resource = dataset.match(null, null, null, ns('/trig/users/john-doe'))

      expect(await resource.serialize({ format: 'application/trig' })).toMatchSnapshot()
    })

    it('merges resources from multiple dataset documents', async function () {
      const resource = dataset.match(null, null, null, ns('/trig/users/jane-doe'))

      expect(await resource.serialize({ format: 'application/trig' })).toMatchSnapshot()
    })

    it('marks a resource for "overwrite" by default', () => {
      const match = dataset.match(ns(), $rdf.ns.talos.action, null, $rdf.ns.talos.resources)
      const [{ object: action }, ...more] = match

      expect(action).to.deep.equal($rdf.ns.talos.overwrite)
      expect(more).to.be.empty
    })

    it('marks a resource for "merge" when prefix is used', () => {
      const datasetCore = dataset.match(ns('/project/creta/user.group/admins'), $rdf.ns.talos.action, null, $rdf.ns.talos.resources)
      const [{ object: action }, ...more] = datasetCore

      expect(action.equals($rdf.ns.talos.merge)).to.be.true
      expect(more).to.be.empty
    })

    it('uses the last representation when is marked to replace other envs', async function () {
      const resource = dataset.match(null, null, null, ns('/only/one'))

      expect(await resource.serialize({ format: 'application/trig' })).toMatchSnapshot()
    })

    it('uses the last representation when is marked in another env', async function () {
      const resource = dataset.match(null, null, null, ns('/only/two'))

      expect(await resource.serialize({ format: 'application/trig' })).toMatchSnapshot()
    })

    it('uses the last representation when is marked in a dataset document', async function () {
      const resource = dataset.match(null, null, null, ns('/only/three'))

      expect(await resource.serialize({ format: 'application/trig' })).toMatchSnapshot()
    })

    it('adds data with SPARQL', async function () {
      const resource = dataset.match(null, null, null, ns('/trig/users/john-doe-additional'))

      expect(await resource.serialize({ format: 'application/trig' })).toMatchSnapshot()
    })

    it('successfully executed federated query', () => {
      const cubes = $rdf.clownface({
        dataset: dataset.match(null, null, null, ns('/lindas-cubes')),
      }).has($rdf.ns.rdf.type, $rdf.namedNode('https://cube.link/Cube'))

      expect(cubes.values).to.have.property('length').greaterThan(0)
    })

    it('marks generated resources to overwrite', () => {
      const [action] = dataset.match(ns('/lindas-cubes'), $rdf.ns.talos.action, null, $rdf.ns.talos.resources)

      expect(action.object).to.deep.equal($rdf.ns.talos.overwrite)
    })

    it('excludes urn:talos:resources from the output', async function () {
      expect(dataset.match($rdf.ns.talos.resources, null, null, $rdf.ns.talos.resources))
        .to.have.property('size').equal(0)
    })
  })
})
