// FILE: src/components/sannah/ThemeProvider.tsx
// Sannah-portfolio theme: light | dark, persisted in localStorage.
//
// Het inline-script in <head> (zie SannahThemeBootstrap hieronder) zet
// data-sannah meteen voor React rendert — geen flash bij page-load.

'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type SannahTheme = 'light' | 'dark'

interface Ctx {
  theme:  SannahTheme
  toggle: () => void
  set:    (t: SannahTheme) => void
}

const SannahThemeContext = createContext<Ctx | null>(null)

const STORAGE_KEY = 'sannah-theme'

export function SannahThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<SannahTheme>('light')

  // Hydrate from <html data-sannah=...> (set by inline script in <head>)
  useEffect(() => {
    const initial = (document.documentElement.getAttribute('data-sannah') as SannahTheme | null) ?? 'light'
    setTheme(initial)
  }, [])

  const set = useCallback((t: SannahTheme) => {
    setTheme(t)
    document.documentElement.setAttribute('data-sannah', t)
    try { localStorage.setItem(STORAGE_KEY, t) } catch { /* private mode */ }
  }, [])

  const toggle = useCallback(() => {
    set(theme === 'light' ? 'dark' : 'light')
  }, [theme, set])

  return (
    <SannahThemeContext.Provider value={{ theme, toggle, set }}>
      {children}
    </SannahThemeContext.Provider>
  )
}

export function useSannahTheme(): Ctx {
  const c = useContext(SannahThemeContext)
  if (!c) {
    // Fallback voor edge cases buiten provider — geen crash, geen interactie.
    return { theme: 'light', toggle: () => {}, set: () => {} }
  }
  return c
}

/**
 * Inline script dat data-sannah zet vóór React hydrateert.
 * Embed dit in <head> van de Sannah layout met Next/Script strategy='beforeInteractive'.
 */
export const SANNAH_THEME_BOOT = `
(function() {
  try {
    var saved = localStorage.getItem('${STORAGE_KEY}');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-sannah', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-sannah', 'light');
  }
})();
`
