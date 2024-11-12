export function resolveResourceUri(baseUri: string, resourcePath: string) {
  const basePath = new URL(baseUri).pathname.split('/').filter(Boolean)

  if (resourcePath.endsWith('/')) {
    throw new Error('Resource URL must not end with a slash')
  }
  if (resourcePath.startsWith('/')) {
    throw new Error('Resource URL must not start with a slash')
  }

  return (path: string) => {
    if (path === '/') {
      return baseUri
    }
    if ((path === '' || path === '.') && resourcePath === '') {
      return baseUri
    }

    if (path.startsWith('/')) {
      return new URL('/' + mergePaths(basePath, path.split('/').slice(1)).join('/'), baseUri).toString()
    }

    const combinedPath = [...basePath, ...resourcePath.split('/').filter(Boolean)]
    if (path.startsWith('#') || path === '') {
      const url = new URL('/' + combinedPath.join('/'), baseUri)
      if (path) {
        url.hash = path
      }
      return url.toString()
    }

    return new URL('/' + mergePaths(combinedPath, path.split('/')).join('/'), baseUri).toString()
  }
}

function mergePaths(basePath: string[], resourcePath: string[]) {
  const result = basePath.slice()
  if (!resourcePath.length) {
    return result
  }

  for (const segment of resourcePath) {
    if (segment === '.') {
      continue
    }
    if (segment === '..') {
      result.pop()
      continue
    }
    result.push(segment)
  }

  return result
}
