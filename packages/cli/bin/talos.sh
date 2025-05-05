#!/usr/bin/env bash

SCRIPT_DIR=$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)

# find JS entrypoint
talos="$SCRIPT_DIR/talos.js"

# if tsx or ts-node exists in path, use them
if command -v tsx > /dev/null 2>&1
then
  node --import tsx --no-warnings "$talos" "$@"
elif command -v ts-node > /dev/null 2>&1
then
  node --loader ts-node/esm/transpile-only --no-warnings "$talos" "$@"
else
  # use plain node
  node "$talos" "$@"
fi
