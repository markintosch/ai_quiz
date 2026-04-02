'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { computeResults, TIER_META } from '@/products/sysdig_scan/data'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const DARK   = '#0B0F1A'
const NAVY   = '#111827'
const CARD   = '#161D2E'
const BORDER = '#1E2D40'
const TEAL   = '#00C58E'
const WHITE  = '#FFFFFF'
const MUTED  = '#8B9EB0'
const BODY   = '#C8D6E5'

const CALENDLY_SYSDIG = process.env.NEXT_PUBLIC_SYSDIG_CALENDLY_URL ?? 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'
const REPORT_URL      = process.env.NEXT_PUBLIC_SYSDIG_REPORT_URL   ?? 'https://sysdig.com/resources/cloud-defense-report-2025/'

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, colour }: { score: number; colour: string }) {
  const r = 72, circ = 2 * Math.PI * r, dash = (score / 100) * circ
  return (
    <svg width={180} height={180} viewBox="0 0 180 180" style={{ display: 'block' }}>
      <circle cx={90} cy={90} r={r} fill="none" stroke={BORDER} strokeWidth={12} />
      <circle cx={90} cy={90} r={r} fill="none" stroke={colour} strokeWidth={12}
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 90 90)" />
      <text x={90} y={84} textAnchor="middle" fontSize={40} fontWeight={900} fill={WHITE} fontFamily="Inter, system-ui, sans-serif">{score}</text>
      <text x={90} y={106} textAnchor="middle" fontSize={13} fill={MUTED} fontFamily="Inter, system-ui, sans-serif">/100</text>
    </svg>
  )
}

// ── Newsletter button (client-side state) ─────────────────────────────────────
function NewsletterButton({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  async function subscribe() {
    setState('loading')
    try {
      await fetch('/api/sysdig_scan/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch { /* silent */ }
    setState('done')
  }

  if (state === 'done') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '12px 24px', borderRadius: 8, background: `${TEAL}15`, border: `1px solid ${TEAL}30` }}>
        <span style={{ color: TEAL, fontSize: 16 }}>✓</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: TEAL }}>Subscribed</span>
      </div>
    )
  }

  return (
    <button
      onClick={subscribe}
      disabled={state === 'loading'}
      style={{
        width: '100%', background: NAVY, border: `1px solid ${BORDER}`,
        color: WHITE, fontSize: 14, fontWeight: 700,
        padding: '12px 24px', borderRadius: 8, cursor: 'pointer',
        opacity: state === 'loading' ? 0.6 : 1,
      }}
    >
      {state === 'loading' ? 'Subscribing…' : 'Subscribe →'}
    </button>
  )
}

// ── Dimension bar ─────────────────────────────────────────────────────────────
function DimBar({ label, score, benchmark, passes }: { label: string; score: number; benchmark: string; passes: boolean }) {
  const colour = passes ? TEAL : '#EF4444'
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: WHITE }}>{label}</span>
          <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>555: {benchmark}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: colour }}>{score}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: passes ? TEAL : '#EF4444',
            background: passes ? `${TEAL}15` : '#EF444415',
            border: `1px solid ${passes ? `${TEAL}40` : '#EF444440'}`,
            borderRadius: 100, padding: '2px 8px' }}>
            {passes ? '✓ Passes' : '✗ Gap'}
          </span>
        </div>
      </div>
      <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: colour, borderRadius: 3 }} />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
