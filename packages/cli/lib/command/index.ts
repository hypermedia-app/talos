export { put } from './put.js'

export interface Command {
  endpoint: string
  updateEndpoint?: string
  user?: string
  password?: string
  remoteEndpoint?: Record<string, string>
}
