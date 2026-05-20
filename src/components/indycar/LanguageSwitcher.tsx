'use client'

import { useIndycarLocale } from './LocaleProvider'
import { LOCALES, LOCALE_LABEL, LOCALE_FULL_NAME, type Locale } from '@/products/indycar/i18n'

const GREEN  = '#C8102E'
const BORDER = '#1F2942'
const MUTED  = '#7A8E7E'
const WHITE  = '#FFFFFF'

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useIndycarLocale()

  return (
    <div
      role="group"
      aria-label="Language switcher"
      style={{
        display: 'inline-flex', gap: 2, padding: 2,
        background: '#0D1428', border: `1px solid ${BORDER}`, borderRadius: 8,
      }}
    >
      {LOCALES.map((l) => {
        const active = l === locale
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l as Locale)}
            aria-pressed={active}
            title={LOCALE_FULL_NAME[l as Locale]}
            style={{
              background: active ? GREEN : 'transparent',
              color: active ? WHITE : MUTED,
              border: 'none',
              fontSize: compact ? 10 : 11,
              fontWeight: 800,
              letterSpacing: '0.06em',
              padding: compact ? '4px 8px' : '5px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              minWidth: compact ? 28 : 32,
            }}
          >
            {LOCALE_LABEL[l as Locale]}
          </button>
        )
      })}
    </div>
  )
}
