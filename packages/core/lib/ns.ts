import type { NsBuildersFactory } from '@tpluscode/rdf-ns-builders/Factory'
import type { NamespaceFactory } from '@rdfjs/namespace/Factory'
import type { Environment } from '@rdfjs/environment/Environment'
import type { NamespaceBuilder } from '@rdfjs/namespace'

type TalosTerms =
  'resources' |
  'action' |
  'default' |
  'overwrite' |
  'skip' |
  'merge'|
  'environmentRepresentation' |
  'replace'

declare module '@tpluscode/rdf-ns-builders' {
  interface CustomNamespaces {
    talos: NamespaceBuilder<TalosTerms>
  }
}

export class TalosNsFactory {
  init(this: Environment<NsBuildersFactory | NamespaceFactory>) {
    this.ns = {
      ...this.ns,
      talos: this.namespace<TalosTerms>('urn:talos:'),
    }
  }
}