function ResultsInner() {
  const params  = useSearchParams()
  const encoded = params.get('d') ?? ''
  const name    = params.get('name') ?? 'there'
  const email   = params.get('email') ?? ''

  let results
  try {
    results = computeResults(JSON.parse(atob(encoded)))
  } catch {
    return (
      <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', color: WHITE }}>
          <p style={{ marginBottom: 16 }}>Results could not be loaded.</p>
          <Link href="/sysdig_scan/assess" style={{ color: TEAL }}>Retake the assessment →</Link>
        </div>
      </div>
    )
  }

  const tier       = TIER_META[results.tier]
  const firstName  = name.split(' ')[0]
  const passes555  = results.dimensions.filter(d => ['detection', 'alertquality', 'response'].includes(d.id) && d.passes555).length

  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: DARK }}>S</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800 }}>Sysdig</span>
            <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>· 555 Assessment Results</span>
          </div>
          <Link href="/sysdig_scan/assess" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>Retake →</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Score hero ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 40, alignItems: 'center', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '40px', marginBottom: 32 }}>
          <ScoreRing score={results.overall} colour={tier.colour} />
          <div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}>Hi {firstName} — your 555 Readiness Score</p>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: WHITE, marginBottom: 12, letterSpacing: '-0.02em' }}>
              {tier.label}
            </h1>
            <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, maxWidth: 480, marginBottom: 20 }}>
              {tier.description}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: '5s Detect',    dimId: 'detection' },
                { label: '5m Correlate', dimId: 'alertquality' },
                { label: '5m Respond',   dimId: 'response' },
              ].map(b => {
                const d = results.dimensions.find(x => x.id === b.dimId)
                const pass = d?.passes555 ?? false
                return (
                  <span key={b.label} style={{
                    fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 100,
                    background: pass ? `${TEAL}18` : '#EF444418',
                    border: `1px solid ${pass ? `${TEAL}40` : '#EF444440'}`,
                    color: pass ? TEAL : '#EF4444',
                  }}>
                    {pass ? '✓' : '✗'} {b.label}
                  </span>
                )
              })}
            </div>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 10 }}>{passes555}/3 benchmarks met</p>
          </div>
        </div>

        {/* ── Three CTAs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>

          {/* Download report */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 32 }}>📥</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, marginBottom: 4 }}>2025 Cloud Defense Report</div>
              <div style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>
                Sysdig's annual research on how cloud attacks are accelerating — and what defenders need to know.
              </div>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <a
                href={REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center',
                  background: TEAL, color: DARK,
                  fontSize: 14, fontWeight: 800,
                  padding: '12px 24px', borderRadius: 8, textDecoration: 'none',
                }}
              >
                Download free →
              </a>
              <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 8 }}>Instant · No extra form</p>
            </div>
          </div>

          {/* Book expert */}
          <div style={{ background: CARD, border: `1px solid ${TEAL}40`, borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 32 }}>📅</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, marginBottom: 4 }}>Talk to a Sysdig expert</div>
              <div style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>
                Get a guided walkthrough of your score and a concrete plan to close your biggest gaps.
              </div>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <a
                href={CALENDLY_SYSDIG}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center',
                  background: TEAL, color: DARK,
                  fontSize: 14, fontWeight: 800,
                  padding: '12px 24px', borderRadius: 8, textDecoration: 'none',
                }}
              >
                Book a session →
              </a>
              <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 8 }}>Free · 30 minutes</p>
            </div>
          </div>

          {/* Newsletter */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 32 }}>📬</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, marginBottom: 4 }}>Security newsletter</div>
              <div style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>
                Cloud threat research, benchmark updates, and practical guidance from the Sysdig team.
              </div>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <NewsletterButton email={email} />
              <p style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 8 }}>No spam · Unsubscribe anytime</p>
            </div>
          </div>
        </div>

        {/* ── Dimension breakdown ── */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '32px', marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginBottom: 24 }}>Score by dimension</h2>
          {results.dimensions.map(d => (
            <DimBar key={d.id} label={d.label} score={d.score} benchmark={d.benchmark} passes={d.passes555} />
          ))}
        </div>

        {/* ── Gap analysis ── */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '32px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginBottom: 20 }}>What this means for your organisation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {results.dimensions.filter(d => !d.passes555).map(d => (
              <div key={d.id} style={{ background: '#EF444410', border: '1px solid #EF444430', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', marginBottom: 6 }}>⚠ {d.label}</div>
                <div style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>Score {d.score}/100 — below the 555 threshold. Runtime telemetry can close this gap significantly.</div>
              </div>
            ))}
            {results.dimensions.filter(d => d.passes555).map(d => (
              <div key={d.id} style={{ background: `${TEAL}10`, border: `1px solid ${TEAL}30`, borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 6 }}>✓ {d.label}</div>
                <div style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>Score {d.score}/100 — meeting the benchmark. Maintain coverage as your environment scales.</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: MUTED }}>
          Based on the Sysdig 555 Benchmark · Powered by <span style={{ color: WHITE }}>Kirk & Blackbeard</span>
        </p>
      </footer>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0B0F1A' }} />}>
      <ResultsInner />
    </Suspense>
  )
}
