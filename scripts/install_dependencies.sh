#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "$PROJECT_ROOT"

echo "[deps] Ensuring Corepack availability"
if command -v corepack >/dev/null 2>&1; then
  corepack enable 2>/dev/null || true
fi

install_node_dependencies() {
  if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
    echo "[deps] Installing via pnpm (lockfile detected)"
    pnpm install --frozen-lockfile
    return
  fi

  if [ -f bun.lockb ] && command -v bun >/dev/null 2>&1; then
    echo "[deps] Installing via bun (lockfile detected)"
    bun install
    return
  fi

  if [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then
    echo "[deps] Installing via yarn (lockfile detected)"
    yarn install --immutable
    return
  fi

  if command -v npm >/dev/null 2>&1; then
    echo "[deps] Installing via npm (legacy peer deps)"
    npm install --legacy-peer-deps
    return
  fi

  if command -v pnpm >/dev/null 2>&1; then
    echo "[deps] Installing via pnpm (no lockfile; falling back to flexible install)"
    pnpm install --no-frozen-lockfile
    return
  fi

  echo "[error] No supported Node.js package manager found" >&2
  exit 1
}

install_python_dependencies() {
  if command -v python >/dev/null 2>&1 && command -v pip >/dev/null 2>&1; then
    if [ -f "ml/pyproject.toml" ]; then
      echo "[deps] Installing ML toolkit (editable)"
      python -m pip install --upgrade pip >/dev/null 2>&1 || true
      python -m pip install -e ./ml
    fi
  fi
}

echo "[deps] Installing Node dependencies"
install_node_dependencies

echo "[deps] Installing Python tooling"
install_python_dependencies

echo "[deps] Installing Playwright browsers"
if command -v npx >/dev/null 2>&1; then
  npx playwright install --with-deps >/dev/null 2>&1 || true
fi

if [ -d .husky ]; then
  echo "[deps] Initializing Husky hooks"
  if command -v npm >/dev/null 2>&1; then
    npm run prepare >/dev/null 2>&1 || npx husky install || true
  else
    npx husky install || true
  fi
fi

echo "[deps] Dependency setup complete"
