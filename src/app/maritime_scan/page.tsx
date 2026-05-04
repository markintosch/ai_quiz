// FILE: src/app/maritime_scan/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Maritime Compliance Readiness Scan — public landing page (server component).
// NL primary; ?lang=en switches the entire page chrome.

import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { getContent, pickLang, type Lang } from '@/products/maritime_scan/data'

export const dynamic = 'force-dynamic'

// ── Brand tokens (maritime: deep navy + sea blue + amber for regulatory urgency)
const NAVY        = '#0A2540'
const NAVY_DEEP   = '#061A30'
const STEEL       = '#1E3A5F'
const SEA         = '#0EA5E9'   // primary CTA blue
const SEA_LIGHT   = '#E0F2FE'
const AMBER       = '#F59E0B'   // regulatory accent
const AMBER_LIGHT = '#FEF3C7'
const INK         = '#0F172A'
const BODY        = '#475569'
const MUTED       = '#94A3B8'
const BORDER      = '#E2E8F0'
const LIGHT       = '#F8FAFC'
const FONT        = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

function getBaseUrl(): string {
  try {
    const h = headers()
    const host = h.get('host')
    const proto = h.get('x-forwarded-proto') || 'https'
    if (host) return `${proto}://${host}`
  } catch { /* not available in some build contexts */ }
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://aiquiz.brandpwrdmedia.nl'
}

const META: Record<Lang, { title: string; desc: string; ogTitle: string; locale: string }> = {
  nl: {
    title:   'Maritime Compliance Scan — hoe audit-ready is jouw crew-documentatie? | Mark de Kock',
    desc:    'Onafhankelijke scan voor shipping companies. Diagnose van PSC-readiness, multi-flag interoperabiliteit, data-protectie en cycle-time op crew-administratie. Zes minuten, anoniem.',
    ogTitle: 'Maritime Compliance Scan voor shipping companies',
    locale:  'nl_NL',
  },
  en: {
    title:   'Maritime Compliance Scan — how audit-ready is your crew documentation? | Mark de Kock',
    desc:    'Independent scan for shipping companies. Diagnoses PSC readiness, multi-flag interoperability, data protection and cycle-time on crew administration. Six minutes, anonymous.',
    ogTitle: 'Maritime Compliance Scan for shipping companies',
    locale:  'en_GB',
  },
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const lang = pickLang(searchParams.lang)
  const m    = META[lang]
  const BASE = getBaseUrl()
  return {
    title:       m.title,
    description: m.desc,
    metadataBase: new URL(BASE),
    robots: { index: true, follow: true },
    alternates: {
      canonical: lang === 'nl' ? `${BASE}/maritime_scan` : `${BASE}/maritime_scan?lang=${lang}`,
      languages: {
        'nl':         `${BASE}/maritime_scan`,
        'en':         `${BASE}/maritime_scan?lang=en`,
        'x-default':  `${BASE}/maritime_scan`,
      },
    },
    openGraph: {
      title:       m.ogTitle,
      description: m.desc,
      url:         `${BASE}/maritime_scan${lang === 'nl' ? '' : `?lang=${lang}`}`,
      siteName:    'Maritime Compliance Scan',
      locale:      m.locale,
      type:        'website',
    },
    twitter: {
      card:        'summary_large_image',
      title:       m.ogTitle,
      description: m.desc,
    },
  }
}

