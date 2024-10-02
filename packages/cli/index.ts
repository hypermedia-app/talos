import './lib/anylogger-pino.js'
import type { Logger } from 'pino'
import { program, Option } from 'commander'
import rdf from '@zazuko/env-node'
import { fromDirectories } from '@hydrofoil/talos-core'
import { put } from './lib/command/index.js'
import log from './lib/log.js'
import resourceFilter from './lib/resourceFilter.js'

program
  .addOption(new Option('-v, --verbose', 'Print more information. Can be provided multiple times')
    .argParser(() => {
      (log as unknown as Logger).levelVal -= 10
    }))
  .addOption(new Option('-s, --silent', 'Disable all logs')
    .argParser(() => {
      (log as unknown as Logger).level = 'silent'
    }))

program.command('put [dirs...]')
  .description('Initializes the database from local resource files')
  .requiredOption('--base <base>')
  .requiredOption('--endpoint <endpoint>')
  .option('--updateEndpoint <updateEndpoint>')
  .option('-u, --user <user>')
  .option('-p, --password <password>')
  .action(async (dirs = ['./resources'], arg) => {
    put(dirs, arg)
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
