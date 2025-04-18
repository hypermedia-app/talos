#!/usr/bin/env bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$SCRIPT_DIR" || exit

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
