'use client'

import Link from 'next/link'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const DARK   = '#0B0F1A'
const NAVY   = '#111827'
const CARD   = '#161D2E'
const BORDER = '#1E2D40'
const TEAL   = '#00C58E'
const TEAL_D = '#00A576'
const WHITE  = '#FFFFFF'
const MUTED  = '#8B9EB0'
const BODY   = '#C8D6E5'

const DIMS = [
  { icon: '⚡', label: 'Detection Speed',          sub: 'Seconds matter when threats emerge' },
  { icon: '🎯', label: 'Alert Quality',             sub: 'Signal vs noise in your environment' },
  { icon: '🛡️', label: 'Response Capability',       sub: 'How fast can you contain and isolate' },
  { icon: '👁️', label: 'Runtime Visibility',         sub: 'What you can see inside your workloads' },
  { icon: '🤖', label: 'AI & Emerging Threats',     sub: 'NIS2 readiness and novel attack coverage' },
]

const OUTCOMES = [
  {
    icon: '📊',
    title: 'Your 555 Readiness Score',
    body: 'A score from 0–100 across all five dimensions, measured against the Sysdig 555 Benchmark standard.',
  },
  {
    icon: '🔍',
    title: 'Gap analysis per dimension',
    body: 'See exactly where you pass and where you fall short — with specific blind spots highlighted.',
  },
  {
    icon: '📋',
    title: 'Tailored next steps',
    body: 'Based on your score, practical guidance on where to focus first — plus access to the 2025 Cloud Defense Report.',
  },
]

export default function SysdigLandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>

      {/* ── Nav ── */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, background: DARK, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Sysdig wordmark placeholder */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: DARK }}>S</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: WHITE, letterSpacing: '-0.02em' }}>Sysdig</span>
            </div>
            <span style={{ width: 1, height: 20, background: BORDER }} />
            <span style={{ fontSize: 13, color: MUTED }}>555 Assessment</span>
          </div>
          <Link
            href="/sysdig_scan/assess"
            style={{
              background: TEAL, color: DARK, fontSize: 13, fontWeight: 700,
              padding: '8px 20px', borderRadius: 8, textDecoration: 'none',
            }}
          >
            Start assessment →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: `linear-gradient(135deg, ${DARK} 0%, #0D1A2E 100%)`, padding: '88px 24px 80px', textAlign: 'center', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${TEAL}18`, border: `1px solid ${TEAL}40`, borderRadius: 100, padding: '6px 16px', marginBottom: 32 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: TEAL, display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: '0.1em', textTransform: 'uppercase' }}>555 Benchmark Self-Assessment</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24, color: WHITE }}>
            How fast does your organisation<br />
            <span style={{ color: TEAL }}>really detect and respond</span><br />
            to cloud threats?
          </h1>

          <p style={{ fontSize: 18, color: BODY, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
            The Sysdig 555 Benchmark defines the industry standard: detect in <strong style={{ color: WHITE }}>5 seconds</strong>, correlate in <strong style={{ color: WHITE }}>5 minutes</strong>, respond in <strong style={{ color: WHITE }}>5 minutes</strong>. Most organisations don't come close. Find out where you stand.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link
              href="/sysdig_scan/assess"
              style={{
                background: TEAL, color: DARK, fontSize: 15, fontWeight: 800,
                padding: '14px 32px', borderRadius: 10, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              Take the assessment — free
              <span>→</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: MUTED }}>
              <span>⏱</span> 5 minutes · 20 questions · Instant results
            </div>
          </div>

          {/* 555 visual */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { num: '5', unit: 'Seconds', label: 'Detect' },
              { num: '5', unit: 'Minutes', label: 'Correlate' },
              { num: '5', unit: 'Minutes', label: 'Respond' },
            ].map(b => (
              <div key={b.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 28px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: TEAL, lineHeight: 1 }}>{b.num}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{b.unit}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: WHITE, marginTop: 4 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we assess ── */}
      <section style={{ padding: '72px 24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Five dimensions</p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em' }}>What the assessment covers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {DIMS.map(d => (
              <div key={d.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '24px 20px' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{d.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, marginBottom: 6 }}>{d.label}</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{d.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you get ── */}
      <section style={{ padding: '72px 24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Your results</p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em' }}>What you get after completing it</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {OUTCOMES.map(o => (
              <div key={o.title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '28px 24px' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{o.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: WHITE, marginBottom: 10 }}>{o.title}</div>
                <div style={{ fontSize: 14, color: BODY, lineHeight: 1.6 }}>{o.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Ready to find your 555 score?
          </h2>
          <p style={{ fontSize: 16, color: BODY, marginBottom: 32 }}>
            Free, anonymous, 5 minutes. Your results are available immediately.
          </p>
          <Link
            href="/sysdig_scan/assess"
            style={{
              display: 'inline-block',
              background: TEAL, color: DARK, fontSize: 16, fontWeight: 800,
              padding: '16px 40px', borderRadius: 10, textDecoration: 'none',
            }}
          >
            Start the assessment →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: MUTED }}>
          This assessment is based on the Sysdig 555 Benchmark. Results are for diagnostic purposes.
          &nbsp;·&nbsp; Powered by <span style={{ color: WHITE }}>Kirk & Blackbeard</span>
        </p>
      </footer>
    </div>
  )
}
