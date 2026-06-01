import { defineConfig, configDefaults } from 'vitest/config'
import path from 'node:path'

/**
 * Config mínima do Vitest. Mantém o comportamento padrão (imports relativos,
 * environment node) e apenas remove do escopo da suíte os diretórios que não são
 * testes unitários do app: o framework AIOS (`meu-projeto/`), as referências e os
 * specs e2e do Playwright (que rodam por outro runner). Isso limpa o ruído de
 * coleta sem afetar os testes existentes do site.
 */
export default defineConfig({
  // Resolve o alias `@/…` → `src/…` (o projeto usa tsconfig paths; o Vitest não os
  // lê sozinho). Só afeta imports que começam com `@/` — não toca pacotes @scope.
  resolve: {
    alias: [{ find: /^@\//, replacement: path.resolve(__dirname, 'src') + '/' }],
  },
  test: {
    exclude: [
      ...configDefaults.exclude,
      'meu-projeto/**',
      'referencias/**',
      'tests/e2e/**',
    ],
  },
})
