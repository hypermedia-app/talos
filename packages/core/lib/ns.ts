import $rdf from '@zazuko/env'

type TalosTerms =
  'resources' |
  'action' |
  'default' |
  'overwrite' |
  'skip' |
  'merge'|
  'environmentRepresentation' |
  'replace'

export const talosNs = $rdf.namespace<TalosTerms>('urn:talos:')
