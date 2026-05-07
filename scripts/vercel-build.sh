#!/bin/bash
set -e

echo "=== Unfold Build: Aplicando migrations pendentes ==="
# --force-accept-warning evita prompt interativo quando o schema foi alterado
# via dev push (Payload detecta divergência e pediria confirmação manual,
# o que trava o build do Vercel — non-interactive). É seguro porque o build
# só APLICA migrations existentes, nunca cria novas em produção.
npx payload migrate --force-accept-warning

echo "=== Unfold Build: Gerando importMap ==="
npx payload generate:importmap

echo "=== Unfold Build: Buildando Next.js ==="
npx next build
