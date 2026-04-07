'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const DARK   = '#0B0F1A'
const NAVY   = '#111827'
const CARD   = '#161D2E'
const BORDER = '#1E2D40'
const TEAL   = '#00C58E'
const WHITE  = '#FFFFFF'
const MUTED  = '#8B9EB0'
const BODY   = '#C8D6E5'
const RED    = '#EF4444'
const AMBER  = '#F59E0B'
const BLUE   = '#3B82F6'

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://markdekock.com'

// ── QR Modal ──────────────────────────────────────────────────────────────────
function QRModal({ code, onClose }: { code: string; onClose: () => void }) {
  const url = `${BASE_URL}/arena/${code.toUpperCase()}`
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF', borderRadius: 24,
          padding: '40px 48px', textAlign: 'center',
          cursor: 'default', maxWidth: 420,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Scan to join
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, color: DARK, letterSpacing: '0.15em', marginBottom: 24 }}>
          {code.toUpperCase()}
        </div>
        <QRCodeSVG
          value={url}
          size={280}
          fgColor={DARK}
          bgColor="#FFFFFF"
          level="M"
          style={{ display: 'block', margin: '0 auto 24px' }}
        />
        <div style={{ fontSize: 13, color: '#6B7280', wordBreak: 'break-all', marginBottom: 20 }}>{url}</div>
        <button
          onClick={onClose}
          style={{
            background: DARK, color: WHITE,
            border: 'none', borderRadius: 10,
            padding: '12px 32px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
      <p style={{ marginTop: 20, fontSize: 13, color: '#4B5563' }}>Click outside to dismiss</p>
    </div>
  )
}

