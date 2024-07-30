import type { ExtraVocab } from '../insertVocabs.js'

export function parseExtraVocabs(value: string, vocabs: ExtraVocab[] = []): ExtraVocab[] {
  const [packageName, ...prefixes] = value.split(',')

  return [
    ...vocabs,
    {
      package: packageName,
      prefixes: prefixes.map(p => p.trim()).filter(p => !!p),
    },
  ]
}
