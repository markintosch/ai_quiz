'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { type Lang } from '@/products/ai_benchmark/data'

// ── Mentor brand tokens ──────────────────────────────────────────────────────
const INK        = '#0F172A'
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

// Minimal copy for /start. Translation pass unifies into data.ts later.
const COPY = {
  navName:      'AI-benchmark',
  navTagline:   'voor marketing & sales',
  navBack:      '← Terug',

  badge:        'Komt eraan · launch in mei',
  h1a:          'We zijn de laatste hand',
  h1b:          'aan het leggen.',
  body:         'De benchmark gaat binnen enkele weken live. Laat je naam en e-mail achter en je krijgt persoonlijk een seintje zodra je hem kunt invullen — als eerste, vóór de bredere lancering.',

  fieldName:    'Je naam',
  fieldEmail:   'E-mailadres',
  fieldNameP:   'Voornaam',
  fieldEmailP:  'jij@bedrijf.nl',
  submit:       'Zet me op de lijst →',
  submitting:   'Bezig…',
  successH:     'Top — we hebben je toegevoegd.',
  successBody:  'Je krijgt persoonlijk bericht zodra de AI-benchmark openstaat. Tot snel.',
  successCta:   '← Terug naar de intro',
  errorMsg:     'Er ging iets mis. Probeer het later nog eens of mail mark@brandpwrdmedia.com.',

  altLabel:     'Liever direct contact?',
  altLine:      'Mail Mark op',
  altLink:      'mark@brandpwrdmedia.com',

  reportLine:   'Aggregaat-rapport: State of AI in Marketing & Sales 2026',
  footerLine:   'Gehost door Mark de Kock · markdekock.com',
}

// ── Inner ────────────────────────────────────────────────────────────────────
function StartInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const rawLang      = searchParams.get('lang') || 'nl'
  const lang         = (['nl', 'en', 'fr', 'de'].includes(rawLang) ? rawLang : 'nl') as Lang

  const switchLang = (key: Lang) => router.replace(`/ai_benchmark/start?lang=${key}`)
  const homeHref   = `/ai_benchmark?lang=${lang}`

  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState<'idle' | 'submitting' | 'ok' | 'error'>('idle')
  const [errMsg,  setErrMsg]  = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrMsg('')
    try {
      const res = await fetch('/api/ai_benchmark/waitlist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), email: email.trim(), lang }),
      })
      if (!res.ok) {
        setStatus('error'); setErrMsg(COPY.errorMsg); return
      }
      setStatus('ok')
    } catch {
      setStatus('error'); setErrMsg(COPY.errorMsg)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        background: '#fff', borderBottom: `1px solid ${BORDER}`,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href={homeHref} style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}>
            <span style={{ color: INK, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>
              {COPY.navName}
            </span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>
              {COPY.navTagline}
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
                    cursor: 'pointer', fontFamily: FONT,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <Link href={homeHref} style={{
              color: ACCENT, fontSize: 13, fontWeight: 700,
              padding: '8px 14px', borderRadius: 6, textDecoration: 'none',
              border: `1px solid ${BORDER}`,
            }}>
              {COPY.navBack}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '88px 24px 48px', background: LIGHT }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>

          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: WARM, background: WARM_LIGHT,
            padding: '5px 14px', borderRadius: 100, marginBottom: 24,
          }}>
            {COPY.badge}
          </span>

          <h1 style={{
            fontSize: 'clamp(30px, 4.8vw, 48px)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: 20, color: INK, letterSpacing: '-0.025em',
          }}>
            {COPY.h1a}<br />{COPY.h1b}
          </h1>

          <p style={{
            fontSize: 17, color: BODY, lineHeight: 1.65, marginBottom: 36,
          }}>
            {COPY.body}
          </p>

          {/* ── Form / success card ─────────────────────────────────── */}
          {status === 'ok' ? (
            <div style={{
              background: '#fff', border: `1px solid ${BORDER}`,
              borderRadius: 12, padding: '28px 28px',
            }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: INK, marginBottom: 8 }}>
                {COPY.successH}
              </p>
              <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6, marginBottom: 18 }}>
                {COPY.successBody}
              </p>
              <Link href={homeHref} style={{ color: ACCENT, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                {COPY.successCta}
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                background: '#fff', border: `1px solid ${BORDER}`,
                borderRadius: 12, padding: '24px 24px',
              }}
            >
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: INK, marginBottom: 6 }}>
                  {COPY.fieldName}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={COPY.fieldNameP}
                  style={{
                    width: '100%', padding: '11px 14px', fontSize: 15,
                    border: `1px solid ${BORDER}`, borderRadius: 8,
                    fontFamily: FONT, color: INK, background: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: 18 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: INK, marginBottom: 6 }}>
                  {COPY.fieldEmail}
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={COPY.fieldEmailP}
                  style={{
                    width: '100%', padding: '11px 14px', fontSize: 15,
                    border: `1px solid ${BORDER}`, borderRadius: 8,
                    fontFamily: FONT, color: INK, background: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  width: '100%', padding: '13px 16px', fontSize: 15, fontWeight: 700,
                  background: ACCENT, color: '#fff',
                  border: 'none', borderRadius: 8,
                  cursor: status === 'submitting' ? 'wait' : 'pointer',
                  opacity: status === 'submitting' ? 0.7 : 1,
                  fontFamily: FONT,
                  boxShadow: `0 4px 20px ${ACCENT}33`,
                }}
              >
                {status === 'submitting' ? COPY.submitting : COPY.submit}
              </button>

              {status === 'error' && (
                <p style={{ marginTop: 12, fontSize: 13, color: '#B91C1C' }}>
                  {errMsg || COPY.errorMsg}
                </p>
              )}
            </form>
          )}

          {/* ── Direct contact alt ──────────────────────────────────── */}
          <div style={{ marginTop: 28, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
            <strong style={{ color: INK }}>{COPY.altLabel}</strong>{' '}
            {COPY.altLine}{' '}
            <a href={`mailto:${COPY.altLink}?subject=AI-benchmark`} style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>
              {COPY.altLink}
            </a>
          </div>

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: INK, padding: '28px 24px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '-0.01em' }}>
            {COPY.footerLine}
          </span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {COPY.reportLine}
          </p>
        </div>
      </footer>
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function AiBenchmarkStartPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <StartInner />
    </Suspense>
  )
}
