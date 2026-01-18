#!/bin/sh

SCRIPT_DIR="$(cd "$(dirname "$0")" >/dev/null 2>&1 || exit ; pwd -P)"
cd "$SCRIPT_DIR"/../mou_data_node || exit 1
echo "Installing Node.js dependencies and building project mou_data_node..."
npm install
npm run build