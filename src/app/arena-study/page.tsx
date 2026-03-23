import { Press_Start_2P, VT323 } from 'next/font/google'

const pressStart = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-press-start' })
const vt323 = VT323({ weight: '400', subsets: ['latin'], variable: '--font-vt323' })

export default function ArenaStudy() {
  return (
    <div
      className={`${pressStart.variable} ${vt323.variable}`}
      style={{ fontFamily: 'var(--font-vt323), monospace', background: '#050A14', color: '#fff', minHeight: '100vh' }}
    >
      {/* ── DESIGN ANNOTATION HEADER ─────────────────────────── */}
      <div style={{ background: '#FFD700', color: '#000', padding: '0.5rem 1.5rem', fontSize: '0.75rem', fontFamily: 'system-ui', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <span>📐 VISUAL STUDY — Cloud Arena with TrueFullstaq Mars Hero</span>
        <span style={{ opacity: 0.6, fontWeight: 400 }}>Save the Mars image to /public/truefullstaq-mars.jpg to see the full photo effect</span>
      </div>

      {/* ══════════════════════════════════════════════════════════
          HERO — Mars image background
      ════════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', minHeight: 520, overflow: 'hidden' }}>

        {/* Background image — falls back to CSS Mars gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/truefullstaq-mars.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          background: 'url(/truefullstaq-mars.png) center 30% / cover no-repeat, linear-gradient(180deg, #050A14 0%, #0D1A2E 25%, #1A2A10 45%, #3D1A08 65%, #C1440E 80%, #8B2F08 100%)',
        }} />

        {/* Starfield overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.8) 0%, transparent 100%), radial-gradient(1px 1px at 45% 10%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 75% 15%, rgba(255,255,255,0.9) 0%, transparent 100%), radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 60% 5%, rgba(255,255,255,0.7) 0%, transparent 100%), radial-gradient(1px 1px at 88% 30%, rgba(255,255,255,0.6) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Dark gradient overlay — fades image into dark at bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(5,10,20,0.55) 0%, rgba(5,10,20,0.3) 30%, rgba(5,10,20,0.7) 65%, rgba(5,10,20,0.97) 100%)',
        }} />

        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
          pointerEvents: 'none',
        }} />

        {/* ── HERO CONTENT ── */}
        <div style={{ position: 'relative', zIndex: 2, padding: '3rem 2rem 2rem', maxWidth: 1100, margin: '0 auto' }}>

          {/* Top bar: host + status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🚀</div>
              <div>
                <div style={{ fontFamily: 'system-ui', fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Hosted by</div>
                <div style={{ fontFamily: 'system-ui', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>TrueFullstaq</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF88', display: 'inline-block', boxShadow: '0 0 6px #00FF88' }} />
              <span style={{ fontFamily: 'system-ui', fontSize: '0.75rem', color: '#00FF88', fontWeight: 700 }}>LIVE — 3 players waiting</span>
            </div>
          </div>

          {/* Main title */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              fontFamily: 'var(--font-press-start)',
              fontSize: 'clamp(1.8rem, 5vw, 4rem)',
              color: '#00E5FF',
              textShadow: '0 0 20px rgba(0,229,255,0.8), 0 0 60px rgba(0,229,255,0.4), 0 0 120px rgba(0,229,255,0.2)',
              letterSpacing: '0.08em',
              lineHeight: 1.3,
              marginBottom: '0.75rem',
            }}>
              ☁ CLOUD ARENA
            </div>
            <div style={{
              fontFamily: 'var(--font-vt323)',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              color: 'rgba(255,255,255,0.65)',
              letterSpacing: '0.15em',
            }}>
              TRUEFULLSTAQ · CLOUD TRAINING GROUNDS · SURFACE BASE ALPHA
            </div>
          </div>

          {/* Game metadata strip */}
          <div style={{
            display: 'flex', gap: '0', justifyContent: 'center',
            border: '1px solid rgba(0,229,255,0.3)',
            borderRadius: 8,
            overflow: 'hidden',
            maxWidth: 600,
            margin: '0 auto 2rem',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
          }}>
            {[
              { label: 'QUESTIONS', value: '20' },
              { label: 'SEC / Q', value: '30' },
              { label: 'LIVES', value: '∞' },
              { label: 'PLAYERS', value: '3' },
            ].map((item, i) => (
              <div key={item.label} style={{
                flex: 1, padding: '0.75rem 0.5rem', textAlign: 'center',
                borderLeft: i > 0 ? '1px solid rgba(0,229,255,0.2)' : 'none',
              }}>
                <div style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.55rem', color: 'rgba(0,229,255,0.6)', marginBottom: '0.35rem', letterSpacing: '0.05em' }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-vt323)', fontSize: '1.6rem', color: '#FFD700', lineHeight: 1 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* What is Cloud Arena explainer */}
          <div style={{
            maxWidth: 700, margin: '0 auto',
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(0,229,255,0.15)',
            borderRadius: 10,
            padding: '1.25rem 1.75rem',
            backdropFilter: 'blur(10px)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.5rem', color: '#00E5FF', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>WHAT IS THIS?</div>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, margin: 0 }}>
                Cloud Arena is a live multiplayer knowledge challenge. Answer cloud readiness questions, earn points for speed and accuracy, and compete with your colleagues in real time.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.5rem', color: '#00E5FF', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>HOW SCORING WORKS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {['Faster answer = more points', 'Streaks give bonus multipliers', 'Top 3 win glory (and prizes)'].map(s => (
                  <div key={s} style={{ fontFamily: 'system-ui', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#FFD700', flexShrink: 0 }}>▸</span> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MAIN GAME AREA — Two column layout
      ════════════════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

        {/* ── LEFT: JOIN FORM ── */}
        <div>
          {/* Arcade terminal frame */}
          <div style={{
            background: 'rgba(0,229,255,0.04)',
            border: '2px solid rgba(0,229,255,0.3)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(0,229,255,0.08), inset 0 0 40px rgba(0,0,0,0.3)',
          }}>
            {/* Terminal header bar */}
            <div style={{ background: 'rgba(0,229,255,0.12)', borderBottom: '1px solid rgba(0,229,255,0.3)', padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.5rem', color: '#00E5FF', letterSpacing: '0.08em' }}>▶ PLAYER REGISTRATION</span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-vt323)', fontSize: '1rem', color: 'rgba(0,229,255,0.5)' }}>GAME: TF-2024-CLOUD</span>
            </div>

            <div style={{ padding: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.6rem', color: '#FFD700', marginBottom: '1.5rem', letterSpacing: '0.06em' }}>
                INSERT COIN TO PLAY
              </div>

              {/* Form fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.45rem', color: 'rgba(0,229,255,0.7)', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>YOUR NAME</label>
                  <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,229,255,0.4)', borderRadius: 6, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#00E5FF', opacity: 0.5 }}>▸</span>
                    <span style={{ fontFamily: 'var(--font-vt323)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)' }}>Enter your name…</span>
                    <span style={{ marginLeft: 'auto', animation: 'none', color: '#00E5FF', fontFamily: 'var(--font-vt323)', fontSize: '1.1rem' }}>█</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.45rem', color: 'rgba(0,229,255,0.7)', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>YOUR ROLE</label>
                  <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,229,255,0.4)', borderRadius: 6, padding: '0.75rem 1rem' }}>
                    <span style={{ fontFamily: 'var(--font-vt323)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)' }}>Select your role ▾</span>
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, #C1440E 0%, #FF6B1A 100%)',
                border: 'none',
                borderRadius: 8,
                padding: '1rem',
                fontFamily: 'var(--font-press-start)',
                fontSize: '0.65rem',
                color: '#fff',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(193,68,14,0.5)',
              }}>
                INSERT COIN — JOIN ARENA →
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontFamily: 'var(--font-vt323)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>
                No account needed · 20 questions · ~10 minutes
              </div>
            </div>
          </div>

          {/* COLOUR ANNOTATION */}
          <div style={{ marginTop: '1.5rem', background: 'rgba(255,215,0,0.05)', border: '1px dashed rgba(255,215,0,0.3)', borderRadius: 8, padding: '1rem 1.25rem' }}>
            <div style={{ fontFamily: 'system-ui', fontSize: '0.7rem', color: '#FFD700', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>📐 Colour palette from the Mars image</div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { hex: '#050A14', label: 'Deep Space' },
                { hex: '#C1440E', label: 'Mars Surface' },
                { hex: '#00E5FF', label: 'Cloud Cyan' },
                { hex: '#FFD700', label: 'Arcade Gold' },
                { hex: '#00FF88', label: 'Status Green' },
                { hex: '#3D6B8A', label: 'Building Steel' },
              ].map(c => (
                <div key={c.hex} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: c.hex, border: '1px solid rgba(255,255,255,0.15)' }} />
                  <span style={{ fontFamily: 'system-ui', fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)' }}>{c.hex} · {c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* How to Play */}
          <div style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: 'rgba(0,229,255,0.1)', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(0,229,255,0.2)' }}>
              <span style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.45rem', color: '#00E5FF', letterSpacing: '0.08em' }}>HOW TO PLAY</span>
            </div>
            <div style={{ padding: '1rem' }}>
              {[
                ['01', 'Enter your name'],
                ['02', 'Wait for host to start'],
                ['03', 'Answer fast — speed scores'],
                ['04', 'See the leaderboard live'],
              ].map(([n, t]) => (
                <div key={n} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.45rem', color: '#C1440E', flexShrink: 0, marginTop: 2 }}>{n}</span>
                  <span style={{ fontFamily: 'system-ui', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live leaderboard preview */}
          <div style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: 'rgba(0,229,255,0.1)', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(0,229,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.45rem', color: '#00E5FF', letterSpacing: '0.08em' }}>PLAYERS WAITING</span>
              <span style={{ fontFamily: 'var(--font-vt323)', fontSize: '0.9rem', color: '#00FF88' }}>3 JOINED</span>
            </div>
            <div style={{ padding: '0.75rem 1rem' }}>
              {[
                { rank: '1', name: 'Jeroen K.', role: 'Cloud Architect', color: '#FFD700' },
                { rank: '2', name: 'Annemiek V.', role: 'DevOps Engineer', color: 'rgba(255,255,255,0.6)' },
                { rank: '3', name: 'Thomas B.', role: 'Product Owner', color: '#CD7F32' },
              ].map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.45rem', color: p.color, width: 14 }}>{p.rank}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'system-ui', fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontFamily: 'system-ui', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{p.role}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-vt323)', fontSize: '1rem', color: '#00FF88' }}>READY</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prizes teaser */}
          <div style={{ background: 'linear-gradient(135deg, rgba(193,68,14,0.15) 0%, rgba(255,107,26,0.08) 100%)', border: '1px solid rgba(193,68,14,0.4)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.45rem', color: '#FF6B1A', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>🏆 PRIZES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {['🥇 #1 — TrueFullstaq swag pack', '🥈 #2 — Cloud credit voucher', '🥉 #3 — Premium sticker kit'].map(p => (
                <div key={p} style={{ fontFamily: 'system-ui', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>{p}</div>
              ))}
            </div>
          </div>

          {/* Sponsor block */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-press-start)', fontSize: '0.38rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>POWERED BY</div>
            <div style={{ fontFamily: 'system-ui', fontWeight: 900, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>TrueFullstaq</div>
            <div style={{ fontFamily: 'system-ui', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>Cloud · DevOps · Platform Engineering</div>
          </div>
        </div>
      </div>

      {/* ── FOOTER CREDIT ── */}
      <div style={{ borderTop: '1px solid rgba(0,229,255,0.1)', textAlign: 'center', padding: '1.5rem', fontFamily: 'system-ui', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
        Cloud Arena is powered by Brand PWRD Media · Assessment platform by Kirk &amp; Blackbeard
      </div>
    </div>
  )
}
