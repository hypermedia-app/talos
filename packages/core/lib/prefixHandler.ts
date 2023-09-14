import { NamedNode } from 'rdf-js'

export function optionsFromPrefixes(options: Record<string, unknown>) {
  return (prefix: string, namespace: NamedNode) => {
    if (prefix === 'talos') {
      const [key, value] = namespace.value.split(':')
      if (key && value) {
        options[key] = decodeURIComponent(value)
      }
    }
  }
}
