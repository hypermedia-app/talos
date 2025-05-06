import Processor from '@hydrofoil/sparql-processor'
import type { Pattern, ServicePattern } from 'sparqljs'
import rdf from '../env.js'
import log from './log.js'

const endpointPattern = /urn:endpoint:(?<name>[^:]+)/

export default class extends Processor {
  constructor(private readonly endpoints: Record<string, string>) {
    super(rdf)
  }

  override processService(service: ServicePattern): Pattern {
    if (service.name.termType === 'NamedNode' && endpointPattern.test(service.name.value)) {
      const endpointName = service.name.value.match(endpointPattern)?.groups?.name
      if (endpointName) {
        const endpointUrl = this.endpoints[endpointName]
        if (endpointUrl) {
          return {
            ...service,
            name: this.factory.namedNode(endpointUrl),
          }
        } else {
          log.warn(`Endpoint ${endpointName} not found. Set it using --remote-endpoint ${endpointName}=<url>`)
        }
      }
    }

    return super.processService(service)
  }
}
