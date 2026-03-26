'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { PulseTheme } from '@/types/pulse'

// ── Design tokens ─────────────────────────────────────────────────────────────
const BLACK = '#000000'
const WHITE = '#ffffff'
const NEAR_BLACK = '#121212'
const LIGHT_GREY = '#f4f4f4'
const YELLOW = '#e3ef38'
const OLIVE = '#6f751a'
const MID_GREY = '#828282'

type ThemeWithCount = PulseTheme & { entity_count: number }

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
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        minHeight: '100vh',
        background: WHITE,
        color: NEAR_BLACK,
      }}
    >
      {/* Nav */}
      <nav
        style={{
          background: BLACK,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: '56px',
        }}
      >
        <span style={{ color: WHITE, fontWeight: 700, fontSize: '16px', letterSpacing: '0.02em' }}>
          DE MACHINE PULSE
        </span>
        <span style={{ color: MID_GREY, fontSize: '12px' }}>3voor12 · VPRO</span>
      </nav>

      {/* Hero */}
      <div
        style={{
          background: BLACK,
          width: '100%',
          padding: '80px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
        }}
      >
        <p
          style={{
            color: OLIVE,
            fontSize: '12px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: 0,
          }}
        >
          DE MACHINE
        </p>

        <h1
          style={{
            color: WHITE,
            fontWeight: 700,
            fontSize: 'clamp(32px, 5vw, 56px)',
            lineHeight: '1.2',
            margin: 0,
            maxWidth: '800px',
          }}
        >
          Wat vinden De Machine-luisteraars écht?
        </h1>

        <p
          style={{
            color: MID_GREY,
            fontSize: '18px',
            lineHeight: '1.5',
            margin: 0,
            maxWidth: '560px',
          }}
        >
          Beoordeel festivals, events en artiesten op meerdere dimensies. Vergelijk jouw oordeel met dat van andere luisteraars.
        </p>
      </div>

      {/* Theme cards */}
      <div style={{ background: WHITE, padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
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

  return (
    <div
      style={{
        background: LIGHT_GREY,
        borderRadius: 0,
        padding: '32px',
        borderBottom: hovered ? `2px solid ${YELLOW}` : '2px solid transparent',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h2 style={{ fontWeight: 700, fontSize: '20px', color: NEAR_BLACK, margin: '0 0 12px', lineHeight: '1.2' }}>
        {theme.title}
      </h2>
      {theme.description && (
        <p style={{ color: '#616162', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px' }}>
          {theme.description}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span
          style={{
            background: '#000',
            color: YELLOW,
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 10px',
            letterSpacing: '0.04em',
          }}
        >
          {theme.entity_count} {theme.entity_count === 1 ? 'item' : 'items'}
        </span>
        <Link
          href={`/pulse/${theme.slug}`}
          style={{
            background: hovered ? OLIVE : YELLOW,
            color: hovered ? WHITE : NEAR_BLACK,
            border: `1px solid ${hovered ? OLIVE : YELLOW}`,
            borderRadius: 0,
            padding: '10px 20px',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
        >
          Doe mee →
        </Link>
      </div>
    </div>
  )
}
