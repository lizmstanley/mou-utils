#!/bin/sh

SCRIPT_DIR="$(cd "$(dirname "$0")" >/dev/null 2>&1 || exit ; pwd -P)"
cd "$SCRIPT_DIR"/../mou_data_node || exit 1
npm install
npm run build