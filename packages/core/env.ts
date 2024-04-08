import parent, { Environment } from '@zazuko/env-node'
import { TalosNsFactory } from './lib/ns.js'

export default new Environment([TalosNsFactory], { parent })
