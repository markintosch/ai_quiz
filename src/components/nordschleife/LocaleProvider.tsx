'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  type Locale,
  type StringKey,
  detectInitialLocale,
  isLocale,
  LOCALE_STORAGE_KEY,
  t as tRaw,
} from '@/products/nordschleife/i18n'

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: StringKey, vars?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function NordschleifeLocaleProvider({ children }: { children: React.ReactNode }) {
  // Start with 'en' on first render (SSR-safe). Detect the real one on mount.
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    // ?lang=xx in the URL wins over storage/navigator — that's how challenge
    // links carry the sender's chosen language to the recipient.
    try {
      const param = new URL(window.location.href).searchParams.get('lang')?.toLowerCase()
      if (param && isLocale(param)) {
        setLocaleState(param)
        try { window.localStorage.setItem(LOCALE_STORAGE_KEY, param) } catch { /* ignore */ }
        return
      }
    } catch { /* fall through */ }
    setLocaleState(detectInitialLocale())
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try { window.localStorage.setItem(LOCALE_STORAGE_KEY, next) } catch { /* ignore */ }
  }, [])

  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => tRaw(key, locale, vars),
    [locale],
  )

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useNordschleifeLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    // Pre-mount fallback — return inert English helpers so components don't crash
    return {
      locale: 'en',
      setLocale: () => undefined,
      t: (key, vars) => tRaw(key, 'en', vars),
    }
  }
  return ctx
}
