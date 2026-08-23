#!/usr/bin/env bash
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
temporary="$(mktemp -d)"
trap 'rm -rf "$temporary"' EXIT
git -C "$root" archive HEAD | tar -x -C "$temporary"
rm -f "$temporary/.openai/hosting.json"
cd "$temporary"
npm ci --ignore-scripts
npm run lint
npm run typecheck
npm run build
