import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Disable all ESLint rules that conflict with Prettier formatting.
  // This must come last so it overrides everything above.
  prettier,

  {
    rules: {
      // ── TypeScript ──────────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // ── Code quality ────────────────────────────────────────────
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // ── React ───────────────────────────────────────────────────
      'react/self-closing-comp': 'warn',
    },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/generated/**',
    'node_modules/**',
  ]),
])
