'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getContent, TIER_BANDS, normaliseLocale, type Locale } from '@/products/wouterblok/data'

// ── Brand tokens (emerald / navy — distinct from the orange marketing_scan) ──
const ACCENT      = '#0E9F6E'   // emerald — fills, borders, bars
const ACCENT_DEEP = '#076B46'   // emerald text on white (WCAG-safe)
const NAVY        = '#0C2B3A'   // headers, footer, big numbers
const PRIMARY     = '#111827'
const MUTED       = '#6B7280'
const BORDER      = '#E5E7EB'
const BG_GRAY     = '#F5F8F6'
const FONT        = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const LANGS: { key: Locale; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'nl', label: 'NL' },
  { key: 'de', label: 'DE' },
]

const T = {
  en: {
    badge: 'Growth Flywheel Scan',
    h1a: 'Where does your', h1b: 'growth flywheel stall?',
    sub: 'Eight pillars, sixteen statements, about three minutes. A clear read on where your growth engine is strong, where it leaks, and what to do next.',
    cta: 'Start the scan →', sample: 'See a sample result',
    trust: '16 statements · ~3 minutes · No signup to start',
    pillarsTitle: '8 Performance Pillars', tiersTitle: '4 Maturity Tiers',
    poweredBy: 'By Wouter Blok',
  },
  nl: {
    badge: 'Growth Flywheel Scan',
    h1a: 'Waar hapert jouw', h1b: 'growth flywheel?',
    sub: 'Acht pijlers, zestien stellingen, ongeveer drie minuten. Een helder beeld van waar je groeimotor sterk is, waar hij lekt en wat de volgende stap is.',
    cta: 'Start de scan →', sample: 'Bekijk een voorbeeldresultaat',
    trust: '16 stellingen · ~3 minuten · Geen aanmelding nodig',
    pillarsTitle: '8 Performance Pillars', tiersTitle: '4 Volwassenheidsniveaus',
    poweredBy: 'Door Wouter Blok',
  },
  de: {
    badge: 'Growth Flywheel Scan',
    h1a: 'Wo stockt dein', h1b: 'Growth-Flywheel?',
    sub: 'Acht Säulen, sechzehn Aussagen, rund drei Minuten. Ein klares Bild davon, wo deine Wachstumsmaschine stark ist, wo sie leckt und was als Nächstes zu tun ist.',
    cta: 'Scan starten →', sample: 'Beispielergebnis ansehen',
    trust: '16 Aussagen · ~3 Minuten · Keine Anmeldung zum Start',
    pillarsTitle: '8 Performance-Pillars', tiersTitle: '4 Reifegrade',
    poweredBy: 'Von Wouter Blok',
  },
}

const TIER_RANGE = (k: string) => {
  const b = TIER_BANDS.find(x => x.key === k)!
  return `${b.min}–${b.max}%`
}

// Sample result for the demo link: a "spinning" senior profile, weakest = data.
function sampleHref(lang: Locale): string {
  const a: Record<string, number> = {
    BT1: 3, BT2: 2, AU1: 2, AU2: 2, IN1: 2, IN2: 1, CR1: 3, CR2: 2,
    CX1: 2, CX2: 2, DA1: 1, DA2: 1, EX1: 2, EX2: 2, AT1: 2, AT2: 2,
  }
  const payload = btoa(JSON.stringify({ a, r: 'exec', s: 'scaling' }))
  return `/wouterblok/results?d=${encodeURIComponent(payload)}&lang=${lang}`
}

function LandingInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const lang         = normaliseLocale(searchParams.get('lang'))
  const t            = T[lang]
  const { pillars, tiers } = getContent(lang)
  const assessHref   = `/wouterblok/assess?lang=${lang}`

  const switchLang = (key: Locale) => router.replace(`/wouterblok?lang=${key}`)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: PRIMARY, fontFamily: FONT }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: NAVY, fontWeight: 800, fontSize: 15, letterSpacing: '0.12em', textTransform: 'uppercase' }}>WOUTER BLOK</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {LANGS.map(({ key, label }) => (
                <button key={key} onClick={() => switchLang(key)} style={{
                  padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                  border: `1px solid ${lang === key ? ACCENT : BORDER}`, background: 'transparent',
                  color: lang === key ? ACCENT_DEEP : MUTED, cursor: 'pointer', transition: 'all 0.15s',
                }}>{label}</button>
              ))}
            </div>
            <Link href={assessHref} style={{
              background: 'transparent', color: ACCENT_DEEP, fontSize: 13, fontWeight: 700,
              padding: '7px 18px', borderRadius: 6, textDecoration: 'none', border: `2px solid ${ACCENT}`,
            }}>{t.cta}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: '#fff', padding: '80px 24px 88px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: ACCENT_DEEP, border: `1px solid ${ACCENT}44`,
            padding: '4px 14px', borderRadius: 4, marginBottom: 28,
          }}>{t.badge}</span>
          <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, color: NAVY, letterSpacing: '-0.02em' }}>
            {t.h1a}<br />{t.h1b}
          </h1>
          <p style={{ fontSize: 18, color: MUTED, lineHeight: 1.6, marginBottom: 36, maxWidth: 540 }}>{t.sub}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
            <Link href={assessHref} style={{
              background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 32px',
              borderRadius: 6, textDecoration: 'none', boxShadow: '0 4px 20px rgba(14,159,110,0.25)',
            }}>{t.cta}</Link>
            <Link href={sampleHref(lang)} style={{
              color: PRIMARY, fontWeight: 600, fontSize: 15, padding: '14px 24px', borderRadius: 6,
              textDecoration: 'none', border: `1px solid ${BORDER}`,
            }}>{t.sample}</Link>
          </div>
          <p style={{ fontSize: 13, color: MUTED }}>{t.trust}</p>
        </div>
      </section>

      {/* Pillars */}
      <section style={{ background: BG_GRAY, padding: '72px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>{t.pillarsTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 24 }}>
            {pillars.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 10, padding: '24px 22px', border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, marginBottom: 6 }}>{p.name}</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.65 }}>{p.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section style={{ background: '#fff', padding: '72px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: MUTED, marginBottom: 28 }}>{t.tiersTitle}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
            {tiers.map((tier, i) => (
              <div key={tier.key} style={{
                display: 'flex', alignItems: 'center', gap: 20, padding: '20px 28px',
                background: i % 2 === 0 ? BG_GRAY : '#fff',
                borderBottom: i < tiers.length - 1 ? `1px solid ${BORDER}` : 'none',
              }}>
                <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 72 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{TIER_RANGE(tier.key)}</span>
                </div>
                <div style={{ width: 1, height: 36, background: BORDER, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: ACCENT_DEEP, marginBottom: 3, textTransform: 'capitalize' }}>{tier.label}</p>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{tier.read}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: NAVY, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase' }}>WOUTER BLOK</span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{t.poweredBy}</p>
        </div>
      </footer>
    </div>
  )
}

export default function WouterblokLandingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <LandingInner />
    </Suspense>
  )
}
