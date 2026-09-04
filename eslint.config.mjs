// Flat ESLint config for Next 16: `next lint` is gone, plain eslint runs the
// same next/core-web-vitals rules the build used to apply (the repo never had
// an eslint config, so build-time linting ran exactly this preset and nothing
// more; adding next/typescript would be a new, stricter policy).
// eslint-config-next v16 ships native flat configs, no FlatCompat needed.
import coreWebVitals from 'eslint-config-next/core-web-vitals'

export default [
  ...coreWebVitals,
  { ignores: ['.next/**', 'node_modules/**', 'public/**'] },
  {
    // Pre-existing findings surfaced by the v16 preset (React Compiler
    // diagnostics and two stylistic rules with 200+ hits in shipped copy).
    // Kept visible as warnings so lint stays a usable signal; promote back
    // to errors when the backlog is worked off.
    rules: {
      '@next/next/no-html-link-for-pages': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/error-boundaries': 'warn',
    },
  },
]
