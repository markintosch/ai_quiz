'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getContent, type Lang } from '@/products/ai_benchmark/data'

// ── Mentor brand tokens ──────────────────────────────────────────────────────
const INK        = '#0F172A'
const NAVY       = '#1E3A5F'
const ACCENT     = '#1D4ED8'
const WARM       = '#D97706'
const WARM_LIGHT = '#FEF3C7'
const BODY       = '#374151'
const MUTED      = '#94A3B8'
const BORDER     = '#E2E8F0'
const LIGHT      = '#F8FAFC'
const FONT       = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const LANG_LABELS: { key: Lang; label: string }[] = [
  { key: 'nl', label: 'NL' },
  { key: 'en', label: 'EN' },
  { key: 'fr', label: 'FR' },
  { key: 'de', label: 'DE' },
]

// ── Inner ────────────────────────────────────────────────────────────────────
function AiBenchmarkLandingInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const rawLang      = searchParams.get('lang') || 'nl'
  const lang         = (['nl', 'en', 'fr', 'de'].includes(rawLang) ? rawLang : 'nl') as Lang

  const switchLang = (key: Lang) => router.replace(`/ai_benchmark?lang=${key}`)

  const t          = getContent(lang)
  const startHref = `/ai_benchmark/start?lang=${lang}`

  // Stand-in N until live count wired in
  const respondentN = 247
  const proofText   = t.proofN.replace('{n}', respondentN.toLocaleString('nl-NL'))

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        background: '#fff', borderBottom: `1px solid ${BORDER}`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              color: INK, fontWeight: 800, fontSize: 16,
              letterSpacing: '-0.01em',
            }}>
              {t.navName}
            </span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>
              {t.navTagline}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Lang pills */}
            <div style={{ display: 'flex', gap: 4 }}>
              {LANG_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => switchLang(key)}
                  style={{
                    padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                    border: `1px solid ${lang === key ? ACCENT : BORDER}`,
                    background: 'transparent',
                    color: lang === key ? ACCENT : MUTED,
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: FONT,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <Link
              href={startHref}
              style={{
                background: 'transparent', color: ACCENT, fontSize: 13, fontWeight: 700,
                padding: '8px 18px', borderRadius: 6, textDecoration: 'none',
                border: `2px solid ${ACCENT}`,
              }}
            >
              {t.navCta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '88px 24px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: WARM, background: WARM_LIGHT,
            padding: '5px 14px', borderRadius: 100, marginBottom: 28,
          }}>
            {t.heroBadge}
          </span>

          <h1 style={{
            fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: 24, color: INK, letterSpacing: '-0.025em',
          }}>
            {t.heroH1a}<br />{t.heroH1b}
          </h1>

          <p style={{
            fontSize: 17, color: BODY, lineHeight: 1.65, marginBottom: 18, maxWidth: 620,
          }}>
            {t.heroIntro}
          </p>
          <p style={{
            fontSize: 17, color: INK, lineHeight: 1.6, marginBottom: 36, maxWidth: 620, fontWeight: 600,
          }}>
            {t.heroSub}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 22 }}>
            <Link
              href={startHref}
              style={{
                background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 16,
                padding: '14px 32px', borderRadius: 6, textDecoration: 'none',
                boxShadow: `0 4px 20px ${ACCENT}33`,
              }}
            >
              {t.heroCta1}
            </Link>
            <a
              href="#how"
              style={{
                color: INK, fontWeight: 600, fontSize: 15,
                padding: '14px 24px', borderRadius: 6, textDecoration: 'none',
                border: `1px solid ${BORDER}`,
              }}
            >
              {t.heroCta2}
            </a>
          </div>

          <p style={{ fontSize: 13, color: MUTED }}>{t.trustLine}</p>
        </div>
      </section>

      {/* ── Proof / community ───────────────────────────────────────────── */}
      <section style={{
        background: INK, color: '#fff', padding: '40px 24px',
        borderTop: `1px solid ${BORDER}`,
      }}>
        <div style={{
          maxWidth: 920, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.01em' }}>
              {proofText}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', maxWidth: 560, lineHeight: 1.55 }}>
              {t.proofSubtitle}
            </p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: WARM,
            border: `1px solid ${WARM}55`, padding: '6px 12px', borderRadius: 4,
          }}>
            Live · groeit elke week
          </span>
        </div>
      </section>

      {/* ── Dimensions ──────────────────────────────────────────────────── */}
      <section id="how" style={{ background: LIGHT, padding: '76px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: ACCENT, marginBottom: 8,
          }}>
            {t.dimensionsLabel}
          </h2>
          <p style={{ fontSize: 26, fontWeight: 800, color: INK, marginBottom: 28, letterSpacing: '-0.01em' }}>
            {t.dimensionsTitle}
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14,
          }}>
            {t.DIMENSIONS.map(d => (
              <div key={d.id} style={{
                background: '#fff', borderRadius: 10, padding: '22px 22px',
                border: `1px solid ${BORDER}`,
              }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{d.icon}</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 4 }}>{d.name}</p>
                <p style={{ fontSize: 13, color: BODY, lineHeight: 1.55 }}>{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Archetypes ──────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '76px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: WARM, marginBottom: 8,
          }}>
            {t.archetypesLabel}
          </h2>
          <p style={{ fontSize: 26, fontWeight: 800, color: INK, marginBottom: 28, letterSpacing: '-0.01em' }}>
            {t.archetypesTitle}
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14,
          }}>
            {t.ARCHETYPES.map(a => (
              <div key={a.id} style={{
                background: LIGHT, borderRadius: 10, padding: '22px 22px',
                border: `1px solid ${BORDER}`,
                transition: 'background 0.15s, border-color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = WARM_LIGHT; e.currentTarget.style.borderColor = `${WARM}66` }}
                onMouseLeave={e => { e.currentTarget.style.background = LIGHT; e.currentTarget.style.borderColor = BORDER }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{a.emoji}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: INK }}>{a.name}</span>
                </div>
                <p style={{ fontSize: 13, color: BODY, lineHeight: 1.55 }}>{a.identity}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why share / context ─────────────────────────────────────────── */}
      <section style={{ background: LIGHT, padding: '76px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: ACCENT, marginBottom: 8,
          }}>
            {t.shareLabel}
          </h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: INK, marginBottom: 18, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
            {t.shareTitle}
          </p>
          <p style={{ fontSize: 17, color: BODY, lineHeight: 1.65 }}>
            {t.shareBody}
          </p>

          <div style={{ marginTop: 36 }}>
            <Link
              href={startHref}
              style={{
                background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 16,
                padding: '14px 32px', borderRadius: 6, textDecoration: 'none',
                boxShadow: `0 4px 20px ${ACCENT}33`,
              }}
            >
              {t.heroCta1}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: INK, padding: '36px 24px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.01em' }}>
            {t.footerLine}
          </span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {t.reportLine}
          </p>
        </div>
      </footer>
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function AiBenchmarkLandingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <AiBenchmarkLandingInner />
    </Suspense>
  )
}
