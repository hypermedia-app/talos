import { Duplex } from 'node:stream'
export default async (options) => {
  return Duplex.from(async function * () {
    for await (const chunk of options.source) {
      yield chunk
    }
  })
}
