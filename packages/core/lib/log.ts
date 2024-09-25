import type { AnyLogger, BaseLevels } from 'anylogger'
import Debugger from 'anylogger'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (Debugger as any as AnyLogger<BaseLevels>)('talos')
