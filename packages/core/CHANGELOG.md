# @hydrofoil/talos-core

## 0.3.1

### Patch Changes

- 52436dd: build(deps): bump mime-types from 2.1.35 to 3.0.1
- efadd0e: In update queries, `<urn:endpoint:NAME>` can be used to reference remote endpoints passed as `endpoints` option
- e349c5b: Updated `@zazuko/env-node` to 3.0.0
- 65390d4: Updated `@comunica/query-sparql` to 4.2.0
- e349c5b: Updated `n3` to 1.25.2

## 0.3.0

### Minor Changes

- 094d088: SPARQL Queries are adjusted to use the base URI calculated from the resource path. For example, in query `/tables/generate.ru`, the effective base URI would be `/tables/generate/`. This is to align this behavior with how static sources are parsed. In such case, rename the file to `index.ru` to remove the file name from resolves URIs.
- 38c59be: Ensures trailing slash in bare-domain resources
- 094d088: Base URI behavior changed. Now relative URIs will be resolved against the calculated base including a trailing slash. The exception is an empty `<>` reference which will be resolved against the base without a trailing slash.
  Use `<./>` to create a resource with a trailing slash.

  | File path         | URI reference | Resulting URI      |
  | ----------------- | ------------- | ------------------ |
  | `/api/people.ttl` | `<>`          | `/api/people`      |
  | `/api/people.ttl` | `<.>`         | `/api/people`      |
  | `/api/people.ttl` | `<./>`        | `/api/people/`     |
  | `/api/people.ttl` | `<john>`      | `/api/people/john` |
  | `/api/people.ttl` | `<#john>`     | `/api/people#john` |
  | `/api/people.ttl` | `<../people>` | `/api/people`      |
  | `/api/people.ttl` | `<./people>`  | `/api/people`      |
  | `/api/people.ttl` | `</projects>` | `/projects`        |

### Patch Changes

- b4bf27e: Prettier logs
- be8f9e4: Updated `@comunica/query-sparql` to v4.0.2
- 094d088: Trailing slash in base URI is truncated when resolving relative URI references

## 0.2.0

### Minor Changes

- dc36bad: Do not add `hydra:apiDocumentation` to resources

### Patch Changes

- c7a13b3: build(deps): bump @comunica/query-sparql from 3.2.1 to 3.2.3
- 3d7ab56: Option to not deploy talos meta graph
- fef6277: Downgrade anylogger to stable v1 branch

## 0.1.8

### Patch Changes

- bc9e34c: Resources generated from SPARQL query would not be included in the deployment

## 0.1.7

### Patch Changes

- 2ba36e4: Queries wer split incorrectly causing parse errors

## 0.1.6

### Patch Changes

- 9f5d521: Remove `rdf-dataset-ext` direct dependency
- 49e9f3a: Add SPARQL Update support for generating resources

## 0.1.5

### Patch Changes

- 231d905: build(deps): bump @fcostarodrigo/walk from 5.0.1 to 6.0.1

## 0.1.4

### Patch Changes

- 06a4156: Missing files in package

## 0.1.3

### Patch Changes

- 1b662a7: Make `apiUrl` optional for bootstrap. Will not set `hydra:apiDocumentation` link when not given
- 1b662a7: Remove `rdf-js`

## 0.1.2

### Patch Changes

- 33d941d: Moved `bootstrap.js` to core package
- 3d2bf6e: Update `get-stream`

## 0.1.1

### Patch Changes

- 0cbf9cf: Updated `@zazuko/env-node` to v2
- 59639c1: Update `@zazuko/env`

## 0.1.0

### Minor Changes

- 085a4a6: Extracted core functionality of loading resource from file system to a new library `@hydrofoil/talos-core`
