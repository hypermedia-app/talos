#!/usr/bin/env bash

# find JS entrypoint
talos=$(node -e "console.log(require.resolve('@hydrofoil/talos/bin/talos.js'))" 2> /dev/null)

if [ -z "$talos" ]
then
  # find global talos
  NODE_PATH=$(npm config get prefix)
  talos=$(node -e "console.log(require('path').join('$NODE_PATH', '/lib/node_modules/@hydrofoil/talos/bin/talos.js'))")
fi

if [ -z "$talos" ]
then
  echo "Could not find @hydrofoil/talos/bin/talos.js" >&2
  exit 1
fi

# if ts-node exists in path
if command -v ts-node &> /dev/null
then
  # use ts-node
  node --loader ts-node/esm/transpile-only --no-warnings "$talos" "$@"
else
  # use plain node
  node "$talos" "$@"
fi
