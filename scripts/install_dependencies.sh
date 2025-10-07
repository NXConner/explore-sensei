#!/usr/bin/env bash
set -euo pipefail

# Idempotent dependency install
if command -v bun >/dev/null 2>&1; then
  bun install
else
  npm ci || npm install
fi

# Prepare husky
npx husky install || true
