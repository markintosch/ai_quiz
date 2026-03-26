'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { PulseTheme } from '@/types/pulse'
import { getPulsePhase } from '@/types/pulse'

// ── Design tokens ─────────────────────────────────────────────────────────────
const BLACK = '#000000'
const WHITE = '#ffffff'
const NEAR_BLACK = '#121212'
const LIGHT_GREY = '#f4f4f4'
const YELLOW = '#e3ef38'
const OLIVE = '#6f751a'
const MID_GREY = '#828282'
const SUBTLE = '#616162'

type ThemeWithCount = PulseTheme & { entity_count: number }

const phaseLabel: Record<string, { label: string; color: string }> = {
  teaser:  { label: 'Binnenkort',   color: MID_GREY },
  presub:  { label: 'Suggesties',   color: OLIVE },
  active:  { label: 'Nu open',      color: YELLOW },
  closed:  { label: 'Gesloten',     color: SUBTLE },
}

export default function PulsePage() {
  const [themes, setThemes] = useState<ThemeWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/pulse/themes')
        if (res.ok) {
          const json = (await res.json()) as { themes: ThemeWithCount[] }
          setThemes(json.themes ?? [])
        }
      } catch { /* noop */ }
      setLoading(false)
    }
    void load()
  }, [])

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: WHITE, color: NEAR_BLACK }}>
      <style>{`
        .pulse-nav-inner { max-width: 1440px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
        .pulse-hero-inner { max-width: 1440px; margin: 0 auto; width: 100%; padding: 0 40px; display: flex; flex-direction: column; gap: 24px; }
        .pulse-hero-inner h1 { font-size: clamp(32px, 4vw, 64px); }
        .pulse-hero-inner p { max-width: 560px; }
        .pulse-section { max-width: 1440px; margin: 0 auto; padding: 80px 40px; }
        .pulse-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2px; }
        @media (min-width: 1024px) {
          .pulse-hero-inner { flex-direction: row; align-items: center; justify-content: space-between; gap: 48px; }
          .pulse-hero-inner p { max-width: 480px; }
          .pulse-hero-right { flex-shrink: 0; text-align: right; }
          .pulse-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1280px) {
          .pulse-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: BLACK, height: '56px', display: 'flex', alignItems: 'center' }}>
        <div className="pulse-nav-inner">
          <span style={{ color: WHITE, fontWeight: 700, fontSize: '16px', letterSpacing: '0.02em' }}>
            DE MACHINE PULSE
          </span>
          <span style={{ color: MID_GREY, fontSize: '12px' }}>3voor12 · VPRO</span>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: BLACK, width: '100%', padding: '80px 0' }}>
        <div className="pulse-hero-inner">
          {/* Left: text */}
          <div style={{ flex: 1 }}>
            <p style={{ color: OLIVE, fontSize: '12px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px' }}>
              DE MACHINE
            </p>
            <h1 style={{ color: WHITE, fontWeight: 700, lineHeight: '1.15', margin: '0 0 20px' }}>
              Wat vinden De Machine-luisteraars écht?
            </h1>
            <p style={{ color: MID_GREY, fontSize: '18px', lineHeight: '1.6', margin: 0 }}>
              Beoordeel festivals, events en artiesten op meerdere dimensies. Vergelijk jouw oordeel met dat van andere luisteraars.
            </p>
          </div>

          {/* Right: stat / CTA block */}
          <div className="pulse-hero-right" style={{ color: WHITE }}>
            <p style={{ color: MID_GREY, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
              Actieve metingen
            </p>
            <p style={{ fontSize: 'clamp(48px, 6vw, 80px)', fontWeight: 700, lineHeight: 1, color: YELLOW, margin: '0 0 16px' }}>
              {loading ? '–' : themes.filter(t => getPulsePhase(t) === 'active').length}
            </p>
            <p style={{ color: MID_GREY, fontSize: '13px', margin: 0 }}>
              {themes.length} {themes.length === 1 ? 'thema' : 'thema\'s'} beschikbaar
            </p>
          </div>
        </div>
      </div>

      {/* Theme cards */}
      <div style={{ background: WHITE }}>
        <div className="pulse-section">
          {loading && (
            <p style={{ color: MID_GREY, textAlign: 'center' }}>Laden...</p>
          )}

          {!loading && themes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: MID_GREY, fontSize: '16px' }}>
                Nog geen actieve metingen. Kom binnenkort terug.
              </p>
            </div>
          )}

          {themes.length > 0 && (
            <div className="pulse-grid">
              {themes.map((theme) => (
                <ThemeCard key={theme.id} theme={theme} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: BLACK, padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ color: MID_GREY, fontSize: '13px', margin: 0 }}>
          De Machine Pulse wordt mogelijk gemaakt door VPRO 3voor12
        </p>
      </footer>
    </div>
  )
}

function ThemeCard({ theme }: { theme: ThemeWithCount }) {
  const [hovered, setHovered] = useState(false)
  const phase = getPulsePhase(theme)
  const pl = phaseLabel[phase] ?? phaseLabel.teaser

  return (
    <div
      style={{
        background: LIGHT_GREY,
        padding: '32px',
        borderBottom: hovered ? `3px solid ${YELLOW}` : '3px solid transparent',
        transition: 'border-color 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '200px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Phase badge */}
      <span
        style={{
          display: 'inline-block',
          alignSelf: 'flex-start',
          background: phase === 'active' ? YELLOW : BLACK,
          color: phase === 'active' ? NEAR_BLACK : pl.color,
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '3px 10px',
        }}
      >
        {pl.label}
      </span>

      <div style={{ flex: 1 }}>
        <h2 style={{ fontWeight: 700, fontSize: '20px', color: NEAR_BLACK, margin: '0 0 8px', lineHeight: '1.2' }}>
          {theme.title}
        </h2>
        {theme.description && (
          <p style={{ color: SUBTLE, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            {theme.description}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ color: MID_GREY, fontSize: '12px' }}>
          {theme.entity_count} {theme.entity_count === 1 ? 'item' : 'items'}
        </span>
        <Link
          href={`/pulse/${theme.slug}`}
          style={{
            background: hovered ? OLIVE : YELLOW,
            color: hovered ? WHITE : NEAR_BLACK,
            border: 'none',
            padding: '10px 20px',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'background 0.15s, color 0.15s',
            display: 'inline-block',
          }}
        >
          Bekijk →
        </Link>
      </div>
    </div>
  )
}
