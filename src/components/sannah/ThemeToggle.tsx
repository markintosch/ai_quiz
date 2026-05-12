// FILE: src/components/sannah/ThemeToggle.tsx
// Knop in de Sannah-nav die light/dark omschakelt.

'use client'

import { useSannahTheme } from './ThemeProvider'

export default function SannahThemeToggle() {
  const { theme, toggle } = useSannahTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'}
      title={isDark ? 'Licht' : 'Donker'}
      style={{
        background: 'transparent',
        border: '1px solid var(--sannah-border)',
        color:  'var(--sannah-text-muted)',
        padding: '6px 10px',
        borderRadius: 999,
        cursor: 'pointer',
        fontSize: 13,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'color 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--sannah-text)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--sannah-text-muted)'
      }}
    >
      <span style={{ fontSize: 14 }}>{isDark ? '☀' : '☾'}</span>
      <span style={{ letterSpacing: '0.04em' }}>{isDark ? 'Licht' : 'Donker'}</span>
    </button>
  )
}
