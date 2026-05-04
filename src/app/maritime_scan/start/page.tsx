// FILE: src/app/maritime_scan/start/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Maritime Compliance Readiness Scan — intro + question flow.
// Two phases: 'intro' (name, email, role pick + filters) → 'questions'.
// On submit posts to /api/maritime_scan/submit and redirects to /results/[id].

'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getContent, getQuestions, pickLang, type Lang, type Role, type Question,
} from '@/products/maritime_scan/data'

// ── Brand tokens ─────────────────────────────────────────────────────────────
const NAVY        = '#0A2540'
const SEA         = '#0EA5E9'
const SEA_LIGHT   = '#E0F2FE'
const AMBER       = '#F59E0B'
const AMBER_LIGHT = '#FEF3C7'
const INK         = '#0F172A'
const BODY        = '#475569'
const MUTED       = '#94A3B8'
const BORDER      = '#E2E8F0'
const LIGHT       = '#F8FAFC'
const FONT        = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

type Step = 'intro' | 'questions'
type Answers = Record<string, string | string[] | undefined>

// ── Chrome wrapper (HOISTED — keeping it outside the inner component
// prevents React from remounting inputs on every keystroke) ─────────────────
function Chrome({ children, lang }: { children: React.ReactNode; lang: Lang }) {
  const t = getContent(lang)
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT }}>
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/maritime_scan?lang=${lang}`} style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}>
            <span style={{ color: NAVY, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>{t.navName}</span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>{t.navTagline}</span>
          </Link>
        </div>
      </nav>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>{children}</div>
    </div>
  )
}

// ── Inner: form state + flow ─────────────────────────────────────────────────
function StartInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const lang         = pickLang(searchParams.get('lang'))
  const t            = getContent(lang)

  // Phase
  const [step, setStep] = useState<Step>('intro')

  // Intake form
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [role, setRole]         = useState<Role | ''>('')
  const [vessel, setVessel]     = useState('')
  const [size, setSize]         = useState('')
  const [region, setRegion]     = useState('')
  const [flag, setFlag]         = useState('')
  const [consent, setConsent]   = useState(false)

  // Questions phase
  const questions = useMemo<Question[]>(
    () => role ? getQuestions(role as Role, lang) : [],
    [role, lang]
  )
  const [qIdx, setQIdx]         = useState(0)
  const [answers, setAnswers]   = useState<Answers>({})

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  // ── Intro phase ────────────────────────────────────────────────────────
  const introValid =
    name.trim().length > 0 &&
    email.includes('@') &&
    !!role && !!vessel && !!size && !!region && !!flag

  function handleStartScan(e: React.FormEvent) {
    e.preventDefault()
    if (!introValid) return
    setStep('questions')
    setQIdx(0)
  }

  // ── Questions phase ────────────────────────────────────────────────────
  function pickSingle(qid: string, val: string) {
    setAnswers(a => ({ ...a, [qid]: val }))
  }
  function toggleMulti(qid: string, val: string) {
    setAnswers(a => {
      const cur = Array.isArray(a[qid]) ? (a[qid] as string[]) : []
      const next = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val]
      return { ...a, [qid]: next }
    })
  }
  const currentQ = questions[qIdx]
  const isLast   = qIdx === questions.length - 1
  const currentAnswered = currentQ && (
    currentQ.type === 'multiselect'
      ? Array.isArray(answers[currentQ.id]) && (answers[currentQ.id] as string[]).length > 0
      : !!answers[currentQ.id]
  )

  async function handleSubmit() {
    if (!role) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/maritime_scan/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name, email, lang,
          role, vesselType: vessel, fleetSize: size, region, flagCount: flag,
          marketingConsent: consent,
          answers,
        }),
      })
      const json = await res.json() as { id?: string; error?: string }
      if (!res.ok || !json.id) {
        setError(json.error || (lang === 'nl' ? 'Insturen mislukt. Probeer opnieuw.' : 'Submit failed. Please try again.'))
        setSubmitting(false)
        return
      }
      router.push(`/maritime_scan/results/${json.id}?lang=${lang}`)
    } catch {
      setError(lang === 'nl' ? 'Er ging iets mis. Probeer opnieuw.' : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  // ── Intro UI ───────────────────────────────────────────────────────────
  if (step === 'intro') {
    const inputStyle: React.CSSProperties = {
      width: '100%', padding: '12px 14px', fontSize: 15,
      border: `1.5px solid ${BORDER}`, borderRadius: 8,
      fontFamily: FONT, color: INK, background: '#fff',
      boxSizing: 'border-box',
    }
    const labelStyle: React.CSSProperties = {
      display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6, letterSpacing: '0.02em',
    }
    return (
      <Chrome lang={lang}>
        <span style={{
          display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: AMBER, background: AMBER_LIGHT, padding: '5px 14px', borderRadius: 100, marginBottom: 18,
        }}>
          {t.startBadge}
        </span>
        <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.15, color: NAVY, marginBottom: 8, letterSpacing: '-0.02em' }}>
          {t.startH1}
        </h1>
        <p style={{ fontSize: 15, color: BODY, lineHeight: 1.65, marginBottom: 32 }}>
          {t.startBody}
        </p>

        <form onSubmit={handleStartScan} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name */}
          <label>
            <span style={labelStyle}>{t.startNameLabel}</span>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required maxLength={100} style={inputStyle} />
          </label>

          {/* Email */}
          <label>
            <span style={labelStyle}>{t.startEmailLabel}</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={200} style={inputStyle} placeholder="naam@bedrijf.com" />
            <span style={{ fontSize: 12, color: MUTED, marginTop: 4, display: 'block' }}>{t.startEmailHint}</span>
          </label>

          {/* Role — the cohort pick */}
          <div>
            <span style={labelStyle}>{t.startRoleLabel}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {t.ROLES.map(r => {
                const active = role === r.id
                return (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)} style={{
                    textAlign: 'left', padding: '14px 16px', borderRadius: 10,
                    border: `1.5px solid ${active ? SEA : BORDER}`,
                    background: active ? SEA_LIGHT : '#fff',
                    color: INK, cursor: 'pointer', fontFamily: FONT,
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: active ? NAVY : INK }}>{r.name}</span>
                    <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.45 }}>{r.jobTitles}</span>
                    <span style={{ fontSize: 12.5, color: BODY, lineHeight: 1.5 }}>{r.hint}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Vessel type */}
          <label>
            <span style={labelStyle}>{t.startVesselTypeLabel}</span>
            <select value={vessel} onChange={e => setVessel(e.target.value)} required style={inputStyle}>
              <option value="">—</option>
              {t.VESSEL_TYPES.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>

          {/* Fleet size */}
          <label>
            <span style={labelStyle}>{t.startFleetSizeLabel}</span>
            <select value={size} onChange={e => setSize(e.target.value)} required style={inputStyle}>
              <option value="">—</option>
              {t.FLEET_SIZES.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>

          {/* Region */}
          <label>
            <span style={labelStyle}>{t.startRegionLabel}</span>
            <select value={region} onChange={e => setRegion(e.target.value)} required style={inputStyle}>
              <option value="">—</option>
              {t.REGIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>

          {/* Flag count */}
          <label>
            <span style={labelStyle}>{t.startFlagCountLabel}</span>
            <select value={flag} onChange={e => setFlag(e.target.value)} required style={inputStyle}>
              <option value="">—</option>
              {t.FLAG_COUNTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>

          {/* Consent */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: BODY, lineHeight: 1.5 }}>
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
            <span>{t.startConsentLabel}</span>
          </label>

          {/* Submit */}
          <button type="submit" disabled={!introValid} style={{
            marginTop: 8,
            background: introValid ? SEA : '#CBD5E1', color: '#fff',
            fontWeight: 800, fontSize: 16, padding: '14px 24px',
            border: 'none', borderRadius: 8, cursor: introValid ? 'pointer' : 'not-allowed',
            boxShadow: introValid ? `0 8px 24px ${SEA}40` : 'none',
            fontFamily: FONT,
          }}>
            {t.startSubmitCta}
          </button>
        </form>
      </Chrome>
    )
  }

  // ── Questions UI ───────────────────────────────────────────────────────
  if (!currentQ) {
    return <Chrome lang={lang}><p>—</p></Chrome>
  }
  const progressPct = Math.round(((qIdx + 1) / questions.length) * 100)

  return (
    <Chrome lang={lang}>
      {/* Progress */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED }}>
            {t.startProgress.replace('{current}', String(qIdx + 1)).replace('{total}', String(questions.length))}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: SEA }}>{progressPct}%</span>
        </div>
        <div style={{ height: 6, background: BORDER, borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ height: 6, width: `${progressPct}%`, background: SEA, borderRadius: 100, transition: 'width 0.3s ease-out' }} />
        </div>
      </div>

      {/* Question card */}
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '28px 28px' }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: SEA, marginBottom: 8 }}>
          {currentQ.id.toUpperCase()}
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, lineHeight: 1.35, marginBottom: 8, letterSpacing: '-0.01em' }}>
          {currentQ.text}
        </h2>
        {currentQ.hint && (
          <p style={{ fontSize: 13, color: MUTED, fontStyle: 'italic', marginBottom: 18 }}>{currentQ.hint}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {currentQ.options.map(opt => {
            const isMulti  = currentQ.type === 'multiselect'
            const selected = isMulti
              ? Array.isArray(answers[currentQ.id]) && (answers[currentQ.id] as string[]).includes(opt.id)
              : answers[currentQ.id] === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => isMulti ? toggleMulti(currentQ.id, opt.id) : pickSingle(currentQ.id, opt.id)}
                style={{
                  textAlign: 'left', padding: '12px 16px', borderRadius: 8,
                  border: `1.5px solid ${selected ? SEA : BORDER}`,
                  background: selected ? SEA_LIGHT : '#fff',
                  color: INK, cursor: 'pointer', fontFamily: FONT, fontSize: 14,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: isMulti ? 4 : '50%',
                  border: `2px solid ${selected ? SEA : BORDER}`,
                  background: selected ? SEA : '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {selected && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>}
                </span>
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {error && <p style={{ marginTop: 16, fontSize: 13, color: '#B91C1C' }}>{error}</p>}

      {/* Nav buttons */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <button
          type="button"
          disabled={qIdx === 0 || submitting}
          onClick={() => setQIdx(i => Math.max(0, i - 1))}
          style={{
            padding: '12px 20px', borderRadius: 8, border: `1.5px solid ${BORDER}`,
            background: '#fff', color: BODY, fontWeight: 600, fontSize: 14,
            cursor: qIdx === 0 ? 'not-allowed' : 'pointer', opacity: qIdx === 0 ? 0.5 : 1, fontFamily: FONT,
          }}>
          ← {lang === 'nl' ? 'Vorige' : 'Previous'}
        </button>
        {!isLast ? (
          <button
            type="button"
            disabled={!currentAnswered}
            onClick={() => setQIdx(i => i + 1)}
            style={{
              padding: '12px 24px', borderRadius: 8, border: 'none',
              background: currentAnswered ? SEA : '#CBD5E1', color: '#fff',
              fontWeight: 800, fontSize: 14,
              cursor: currentAnswered ? 'pointer' : 'not-allowed',
              boxShadow: currentAnswered ? `0 6px 18px ${SEA}40` : 'none',
              fontFamily: FONT,
            }}>
            {lang === 'nl' ? 'Volgende' : 'Next'} →
          </button>
        ) : (
          <button
            type="button"
            disabled={!currentAnswered || submitting}
            onClick={handleSubmit}
            style={{
              padding: '12px 24px', borderRadius: 8, border: 'none',
              background: currentAnswered && !submitting ? AMBER : '#CBD5E1', color: '#fff',
              fontWeight: 800, fontSize: 14,
              cursor: currentAnswered && !submitting ? 'pointer' : 'not-allowed',
              boxShadow: currentAnswered && !submitting ? `0 6px 18px ${AMBER}55` : 'none',
              fontFamily: FONT,
            }}>
            {submitting ? (lang === 'nl' ? 'Bezig…' : 'Submitting…') : (lang === 'nl' ? 'Bekijk mijn score →' : 'See my score →')}
          </button>
        )}
      </div>
    </Chrome>
  )
}

export default function MaritimeScanStartPage() {
  return (
    <Suspense fallback={<div />}>
      <StartInner />
    </Suspense>
  )
}
