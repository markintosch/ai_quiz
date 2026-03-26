'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { PulseTheme } from '@/types/pulse'
import { getPulsePhase } from '@/types/pulse'

// ── Design tokens ─────────────────────────────────────────────────────────────
const BLACK = '#000000'
const WHITE = '#ffffff'
const NEAR_BLACK = '#121212'
const YELLOW = '#e3ef38'
const OLIVE = '#6f751a'
const MID_GREY = '#828282'
const SUBTLE = '#616162'

type ThemeWithCount = PulseTheme & { entity_count: number }

// ── CSS ────────────────────────────────────────────────────────────────────────
const PAGE_CSS = `
  * { box-sizing: border-box; }
  .ph-nav-inner {
    max-width: 1440px; margin: 0 auto; width: 100%;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px;
  }
  .ph-hero-inner {
    max-width: 1440px; margin: 0 auto; width: 100%;
    padding: 80px 40px;
    display: flex; flex-direction: column; gap: 40px;
  }
  .ph-hero-left { flex: 1; }
  .ph-hero-right { display: none; }
  .ph-featured-inner {
    max-width: 1440px; margin: 0 auto; width: 100%;
    padding: 0 40px 80px;
    display: flex; flex-direction: column; gap: 48px;
  }
  .ph-featured-left { flex: 1; }
  .ph-featured-right { display: none; }
  .ph-how-grid {
    display: flex; flex-direction: column; gap: 0;
  }
  .ph-how-col {
    border-left: 3px solid ${NEAR_BLACK};
    padding: 32px 28px;
    border-bottom: 1px solid #e2e2e2;
  }
  .ph-how-col:last-child { border-bottom: none; }
  .ph-themes-list {
    display: flex; flex-direction: column; gap: 0;
  }
  .ph-footer-inner {
    max-width: 1440px; margin: 0 auto; width: 100%;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; flex-wrap: wrap; gap: 12px;
  }
  @media (min-width: 900px) {
    .ph-hero-inner { flex-direction: row; align-items: flex-start; justify-content: space-between; gap: 64px; }
    .ph-hero-left { max-width: 65%; }
    .ph-hero-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; min-width: 200px; }
    .ph-featured-inner { flex-direction: row; align-items: flex-start; justify-content: space-between; }
    .ph-featured-left { max-width: 60%; }
    .ph-featured-right { display: flex; flex-direction: column; align-items: flex-end; gap: 16px; min-width: 35%; }
    .ph-how-grid { flex-direction: row; }
    .ph-how-col { flex: 1; border-bottom: none; border-right: 1px solid #e2e2e2; }
    .ph-how-col:last-child { border-right: none; }
    .ph-themes-list { flex-direction: row; flex-wrap: wrap; }
  }
`

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

  const activeThemes = themes.filter((t) => {
    const p = getPulsePhase(t)
    return p === 'active' || p === 'presub'
  })
  const featuredTheme = activeThemes[0] ?? null
  const otherThemes = themes.filter((t) => t !== featuredTheme)
  const activeCount = themes.filter((t) => getPulsePhase(t) === 'active').length

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: WHITE, color: NEAR_BLACK }}>
      <style>{PAGE_CSS}</style>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav style={{ background: BLACK, height: '56px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="ph-nav-inner">
          <span style={{ color: WHITE, fontWeight: 700, fontSize: '15px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            De Machine Pulse
          </span>
          <span style={{ color: MID_GREY, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            3voor12 · VPRO
          </span>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ background: BLACK, width: '100%' }}>
        <div className="ph-hero-inner">
          {/* Left */}
          <div className="ph-hero-left">
            <p style={{
              color: OLIVE,
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              margin: '0 0 24px',
            }}>
              DE MACHINE
            </p>
            <h1 style={{
              color: WHITE,
              fontWeight: 700,
              fontSize: 'clamp(40px, 5.5vw, 80px)',
              lineHeight: 1.05,
              margin: '0 0 28px',
              letterSpacing: '-0.01em',
            }}>
              Wat vinden luisteraars écht van de Nederlandse muziekcultuur?
            </h1>
            <p style={{
              color: '#999999',
              fontSize: '18px',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '520px',
            }}>
              Stem, vergelijk en volg de collectieve uitslag.
            </p>
          </div>

          {/* Right — desktop only */}
          <div className="ph-hero-right">
            <p style={{
              color: MID_GREY,
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              margin: 0,
            }}>
              ACTIEVE METINGEN
            </p>
            <p style={{
              color: YELLOW,
              fontSize: 'clamp(64px, 8vw, 96px)',
              fontWeight: 700,
              lineHeight: 1,
              margin: '4px 0 8px',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {loading ? '–' : activeCount}
            </p>
            <p style={{ color: MID_GREY, fontSize: '12px', margin: 0 }}>
              {loading ? '–' : themes.length} {themes.length === 1 ? "thema" : "thema's"} beschikbaar
            </p>
          </div>
        </div>
      </div>

      {/* ── Featured Active Theme ──────────────────────────────────────────── */}
      {!loading && featuredTheme && (() => {
        const phase = getPulsePhase(featuredTheme)
        const statusLabel = phase === 'active' ? 'NU ACTIEF' : 'SUGGESTIES OPEN'
        const closingDate = phase === 'active' && featuredTheme.closes_at
          ? new Date(featuredTheme.closes_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
          : phase === 'presub' && featuredTheme.presub_close_at
          ? new Date(featuredTheme.presub_close_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
          : null
        return (
          <div style={{ background: BLACK, borderTop: '1px solid #1a1a1a' }}>
            <div className="ph-featured-inner">
              {/* Left */}
              <div className="ph-featured-left">
                <span style={{
                  display: 'inline-block',
                  background: 'transparent',
                  border: `1px solid ${YELLOW}`,
                  color: YELLOW,
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '4px 10px',
                  marginBottom: '24px',
                }}>
                  {statusLabel}
                </span>

                <h2 style={{
                  color: WHITE,
                  fontWeight: 700,
                  fontSize: 'clamp(28px, 4vw, 52px)',
                  lineHeight: 1.1,
                  margin: '0 0 20px',
                  letterSpacing: '-0.01em',
                }}>
                  {featuredTheme.title}
                </h2>

                {featuredTheme.description && (
                  <p style={{
                    color: '#aaaaaa',
                    fontSize: '16px',
                    lineHeight: 1.65,
                    margin: '0 0 20px',
                    maxWidth: '480px',
                  }}>
                    {featuredTheme.description}
                  </p>
                )}

                <p style={{
                  color: MID_GREY,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 8px',
                }}>
                  {featuredTheme.entity_count}{' '}
                  {featuredTheme.entity_count === 1 ? 'item' : 'items'} in deze meting
                </p>

                {closingDate && (
                  <p style={{
                    color: SUBTLE,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    margin: '0 0 32px',
                  }}>
                    {phase === 'active' ? 'Sluit op' : 'Suggesties sluiten'} {closingDate}
                  </p>
                )}
                {!closingDate && <div style={{ marginBottom: '32px' }} />}

                <Link
                  href={`/pulse/${featuredTheme.slug}`}
                  style={{
                    display: 'inline-block',
                    background: YELLOW,
                    color: NEAR_BLACK,
                    fontWeight: 700,
                    fontSize: '15px',
                    padding: '14px 32px',
                    textDecoration: 'none',
                    letterSpacing: '0.01em',
                  }}
                >
                  Doe mee →
                </Link>
              </div>

              {/* Right — typographic stat block */}
              <div className="ph-featured-right">
                <p style={{
                  color: SUBTLE,
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  margin: 0,
                }}>
                  Beoordeel nu
                </p>
                <p style={{
                  color: YELLOW,
                  fontWeight: 700,
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  lineHeight: 1.1,
                  margin: '12px 0 0',
                  textAlign: 'right',
                  maxWidth: '320px',
                }}>
                  {featuredTheme.title}
                </p>
                {featuredTheme.entity_count === 0 && (
                  <p style={{
                    color: SUBTLE,
                    fontSize: '13px',
                    margin: '16px 0 0',
                    textAlign: 'right',
                  }}>
                    Items binnenkort beschikbaar
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <div style={{ background: WHITE, borderTop: '4px solid #e2e2e2' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '72px 40px' }}>
          <p style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: SUBTLE,
            margin: '0 0 40px',
          }}>
            Hoe het werkt
          </p>
          <div className="ph-how-grid">
            {[
              { n: '01', label: 'BEOORDEEL', desc: 'Beoordeel een festival op meerdere dimensies.' },
              { n: '02', label: 'VERGELIJK', desc: 'Zie hoe jij afwijkt van andere luisteraars.' },
              { n: '03', label: 'VOLG', desc: 'Ontvang de definitieve uitslag als de meting sluit.' },
            ].map(({ n, label, desc }) => (
              <div key={n} className="ph-how-col">
                <p style={{
                  color: YELLOW,
                  fontWeight: 700,
                  fontSize: '48px',
                  lineHeight: 1,
                  margin: '0 0 16px',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {n}
                </p>
                <p style={{
                  color: NEAR_BLACK,
                  fontWeight: 700,
                  fontSize: '16px',
                  margin: '0 0 8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  {label}
                </p>
                <p style={{ color: SUBTLE, fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Other themes listing ───────────────────────────────────────────── */}
      {!loading && otherThemes.length > 0 && (
        <div style={{ background: '#f4f4f4', borderTop: '1px solid #e2e2e2' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '72px 40px' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: SUBTLE,
              margin: '0 0 32px',
            }}>
              Alle metingen
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {otherThemes.map((theme) => {
                const phase = getPulsePhase(theme)
                const phaseColors: Record<string, string> = {
                  active: YELLOW,
                  presub: OLIVE,
                  teaser: MID_GREY,
                  closed: SUBTLE,
                }
                const phaseLabels: Record<string, string> = {
                  active: 'Nu open',
                  presub: 'Suggesties',
                  teaser: 'Binnenkort',
                  closed: 'Gesloten',
                }
                return (
                  <ThemeListRow key={theme.id} theme={theme} phase={phase} phaseColor={phaseColors[phase] ?? MID_GREY} phaseLabel={phaseLabels[phase] ?? phase} />
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!loading && themes.length === 0 && (
        <div style={{ background: WHITE, padding: '120px 40px', textAlign: 'center' }}>
          <p style={{ color: MID_GREY, fontSize: '16px' }}>
            Nog geen actieve metingen. Kom binnenkort terug.
          </p>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ background: BLACK, padding: '40px 0' }}>
        <div className="ph-footer-inner">
          <span style={{ color: WHITE, fontWeight: 700, fontSize: '14px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            DE MACHINE PULSE
          </span>
          <span style={{ color: MID_GREY, fontSize: '12px' }}>
            Mogelijk gemaakt door VPRO 3voor12
          </span>
        </div>
      </footer>
    </div>
  )
}

// ── Theme list row ─────────────────────────────────────────────────────────────
function ThemeListRow({
  theme,
  phase,
  phaseColor,
  phaseLabel,
}: {
  theme: ThemeWithCount
  phase: string
  phaseColor: string
  phaseLabel: string
}) {
  const [hovered, setHovered] = useState(false)
  const isClickable = phase !== 'teaser'

  const inner = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        padding: '24px 0',
        borderBottom: '1px solid #e2e2e2',
        borderLeft: hovered && isClickable ? `3px solid ${YELLOW}` : '3px solid transparent',
        paddingLeft: '20px',
        transition: 'border-color 0.12s',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: phaseColor,
          }}>
            {phaseLabel}
          </span>
        </div>
        <p style={{ fontWeight: 700, fontSize: '18px', color: NEAR_BLACK, margin: 0, lineHeight: 1.2 }}>
          {theme.title}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
        <span style={{ color: MID_GREY, fontSize: '12px' }}>
          {theme.entity_count} {theme.entity_count === 1 ? 'item' : 'items'}
        </span>
        {isClickable && (
          <span style={{ color: NEAR_BLACK, fontWeight: 700, fontSize: '18px' }}>→</span>
        )}
      </div>
    </div>
  )

  if (isClickable) {
    return (
      <Link
        href={`/pulse/${theme.slug}`}
        style={{ textDecoration: 'none', display: 'block' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {inner}
      </Link>
    )
  }

  return <div>{inner}</div>
}