// ── Arena join form ───────────────────────────────────────────────────────────
function ArenaJoinForm() {
  const router = useRouter()
  const [code,  setCode]  = useState('')
  const [error, setError] = useState('')
  const [qr,    setQr]    = useState(false)

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (!clean || clean.length < 4) { setError('Enter a valid game code.'); return }
    router.push(`/arena/${clean}`)
  }

  const canShowQr = code.trim().length >= 4

  return (
    <>
      {qr && <QRModal code={code} onClose={() => setQr(false)} />}
      <form onSubmit={handleJoin}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            placeholder="Game code (e.g. SYSDIG1)"
            maxLength={8}
            style={{
              flex: '1 1 180px',
              background: DARK, border: `2px solid ${error ? RED : BORDER}`,
              borderRadius: 10, padding: '13px 16px',
              fontSize: 18, fontWeight: 900, letterSpacing: '0.1em',
              color: WHITE, outline: 'none', textTransform: 'uppercase',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
          <button
            type="submit"
            style={{
              background: TEAL, color: DARK,
              border: 'none', borderRadius: 10,
              padding: '13px 24px', fontSize: 15, fontWeight: 800,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Join →
          </button>
        </div>
        {error && <p style={{ fontSize: 13, color: RED, margin: '0 0 8px' }}>{error}</p>}
        <button
          type="button"
          onClick={() => canShowQr && setQr(true)}
          disabled={!canShowQr}
          style={{
            background: 'transparent',
            border: `1px solid ${canShowQr ? TEAL : BORDER}`,
            borderRadius: 8, padding: '9px 18px',
            fontSize: 13, fontWeight: 700,
            color: canShowQr ? TEAL : MUTED,
            cursor: canShowQr ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span>⬛</span> Show QR code for attendees
        </button>
      </form>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Sysdig555Page() {
  return (
    <div style={{ minHeight: '100vh', background: DARK, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>

      {/* ── Nav ── */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, background: DARK, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: DARK }}>S</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: WHITE }}>Sysdig</span>
            </div>
            <span style={{ width: 1, height: 20, background: BORDER }} />
            <span style={{ fontSize: 13, color: MUTED }}>555 Games</span>
          </div>
          <span style={{ fontSize: 12, color: MUTED }}>Kirk &amp; Blackbeard</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 24px 56px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: `${TEAL}18`, border: `1px solid ${TEAL}40`,
          borderRadius: 100, padding: '6px 16px', marginBottom: 24,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>🎮 Demand gen &amp; event activation</span>
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px', maxWidth: 780 }}>
          Make cloud security{' '}
          <span style={{ color: TEAL }}>knowledge stick.</span>
          <br />Two games. One brief.
        </h1>
        <p style={{ fontSize: 18, color: BODY, lineHeight: 1.7, maxWidth: 600, margin: '0 0 16px' }}>
          Both games are built around the Sysdig 555 Benchmark. Use them to generate leads, warm up webinars, or run a booth contest — people play, you get the data.
        </p>
        <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
          Questions cover: 555 Benchmark · eBPF · Falco · Container security · Cloud attack techniques · Kubernetes · NIS2
        </p>
      </div>

      {/* ── Two game cards ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 24 }}>

          {/* ── Card 1: 555 Time Trial ── */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ height: 4, background: `linear-gradient(90deg, ${TEAL}, #00A576)` }} />
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${TEAL}18`, border: `1px solid ${TEAL}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24,
                }}>
                  ⏱
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: WHITE }}>555 Time Trial</h2>
                  <p style={{ fontSize: 13, color: TEAL, margin: 0, fontWeight: 700 }}>Solo · Always-on · Leaderboard</p>
                </div>
              </div>

              <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, marginBottom: 20 }}>
                A timed solo challenge — 10 security questions, 15 seconds each. Wrong answers cost +10 seconds. Your total response time goes on the leaderboard.
              </p>

              {/* Mechanics */}
              <div style={{ background: DARK, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>How it works</p>
                {[
                  { icon: '1', text: '10 questions in 3 phases: Fundamentals → Analyst → Expert' },
                  { icon: '2', text: '15 seconds per question — answer fast to beat the clock' },
                  { icon: '3', text: 'Wrong answer = +10s penalty (a missed alert costs time)' },
                  { icon: '4', text: 'Name + email at the end → saved to the 555 leaderboard' },
                ].map(s => (
                  <div key={s.icon} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: `${TEAL}20`, border: `1px solid ${TEAL}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: TEAL, flexShrink: 0, marginTop: 1,
                    }}>{s.icon}</span>
                    <span style={{ fontSize: 13, color: BODY, lineHeight: 1.5 }}>{s.text}</span>
                  </div>
                ))}
              </div>

              {/* Use cases */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {['Website demand gen', 'LinkedIn ad destination', 'Email campaign CTA', 'Webinar warm-up'].map(tag => (
                  <span key={tag} style={{
                    fontSize: 12, fontWeight: 600, color: TEAL,
                    background: `${TEAL}12`, border: `1px solid ${TEAL}30`,
                    borderRadius: 100, padding: '4px 12px',
                  }}>{tag}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/sysdig_555/play" style={{
                  display: 'inline-block', background: TEAL, color: DARK,
                  fontSize: 15, fontWeight: 800, padding: '14px 28px',
                  borderRadius: 10, textDecoration: 'none',
                }}>
                  Play now →
                </Link>
                <Link href="/sysdig_555/leaderboard" style={{
                  display: 'inline-block', background: 'transparent',
                  border: `1px solid ${BORDER}`, color: BODY,
                  fontSize: 14, fontWeight: 600, padding: '14px 24px',
                  borderRadius: 10, textDecoration: 'none',
                }}>
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>

          {/* ── Card 2: Live Arena ── */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ height: 4, background: `linear-gradient(90deg, ${BLUE}, #6366F1)` }} />
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${BLUE}18`, border: `1px solid ${BLUE}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24,
                }}>
                  🏟
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: WHITE }}>Live Arena</h2>
                  <p style={{ fontSize: 13, color: BLUE, margin: 0, fontWeight: 700 }}>Multiplayer · Events · QR join</p>
                </div>
              </div>

              <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, marginBottom: 20 }}>
                A live multiplayer game you run from the stage or booth. Everyone plays simultaneously. You control the pace. Attendees join by scanning a QR code.
              </p>

              {/* Mechanics */}
              <div style={{ background: DARK, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>How it works</p>
                {[
                  { icon: '1', text: 'Create a session in the admin — paste in your questions, set the code' },
                  { icon: '2', text: 'Display the QR code — attendees scan and join on their phone' },
                  { icon: '3', text: 'Start the round — everyone answers simultaneously' },
                  { icon: '4', text: 'Live leaderboard on screen — fastest correct answers win' },
                ].map(s => (
                  <div key={s.icon} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: `${BLUE}20`, border: `1px solid ${BLUE}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: BLUE, flexShrink: 0, marginTop: 1,
                    }}>{s.icon}</span>
                    <span style={{ fontSize: 13, color: BODY, lineHeight: 1.5 }}>{s.text}</span>
                  </div>
                ))}
              </div>

              {/* Use cases */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {['Conference booth', 'Webinar live poll', 'Sales kickoff', 'Partner enablement'].map(tag => (
                  <span key={tag} style={{
                    fontSize: 12, fontWeight: 600, color: BLUE,
                    background: `${BLUE}12`, border: `1px solid ${BLUE}30`,
                    borderRadius: 100, padding: '4px 12px',
                  }}>{tag}</span>
                ))}
              </div>

              {/* Code entry + QR */}
              <div style={{ background: DARK, borderRadius: 12, padding: '20px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: BODY, margin: '0 0 14px' }}>
                  Have a code? Join or display QR for attendees:
                </p>
                <Suspense fallback={null}>
                  <ArenaJoinForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why it works ── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: NAVY }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            Why knowledge games work for B2B security
          </h2>
          <p style={{ fontSize: 15, color: MUTED, margin: '0 0 48px' }}>
            People remember what they discover themselves. A timed challenge creates a memorable moment — and ties it to your brand.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              {
                icon: '🎯',
                title: 'Lead quality',
                body: 'Anyone who completes a 10-question security challenge self-identifies as curious or knowledgeable. Higher intent than a whitepaper download.',
              },
              {
                icon: '⚡',
                title: 'Booth dwell time',
                body: 'A game gives people a reason to stay at the booth for 3+ minutes instead of 30 seconds. More time = more conversation.',
              },
              {
                icon: '🏆',
                title: 'Competitive hook',
                body: 'A leaderboard turns passive attendees into participants. People return to beat their score or challenge a colleague.',
              },
              {
                icon: '📊',
                title: 'Qualification data',
                body: 'Wrong answers reveal knowledge gaps. Segmented follow-up ("you scored low on container escape detection — here\'s a resource") converts better.',
              },
            ].map(card => (
              <div key={card.title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '24px 20px' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: WHITE, margin: '0 0 8px' }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6, margin: 0 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Setup guide ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          Running the Live Arena at your event
        </h2>
        <p style={{ fontSize: 15, color: MUTED, margin: '0 0 40px' }}>Three steps, takes 5 minutes to set up.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {[
            {
              step: '01',
              title: 'Create a session in admin',
              body: 'Go to the admin panel → Arena → New session. Choose your questions, set a memorable code (e.g. SYSDIG1 or your event name). Save.',
              cta: { label: 'Open admin →', href: '/admin/games/arena' },
            },
            {
              step: '02',
              title: 'Display the QR code',
              body: 'Enter your code in the Live Arena card above. Hit "Show QR code for attendees" — it goes fullscreen on any screen or can be printed. Attendees scan and land directly in the game.',
              cta: null,
            },
            {
              step: '03',
              title: 'Start and host the session',
              body: 'In the admin panel, click Start — questions advance on your command. A live leaderboard updates in real time. Export leads from the admin after the session.',
              cta: { label: 'View arena sessions →', href: '/admin/games/arena' },
            },
          ].map((s, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '28px 24px' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: BORDER, letterSpacing: '-0.04em', marginBottom: 12 }}>{s.step}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: WHITE, margin: '0 0 10px' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: '0 0 16px' }}>{s.body}</p>
              {s.cta && (
                <Link href={s.cta.href} style={{ fontSize: 13, fontWeight: 700, color: TEAL, textDecoration: 'none' }}>
                  {s.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Score tiers (matches 555 assessment) ── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: NAVY }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 8px' }}>Score tiers match the 555 Assessment</h2>
          <p style={{ fontSize: 14, color: MUTED, margin: '0 0 32px' }}>
            Game results use the same language as the full assessment — every player sees their tier and knows what it means.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Operationally Mature',   colour: '#00C58E', time: '< 0:40',   desc: 'Fast and accurate — top 10% of responders' },
              { label: 'Operationally Capable',  colour: '#3B82F6', time: '0:40–1:10', desc: 'Solid foundation with some gaps' },
              { label: 'Building Foundations',   colour: '#F59E0B', time: '1:10–1:40', desc: 'Key concepts need reinforcement' },
              { label: 'Flying Blind',           colour: '#EF4444', time: '> 1:40',   desc: 'Significant coverage gaps' },
            ].map(t => (
              <div key={t.label} style={{
                background: CARD, border: `1px solid ${t.colour}30`,
                borderRadius: 14, padding: '20px 16px',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.colour, letterSpacing: '0.05em', marginBottom: 6 }}>
                  {t.time}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: WHITE, marginBottom: 6 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
          Built by <span style={{ color: TEAL, fontWeight: 700 }}>Kirk &amp; Blackbeard</span> for Sysdig.
          Questions based on the{' '}
          <a href="https://sysdig.com/555-benchmark/" target="_blank" rel="noopener noreferrer" style={{ color: TEAL, textDecoration: 'none' }}>
            555 Benchmark
          </a>.
        </p>
      </div>

    </div>
  )
}