export default async function MaritimeScanLanding({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const lang = pickLang(searchParams.lang)
  const t    = getContent(lang)

  const startHref = `/maritime_scan/start?lang=${lang}`

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/maritime_scan?lang=${lang}`} style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}>
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>{t.navName}</span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>{t.navTagline}</span>
          </Link>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {(['nl', 'en'] as Lang[]).map(l => (
              <Link key={l} href={`/maritime_scan?lang=${l}`} style={{
                padding: '4px 10px', fontSize: 12, fontWeight: 700,
                color: l === lang ? NAVY : MUTED, textDecoration: 'none',
                background: l === lang ? `${SEA}15` : 'transparent', borderRadius: 100,
              }}>
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: '#fff', padding: '72px 24px 48px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: AMBER, background: AMBER_LIGHT,
            padding: '5px 14px', borderRadius: 100, marginBottom: 22,
          }}>
            {t.heroBadge}
          </span>

          <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, color: NAVY, letterSpacing: '-0.025em' }}>
            {t.heroH1a}<br />{t.heroH1b}
          </h1>

          <p style={{ fontSize: 17, color: BODY, lineHeight: 1.65, marginBottom: 18, maxWidth: 620 }}>
            {t.heroIntro}
          </p>
          <p style={{ fontSize: 17, color: NAVY, lineHeight: 1.6, marginBottom: 32, maxWidth: 620, fontWeight: 600 }}>
            {t.heroSub}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
            <Link
              href={startHref}
              style={{
                background: SEA, color: '#fff', fontWeight: 700, fontSize: 16,
                padding: '14px 32px', borderRadius: 8, textDecoration: 'none',
                boxShadow: `0 8px 24px ${SEA}40`,
              }}
            >
              {t.heroCta1}
            </Link>
          </div>

          <p style={{ fontSize: 13, color: MUTED }}>{t.trustLine}</p>
        </div>
      </section>

      {/* ── Why this scan ── */}
      <section style={{ background: NAVY_DEEP, padding: '64px 24px', color: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: SEA_LIGHT, marginBottom: 14 }}>
            {t.whyLabel}
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 18, letterSpacing: '-0.015em' }}>
            {t.whyHeadline}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.7 }}>
            {t.whyBody}
          </p>
        </div>
      </section>

      {/* ── Roles section (4 cohorts) ── */}
      <section style={{ background: '#fff', padding: '72px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: AMBER, marginBottom: 8 }}>
            {t.rolesLabel}
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900, color: NAVY, lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.015em' }}>
            {t.rolesHeadline}
          </h2>
          <p style={{ fontSize: 15, color: BODY, lineHeight: 1.65, maxWidth: 640, marginBottom: 32 }}>
            {t.rolesSub}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {t.ROLES.map(r => (
              <div key={r.id} style={{
                background: LIGHT, border: `1px solid ${BORDER}`, borderRadius: 12,
                padding: '20px 22px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: NAVY, letterSpacing: '-0.01em' }}>
                  {r.name}
                </p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55 }}>
                  {r.jobTitles}
                </p>
                <p style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>
                  {r.hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dimensions (the 6 we score on) ── */}
      <section style={{ background: LIGHT, padding: '64px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: SEA, marginBottom: 8 }}>
            {lang === 'nl' ? 'Wat we meten' : 'What we measure'}
          </p>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, color: NAVY, lineHeight: 1.2, marginBottom: 24, letterSpacing: '-0.015em' }}>
            {lang === 'nl' ? 'Zes dimensies. Eén compliance posture.' : 'Six dimensions. One compliance posture.'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {t.DIMENSIONS.map(d => (
              <div key={d.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 20px' }}>
                <p style={{ fontSize: 22, marginBottom: 6 }}>{d.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 4 }}>{d.name}</p>
                <p style={{ fontSize: 12.5, color: BODY, lineHeight: 1.55 }}>{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, color: NAVY, lineHeight: 1.25, marginBottom: 14, letterSpacing: '-0.015em' }}>
            {lang === 'nl' ? 'Zes minuten. Geen account. Eerlijk antwoord.' : 'Six minutes. No account. Honest answer.'}
          </h2>
          <p style={{ fontSize: 15, color: BODY, lineHeight: 1.65, marginBottom: 28 }}>
            {lang === 'nl'
              ? 'Direct na inzending krijg je je compliance score, posture en de drie dimensies waar je grootste exposure zit.'
              : 'Right after submitting you get your compliance score, posture and the three dimensions where your biggest exposure sits.'}
          </p>
          <Link
            href={startHref}
            style={{
              display: 'inline-block',
              background: SEA, color: '#fff', fontWeight: 700, fontSize: 16,
              padding: '14px 36px', borderRadius: 8, textDecoration: 'none',
              boxShadow: `0 8px 24px ${SEA}40`,
            }}
          >
            {t.heroCta1}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: NAVY, padding: '32px 24px', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
            {t.footerLine}
          </span>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <a href="https://markdekock.com/privacy" target="_blank" rel="noopener noreferrer"
               style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>
              {t.privacyLink}
            </a>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
              {t.reportLine}
            </p>
          </div>
        </div>
      </footer>

      {/* unused token suppression — keeps STEEL available for next iterations */}
      <span style={{ display: 'none' }}>{STEEL}</span>
    </div>
  )
}
