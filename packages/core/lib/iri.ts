export function resourcePathFromFilePath(resourcePath: string) {
  resourcePath = resourcePath
    .replace(/\.[^.]+$/, '')
    .replace(/\/?index$/, '')
  return resourcePath === ''
    ? ''
    : encodeURI(resourcePath)
}
