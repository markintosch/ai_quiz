'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BLACK  = '#0D0D0D'
const DARK   = '#111118'
const CARD   = '#1A1A26'
const BORDER = '#2A2A3A'
const RED    = '#E10600'   // F1 red
const WHITE  = '#FFFFFF'
const MUTED  = '#888899'
const BODY   = '#C0C0D0'
const AMBER  = '#FFD700'   // personal best yellow

// ── Vrooooom wordmark ─────────────────────────────────────────────────────────
function VrooooomLogo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.25,
        background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: size * 0.55, fontWeight: 900, color: WHITE, fontStyle: 'italic' }}>V</span>
      </div>
      <span style={{
        fontSize: size * 0.75, fontWeight: 900, color: WHITE,
        letterSpacing: '-0.03em', fontStyle: 'italic',
      }}>
        Vr<span style={{ color: RED }}>ooo</span>oom
      </span>
    </div>
  )
}

// ── Arena code input ──────────────────────────────────────────────────────────
function ArenaJoinForm() {
  const router = useRouter()
  const [code, setCode]   = useState('')
  const [error, setError] = useState('')

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (!clean || clean.length < 4) { setError('Enter a valid game code.'); return }
    router.push(`/arena/${clean}`)
  }

  return (
    <form onSubmit={handleJoin} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <input
        value={code}
        onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
        placeholder="Game code (e.g. F1RACE)"
        maxLength={8}
        style={{
          flex: '1 1 180px', background: '#0D0D0D', border: `2px solid ${error ? RED : BORDER}`,
          borderRadius: 8, padding: '12px 16px', fontSize: 16, fontWeight: 700,
          color: WHITE, letterSpacing: '0.08em', textTransform: 'uppercase', outline: 'none',
          fontFamily: 'Inter, monospace',
        }}
      />
      <button
        type="submit"
        style={{
          background: RED, color: WHITE, fontSize: 15, fontWeight: 800,
          padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Join →
      </button>
      {error && <p style={{ width: '100%', fontSize: 13, color: RED, margin: 0 }}>{error}</p>}
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function VrooooomPage() {
  return (
    <div style={{ minHeight: '100vh', background: BLACK, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>

      {/* ── MVP banner (full-width, top of page) ── */}
      <div style={{
        background: AMBER,
        color: BLACK,
        padding: '10px 24px',
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        lineHeight: 1.5,
      }}>
        🚧 MVP · Enkel bedoeld voor Rob Kamphues en het productieteam · Niet publiek delen · Inhoud en visuals kunnen wijzigen
      </div>

      {/* ── Nav ── */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <VrooooomLogo size={30} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: MUTED }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: RED, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            POWERED BY VIAPLAY
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: `linear-gradient(180deg, #1A0005 0%, ${BLACK} 100%)`,
        borderBottom: `1px solid ${BORDER}`,
        padding: '72px 24px 64px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Speed lines decoration */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'repeating-linear-gradient(90deg, #E10600 0px, transparent 1px, transparent 80px)',
          backgroundSize: '80px 100%',
        }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
            marginBottom: 28,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: `${RED}18`, border: `1px solid ${RED}40`,
              borderRadius: 100, padding: '5px 16px',
              fontSize: 11, fontWeight: 700, color: RED, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              🏎 Vrooooom Games — F1 Knowledge Experience
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: `${AMBER}18`, border: `1px solid ${AMBER}40`,
              borderRadius: 100, padding: '5px 12px',
              fontSize: 10, fontWeight: 800, color: AMBER, letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
              MVP · Niet delen
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.0,
            letterSpacing: '-0.04em', marginBottom: 20, fontStyle: 'italic',
          }}>
            Two ways to prove<br />
            <span style={{ color: RED }}>your F1 knowledge.</span>
          </h1>

          <p style={{ fontSize: 18, color: BODY, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Powered by <strong style={{ color: WHITE }}>Vrooooom</strong>, the Formula 1 show on Viaplay.
            Race against the clock or battle the studio live — every lap counts.
          </p>
        </div>
      </section>

      {/* ── Two game cards ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>

        {/* Hot Lap */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 20, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Coloured top stripe */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${AMBER}, ${RED})` }} />

          <div style={{ padding: '36px 32px', flex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `${AMBER}18`, border: `1px solid ${AMBER}40`,
              borderRadius: 100, padding: '4px 12px', marginBottom: 24,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Time Trial · Solo
              </span>
            </div>

            <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12, fontStyle: 'italic' }}>
              🏁 Hot Lap
            </h2>

            <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, marginBottom: 28 }}>
              10 F1 questions. 20 seconds each. Answer fast and correctly — your total time is your lap time.
              Post the fastest lap to claim pole position on the leaderboard.
            </p>

            {/* How it works */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {[
                { icon: '⏱', text: 'Every second you take is added to your lap time' },
                { icon: '⚠', text: 'Wrong answer or timeout = +5 second penalty' },
                { icon: '🟣', text: 'Purple sector = track record. Yellow = personal best' },
                { icon: '📤', text: 'Share your lap time card with one tap' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: BODY }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Sector preview */}
            <div style={{ background: '#0D0D0D', borderRadius: 10, padding: '14px 16px', marginBottom: 28, display: 'flex', gap: 8 }}>
              {[
                { label: 'S1', color: '#9B00FF', time: '0:18.2' },
                { label: 'S2', color: AMBER,     time: '0:32.7' },
                { label: 'S3', color: '#666',    time: '0:41.1' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.time}</div>
                </div>
              ))}
              <div style={{ flex: 1.5, textAlign: 'center', borderLeft: `1px solid ${BORDER}`, paddingLeft: 8 }}>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>LAP</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: AMBER, fontFamily: 'monospace' }}>1:32.0</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 32px 32px' }}>
            <Link
              href="/hot_lap"
              style={{
                display: 'block', textAlign: 'center',
                background: RED, color: WHITE,
                fontSize: 16, fontWeight: 900, fontStyle: 'italic',
                padding: '16px', borderRadius: 10, textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              Start Hot Lap →
            </Link>
            <p style={{ fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 10 }}>
              Solo · Instant · Free
            </p>
          </div>
        </div>

        {/* Vrooooom Arena */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 20, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${RED}, #FF6B00)` }} />

          <div style={{ padding: '36px 32px', flex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `${RED}18`, border: `1px solid ${RED}40`,
              borderRadius: 100, padding: '4px 12px', marginBottom: 24,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                🏟 Live · Multiplayer
              </span>
            </div>

            <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12, fontStyle: 'italic' }}>
              🎙 Vrooooom Arena
            </h2>

            <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7, marginBottom: 28 }}>
              The live knowledge battle. Rob Kamphues gives you a code during the show — you join on your phone and
              race 20 studio contestants simultaneously. One winner takes the podium.
            </p>

            {/* How it works */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {[
                { icon: '📺', text: 'A game code appears on screen during Vrooooom' },
                { icon: '📱', text: 'Enter the code below and join from any device' },
                { icon: '⚡', text: 'Speed + accuracy = points. Faster answer = more points' },
                { icon: '🏆', text: 'Winner gets called out live on the show' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: BODY }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Leaderboard preview */}
            <div style={{ background: '#0D0D0D', borderRadius: 10, padding: '14px 16px', marginBottom: 28 }}>
              {[
                { pos: '🥇', name: 'MaxFan2025',   pts: '2 450' },
                { pos: '🥈', name: 'ScuderiaJan',  pts: '2 100' },
                { pos: '🥉', name: 'PapayaVibes',  pts: '1 875' },
              ].map(r => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: 13 }}>{r.pos} <span style={{ color: WHITE, fontWeight: 600 }}>{r.name}</span></span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: AMBER, fontFamily: 'monospace' }}>{r.pts}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '0 32px 32px' }}>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>Have a code from the show?</p>
            <Suspense fallback={null}>
              <ArenaJoinForm />
            </Suspense>
            <p style={{ fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 10 }}>
              Live only · Code shown on Vrooooom during GP weekends
            </p>
          </div>
        </div>
      </section>

      {/* ── About Vrooooom ── */}
      <section style={{ borderTop: `1px solid ${BORDER}`, background: DARK, padding: '56px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: RED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>About the show</p>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16, fontStyle: 'italic' }}>
            What is Vrooooom?
          </h2>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.8, marginBottom: 24 }}>
            Vrooooom is Viaplay's Formula 1 talk show, airing <strong style={{ color: WHITE }}>Friday and Sunday evenings</strong> during every Grand Prix weekend.
            Host <strong style={{ color: WHITE }}>Rob Kamphues</strong> dives into the latest paddock news, the best racing stories, and exclusive behind-the-scenes action — with guests from inside the world of F1.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🎙 Rob Kamphues', '📺 Viaplay', '🏎 Every GP Weekend', '🏟 Studio Audience'].map(tag => (
              <span key={tag} style={{ fontSize: 13, color: MUTED, padding: '6px 14px', border: `1px solid ${BORDER}`, borderRadius: 100 }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: MUTED }}>
          Vrooooom Games · Powered by <span style={{ color: WHITE }}>Viaplay</span> · Built by <span style={{ color: WHITE }}>Kirk & Blackbeard</span>
        </p>
      </footer>
    </div>
  )
}
