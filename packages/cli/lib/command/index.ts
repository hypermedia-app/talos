export { put } from './put.js'
export { putVocabs } from './put-vocabs.js'

export interface Command {
  endpoint: string
  updateEndpoint?: string
  token?: string
  user?: string
  password?: string
}
