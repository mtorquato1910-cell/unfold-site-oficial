#!/bin/bash
set -e

echo "=== Unfold Build: Aplicando migrations pendentes ==="
npx payload migrate

echo "=== Unfold Build: Buildando Next.js ==="
npx next build
