import { program } from 'commander'
import rdf from '@zazuko/env-node'
import { fromDirectories } from '@hydrofoil/talos-core'
import { put, putVocabs } from './lib/command/index.js'
import { parseExtraVocabs } from './lib/command/extraVocabs.js'
import log from './lib/log.js'
import resourceFilter from './lib/resourceFilter.js'

program.command('put [dirs...]')
  .description('Initializes the database from local resource files')
  .requiredOption('--api <api>')
  .requiredOption('--endpoint <endpoint>')
  .option('--updateEndpoint <updateEndpoint>')
  .option('--token <token>', 'System authentication token')
  .option('-u, --user <user>')
  .option('-p, --password <password>')
  .option('--apiPath <apiPath>', 'The path of the API Documentation resource', '/api')
  .action(async (dirs = ['./resources'], arg) => {
    put(dirs, arg)
      .catch((e) => {
        log(e)
        process.exit(1)
      })
  })

program.command('put-vocabs')
  .description('Inserts vocabulary graphs into the database')
  .option('--apiDoc <apiDoc>')
  .requiredOption('--endpoint <endpoint>')
  .option('--token <token>', 'System authentication token')
  .option('-u, --user <user>')
  .option('-p, --password <password>')
  .option('--extraVocabs <...extraVocab>', 'Package name and (optionally) comma-separated prefixes', parseExtraVocabs)
  .action((arg) => {
    putVocabs(arg)
      .catch((e) => {
        log(e)
        process.exit(1)
      })
  })

program.command('print [dirs...]')
  .requiredOption('--base <base>')
  .option('--include-talos-meta-graph')
  .description('Prints the resources')
  .action(async (dirs = ['./resources'], { base, includeTalosMetaGraph } = { base: '' }) => {
    const dataset = await fromDirectories(dirs, base)

    const quads = dataset.toStream().pipe(resourceFilter({ includeTalosMetaGraph }))
    const nquads = rdf.formats.serializers.import('application/n-quads', quads) as unknown as NodeJS.ReadableStream
    nquads.pipe(process.stdout)
  })

program.parse(process.argv)
