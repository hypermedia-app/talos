---
"@hydrofoil/talos-core": minor
"@hydrofoil/talos": minor
---

SPARQL Queries are adjusted to use the base URI calculated from the resource path. For example, in query `/tables/generate.ru`,
the effective base URI would be `/tables/generate/`. This is to align this behavior with how static sources are parsed.
In such case, rename the file to `index.ru` to remove the file name from resolves URIs.
