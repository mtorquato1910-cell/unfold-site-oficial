#!/bin/bash
set -e

echo "=== Unfold Build: Gerando migration do schema ==="
# Gera migration com nome baseado no timestamp (ignora erro se schema não mudou)
MIGRATION_NAME="deploy-$(date +%Y%m%d%H%M%S)"
npx payload migrate:create --name "$MIGRATION_NAME" || echo "Nenhuma migration nova gerada."

echo "=== Unfold Build: Aplicando migrations pendentes ==="
npx payload migrate

echo "=== Unfold Build: Buildando Next.js ==="
npx next build
