import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Minimal unit-test setup. Node environment only: these are pure-logic tests (data
// transformations and guards), not component tests, so there is no jsdom and no React plugin to
// keep installed and patched.
//
// The alias mirrors tsconfig.json `"@/*": ["./*"]`. Without it any test that imports a module
// which itself uses `@/...` fails to resolve, which is the first thing that bit when this runner
// was added.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/supabase/**'],
  },
})
