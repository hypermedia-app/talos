import path from 'path'
import fs from 'fs'
import type { NamedNode } from '@rdfjs/types'
import { walk } from '@fcostarodrigo/walk'
import type { Dataset } from '@zazuko/env/lib/DatasetExt.js'
import $rdf from './env.js'
import log from './lib/log.js'
import { getPatchedStream } from './lib/fileStream.js'
import { optionsFromPrefixes } from './lib/prefixHandler.js'
import { baseIRI } from './lib/baseIRI.js'
import { applyUpdates } from './lib/applyUpdates.js'

const { talos: ns } = $rdf.ns
export { ns }

interface ResourceOptions {
  existingResource: 'merge' | 'overwrite' | 'skip'
  environmentRepresentation: 'default' | 'replace'
}

export async function fromDirectories(directories: string[], api: string): Promise<Dataset> {
  const validDirs = directories.filter(isValidDir)
  const dataset = await validDirs.reduce(toGraphs(api), Promise.resolve($rdf.dataset()))
  const updatedDataset = await applyUpdates(api, validDirs, dataset)

  setDefaultAction(updatedDataset)

  return updatedDataset
}

function setDefaultAction(dataset: Dataset) {
  const metaGraph = $rdf.clownface({ dataset, graph: $rdf.ns.talos.resources })

  const resourcesToOverwrite = [...dataset]
    .map(({ graph }) => graph)
    .filter(graph => {
      const action = metaGraph.node(graph).out($rdf.ns.talos.action).term
      return (!action || action.equals($rdf.ns.talos.default)) && !graph.equals($rdf.ns.talos.resources)
    })

  metaGraph
    .node(resourcesToOverwrite)
    .deleteOut($rdf.ns.talos.action)
    .addOut($rdf.ns.talos.action, $rdf.ns.talos.overwrite)
}

function toGraphs(api: string) {
  return async function (previousPromise: Promise<Dataset>, dir: string): Promise<Dataset> {
    let previous = await previousPromise
    const dataset = $rdf.dataset()

    log.debug('Processing dir %s', dir)

    for await (const file of walk(dir)) {
      if (file.endsWith('.ru')) {
        continue
      }

      const relative = path.relative(dir, file)
      const url = baseIRI(relative, api)

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
            log.debug('Found graph %s', graph.value)
          }
          resources.add(graph)
          dataset.add($rdf.quad(subject, predicate, object, graph))
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          log.error('Failed to parse %s: %s', relative, e.message)
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

function isValidDir(dir: string) {
  if (!fs.existsSync(dir)) {
    log.warn('Skipping path %s which does not exist', dir)
    return false
  }
  if (!fs.statSync(dir).isDirectory()) {
    log.warn('Skipping path %s which is not a directory', dir)
    return false
  }

  return true
}
