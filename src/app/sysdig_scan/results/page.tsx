'use client'

import { Suspense } from 'react'
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
  const r = 72
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <svg width={180} height={180} viewBox="0 0 180 180" style={{ display: 'block' }}>
      <circle cx={90} cy={90} r={r} fill="none" stroke={BORDER} strokeWidth={12} />
      <circle
        cx={90} cy={90} r={r}
        fill="none"
        stroke={colour}
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={0}
        transform="rotate(-90 90 90)"
      />
      <text x={90} y={84} textAnchor="middle" fontSize={40} fontWeight={900} fill={WHITE} fontFamily="Inter, system-ui, sans-serif">{score}</text>
      <text x={90} y={106} textAnchor="middle" fontSize={13} fill={MUTED} fontFamily="Inter, system-ui, sans-serif">/100</text>
    </svg>
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
        <div style={{ height: '100%', width: `${score}%`, background: colour, borderRadius: 3, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
function ResultsInner() {
  const params   = useSearchParams()
  const encoded  = params.get('d') ?? ''
  const name     = params.get('name') ?? 'there'
  const opts     = params.get('opts') ?? '000'

  const optDownload    = opts[0] === '1'
  const optExpert      = opts[1] === '1'
  const optNewsletter  = opts[2] === '1'

  let results
  try {
    const answers = JSON.parse(atob(encoded))
    results = computeResults(answers)
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

  const tier     = TIER_META[results.tier]
  const firstName = name.split(' ')[0]

  const passes555 = results.dimensions.filter(d => ['detection', 'alertquality', 'response'].includes(d.id) && d.passes555).length
  const total555  = 3

  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: DARK }}>S</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: WHITE }}>Sysdig</span>
            <span style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>· 555 Assessment Results</span>
          </div>
          <Link href="/sysdig_scan/assess" style={{ fontSize: 13, color: MUTED, textDecoration: 'none' }}>
            Retake →
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Score hero ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 40, alignItems: 'center', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '40px 40px', marginBottom: 32 }}>
          <ScoreRing score={results.overall} colour={tier.colour} />
          <div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}>
              Hi {firstName} — here is your 555 Readiness Score
            </p>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: WHITE, marginBottom: 12, letterSpacing: '-0.02em' }}>
              {tier.label}
            </h1>
            <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, maxWidth: 480 }}>
              {tier.description}
            </p>

            {/* 555 pass/fail summary */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
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

            <p style={{ fontSize: 13, color: MUTED, marginTop: 12 }}>
              {passes555}/{total555} 555 benchmarks met
            </p>
          </div>
        </div>

        {/* ── Dimension breakdown ── */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '32px', marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginBottom: 24 }}>Score by dimension</h2>
          {results.dimensions.map(d => (
            <DimBar
              key={d.id}
              label={d.label}
              score={d.score}
              benchmark={d.benchmark}
              passes={d.passes555}
            />
          ))}
        </div>

        {/* ── What this means ── */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '32px', marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginBottom: 20 }}>
            What this means for your organisation
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {results.dimensions.filter(d => !d.passes555).map(d => (
              <div key={d.id} style={{ background: '#EF444410', border: '1px solid #EF444430', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', marginBottom: 6 }}>⚠ {d.label}</div>
                <div style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>
                  Score {d.score}/100 — below the 555 threshold. Runtime telemetry can close this gap significantly.
                </div>
              </div>
            ))}
            {results.dimensions.filter(d => d.passes555).map(d => (
              <div key={d.id} style={{ background: `${TEAL}10`, border: `1px solid ${TEAL}30`, borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 6 }}>✓ {d.label}</div>
                <div style={{ fontSize: 13, color: BODY, lineHeight: 1.6 }}>
                  Score {d.score}/100 — meeting the benchmark. Maintain runtime coverage as your environment scales.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Follow-up confirmation ── */}
        {(optDownload || optExpert || optNewsletter) && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '32px', marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginBottom: 6 }}>What happens next</h2>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 20 }}>Based on your selections — check your inbox.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {optDownload && (
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', background: `${TEAL}10`, border: `1px solid ${TEAL}30`, borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>📥</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>2025 Cloud Defense Report</div>
                    <div style={{ fontSize: 13, color: BODY, marginTop: 2 }}>A download link has been sent to your email automatically.</div>
                    <a href={REPORT_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: TEAL, marginTop: 4, display: 'inline-block' }}>
                      Or download directly →
                    </a>
                  </div>
                </div>
              )}
              {optExpert && (
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', background: '#3B82F610', border: '1px solid #3B82F630', borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>📅</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>Sysdig expert conversation</div>
                    <div style={{ fontSize: 13, color: BODY, marginTop: 2 }}>A Sysdig specialist will reach out within one business day. Or book directly:</div>
                    <a href={CALENDLY_SYSDIG} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#3B82F6', marginTop: 4, display: 'inline-block' }}>
                      Book a time slot →
                    </a>
                  </div>
                </div>
              )}
              {optNewsletter && (
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', background: '#3B82F610', border: '1px solid #3B82F630', borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>📬</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>Security newsletter</div>
                    <div style={{ fontSize: 13, color: BODY, marginTop: 2 }}>You'll be added to the Sysdig security newsletter. Expect cloud threat research and practical guidance.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CTA if no expert booked ── */}
        {!optExpert && (
          <div style={{ background: `linear-gradient(135deg, ${TEAL}18, #1E2D4050)`, border: `1px solid ${TEAL}30`, borderRadius: 16, padding: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: WHITE, marginBottom: 10 }}>
              Want to discuss your results with a Sysdig expert?
            </h2>
            <p style={{ fontSize: 14, color: BODY, marginBottom: 24 }}>
              A specialist can walk you through the gaps in your 555 score and show you exactly how Sysdig addresses them.
            </p>
            <a
              href={CALENDLY_SYSDIG}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block', background: TEAL, color: DARK,
                fontSize: 15, fontWeight: 800, padding: '14px 32px',
                borderRadius: 10, textDecoration: 'none',
              }}
            >
              Book a Sysdig expert →
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
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
