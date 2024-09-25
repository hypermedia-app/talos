#!/usr/bin/env bash

# find JS entrypoint
talos=$(node -e "console.log(require.resolve('@hydrofoil/talos/bin/talos.js'))" 2> /dev/null)

# if ts-node exists in path
if command -v ts-node &> /dev/null
then
  # use ts-node
  node --loader ts-node/esm/transpile-only --no-warnings "$talos" "$@"
else
  # use plain node
  node "$talos" "$@"
fi
