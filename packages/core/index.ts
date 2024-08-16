import path from 'path'
import fs from 'fs'
import type { NamedNode, DatasetCore } from '@rdfjs/types'
import { walk } from '@fcostarodrigo/walk'
import type { Dataset } from '@zazuko/env/lib/DatasetExt.js'
import { QueryEngine } from '@comunica/query-sparql'
import { Store } from 'n3'
import $rdf from './env.js'
import log from './lib/log.js'
import { getPatchedStream } from './lib/fileStream.js'
import { optionsFromPrefixes } from './lib/prefixHandler.js'

const { talos: ns } = $rdf.ns
export { ns }

interface ResourceOptions {
  existingResource: 'merge' | 'overwrite' | 'skip'
  environmentRepresentation: 'default' | 'replace'
}

export async function fromDirectories(directories: string[], api: string): Promise<Dataset> {
  const validDirs = directories.filter(isValidDir)
  let dataset = await validDirs.reduce(toGraphs(api), Promise.resolve($rdf.dataset()))
  dataset = await applyUpdates(api, validDirs, dataset)

  setDefaultAction(dataset)

  return dataset
}

function setDefaultAction(dataset: DatasetCore) {
  $rdf.clownface({ dataset, graph: $rdf.ns.talos.resources })
    .has($rdf.ns.talos.action, $rdf.ns.talos.default)
    .deleteOut($rdf.ns.talos.action, $rdf.ns.talos.default)
    .addOut($rdf.ns.talos.action, $rdf.ns.talos.overwrite)
}

function toGraphs(api: string) {
  return async function (previousPromise: Promise<Dataset>, dir: string): Promise<Dataset> {
    let previous = await previousPromise
    const dataset = $rdf.dataset()

    log.debug('Processing dir %s', dir)

    for await (const file of walk(dir)) {
      const relative = path.relative(dir, file)
      const resourcePath = path.relative(dir, file)
        .replace(/\.[^.]+$/, '')
        .replace(/\/?index$/, '')

      const url = resourcePath === ''
        ? encodeURI(api)
        : encodeURI(`${api}/${resourcePath}`)

      const parserStream = getPatchedStream(file, dir, api, url)
      if (!parserStream) {
        continue
      }

      log.debug('Parsing %s', relative)
      const parsedResourceOptions: Partial<ResourceOptions> = { }
      parserStream.on('prefix', optionsFromPrefixes(parsedResourceOptions))

      const resources = $rdf.termSet<NamedNode>()
      const resourceOptions = $rdf.clownface({ dataset: previous, graph: $rdf.ns.talos.resources })
      try {
        for await (const { subject, predicate, object, ...quad } of parserStream) {
          const graph: NamedNode = quad.graph.equals($rdf.defaultGraph()) ? $rdf.namedNode(url) : quad.graph

          if (!resources.has(graph)) {
            log.debug('Parsed resource %s', graph.value)
          }
          resources.add(graph)
          dataset.add($rdf.quad(subject, predicate, object, graph))
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          log('Failed to parse %s: %s', relative, e.message)
        }
      }

      resources.forEach(id => {
        const action = parsedResourceOptions.existingResource || 'default'
        const environmentRepresentation = parsedResourceOptions.environmentRepresentation || 'default'
        const options = resourceOptions.node(id)
        options
          .deleteOut($rdf.ns.talos.action, $rdf.ns.talos.default)
          .addOut($rdf.ns.talos.action, $rdf.ns.talos(action))
          .deleteOut($rdf.ns.talos.environmentRepresentation, $rdf.ns.talos.default)
          .addOut($rdf.ns.talos.environmentRepresentation, $rdf.ns.talos(environmentRepresentation))

        if (options.has($rdf.ns.talos.environmentRepresentation, $rdf.ns.talos.replace).terms.length) {
          previous = previous.deleteMatches(undefined, undefined, undefined, id)
        }
      })
    }

    previous.addAll(dataset)
    return previous
  }
}

async function applyUpdates(api: string, validDirs: string[], dataset: DatasetCore) {
  const engine = new QueryEngine()
  const store = new Store([...dataset])
  for (const dir of validDirs) {
    for await (const file of walk(dir)) {
      if (file.endsWith('.ru')) {
        const relative = path.relative(dir, file)
        const resourcePath = path.relative(dir, file)
          .replace(/\.[^.]+$/, '')
          .replace(/\/?index$/, '')

        const url = resourcePath === ''
          ? encodeURI(api)
          : encodeURI(`${api}/${resourcePath}`)

        log.debug('Applying updates from %s, dataset size %s', relative, store.size)
        const query = fs.readFileSync(file, 'utf-8')
        await engine.queryVoid(query, {
          sources: [store],
          baseIRI: url,
        })
        log.debug('Applied updates from %s, dataset size %s', relative, store.size)
      }
    }
  }
  return $rdf.dataset(store)
}

function isValidDir(dir: string) {
  if (!fs.existsSync(dir)) {
    log('Skipping path %s which does not exist', dir)
    return false
  }
  if (!fs.statSync(dir).isDirectory()) {
    log('Skipping path %s which is not a directory', dir)
    return false
  }

  return true
}
