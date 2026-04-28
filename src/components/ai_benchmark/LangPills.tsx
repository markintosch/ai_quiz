'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { type Lang } from '@/products/ai_benchmark/data'

const ACCENT = '#1D4ED8'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'
const FONT   = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const LABELS: { key: Lang; label: string }[] = [
  { key: 'nl', label: 'NL' },
  { key: 'en', label: 'EN' },
  { key: 'fr', label: 'FR' },
  { key: 'de', label: 'DE' },
]

export function LangPills({ lang, basePath }: { lang: Lang; basePath: string }) {
  const router = useRouter()
  const search = useSearchParams()

  const switchLang = (key: Lang) => {
    const params = new URLSearchParams(search.toString())
    params.set('lang', key)
    router.replace(`${basePath}?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {LABELS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => switchLang(key)}
          style={{
            padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
            border: `1px solid ${lang === key ? ACCENT : BORDER}`,
            background: 'transparent',
            color: lang === key ? ACCENT : MUTED,
            cursor: 'pointer', fontFamily: FONT,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
