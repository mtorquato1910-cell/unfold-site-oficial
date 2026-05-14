import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // ADR-1: src/lib/calculadora/* é módulo puro. Sem imports de payload/next/react/fetch.
  // Permite zod, ./*, ../*. Tests podem importar livremente.
  {
    files: ['src/lib/calculadora/**/*.{ts,tsx}'],
    ignores: ['src/lib/calculadora/**/__tests__/**', 'src/lib/calculadora/**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'payload', message: 'ADR-1: módulo puro — não importar payload aqui.' },
            { name: '@payload-config', message: 'ADR-1: módulo puro.' },
            { name: 'react', message: 'ADR-1: módulo puro — sem React.' },
            { name: 'next', message: 'ADR-1: módulo puro — sem Next.' },
          ],
          patterns: [
            { group: ['next/*'], message: 'ADR-1: módulo puro — sem next/*.' },
            { group: ['payload/*', '@payloadcms/*'], message: 'ADR-1: módulo puro — sem Payload.' },
          ],
        },
      ],
    },
  },
]

export default eslintConfig
