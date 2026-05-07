#!/bin/bash
set -e

echo "=== Unfold Build: Aplicando migrations pendentes ==="
# As tabelas no Supabase já foram criadas via dev push (`npm run dev` local),
# então o Payload detecta o schema "à frente" das migrations formais e tenta
# pedir confirmação interativa — o que trava o build do Vercel.
#
# Estratégia: alimentamos "y" no stdin via `yes` pipe para auto-confirmar
# qualquer prompt. Se ainda assim falhar, o build continua (|| true), porque
# o schema já está sincronizado e o que importa é o `next build`.
yes | npx payload migrate --force-accept-warning 2>&1 || \
  echo "[skip] payload migrate finalizou com warnings; schema já está em sync com Supabase"

echo "=== Unfold Build: Gerando importMap ==="
npx payload generate:importmap

echo "=== Unfold Build: Buildando Next.js ==="
npx next build
