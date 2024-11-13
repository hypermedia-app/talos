---
"@hydrofoil/talos-core": minor
"@hydrofoil/talos": minor
---

Base URI behavior changed. Now relative URIs will be resolved against the calculated base including a trailing slash.
The exception is an empty `<>` reference which will be resolved against the base without a trailing slash.
Use `<./>` to create a resource with a trailing slash.

| File path         | URI reference | Resulting URI      |
|-------------------|---------------|--------------------|
| `/api/people.ttl` | `<>`          | `/api/people`      |
| `/api/people.ttl` | `<.>`         | `/api/people`      |
| `/api/people.ttl` | `<./>`        | `/api/people/`     |
| `/api/people.ttl` | `<john>`      | `/api/people/john` |
| `/api/people.ttl` | `<#john>`     | `/api/people#john` |
| `/api/people.ttl` | `<../people>` | `/api/people`      |
| `/api/people.ttl` | `<./people>`  | `/api/people`      |
| `/api/people.ttl` | `</projects>` | `/projects`        |
