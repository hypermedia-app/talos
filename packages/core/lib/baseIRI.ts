export function baseIRI(resourcePath: string, api: string) {
  resourcePath = resourcePath
    .replace(/\.[^.]+$/, '')
    .replace(/\/?index$/, '')
  return resourcePath === ''
    ? encodeURI(api)
    : encodeURI(`${api}/${resourcePath}`)
}
