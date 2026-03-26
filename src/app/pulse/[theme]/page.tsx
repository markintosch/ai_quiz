'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { PulseTheme, PulseEntity, PulseDimension } from '@/types/pulse'
import { getPulsePhase } from '@/types/pulse'
import Countdown from '@/components/pulse/Countdown'
import EntityCard from '@/components/pulse/EntityCard'

// ── Design tokens ─────────────────────────────────────────────────────────────
const BLACK = '#000000'
const WHITE = '#ffffff'
const NEAR_BLACK = '#121212'
const LIGHT_GREY = '#f4f4f4'
const YELLOW = '#e3ef38'
const OLIVE = '#6f751a'
const SUBTLE = '#616162'
const MID_GREY = '#828282'

// ── Shared CSS ────────────────────────────────────────────────────────────────
const SHARED_CSS = `
  .p-nav-inner {
    max-width: 1440px; margin: 0 auto; width: 100%;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px;
  }
  .p-hero {
    background: #000; width: 100%; padding: 64px 0;
  }
  .p-hero-inner {
    max-width: 1440px; margin: 0 auto; padding: 0 40px;
    display: flex; flex-direction: column; gap: 32px;
  }
  .p-hero-text { flex: 1; }
  .p-hero-text h1 {
    font-size: clamp(28px, 3.5vw, 56px);
    font-weight: 700; color: #fff; line-height: 1.15;
    margin: 0 0 16px;
  }
  .p-hero-text p {
    color: #828282; font-size: 18px; line-height: 1.6; margin: 0;
  }
  .p-hero-aside {
    display: flex; flex-direction: column; gap: 16px;
  }
  .p-section {
    max-width: 1440px; margin: 0 auto; padding: 72px 40px;
  }
  .p-section-header {
    display: flex; flex-direction: column; gap: 8px;
    margin-bottom: 48px;
  }
  .p-section-header h2 {
    font-size: clamp(22px, 2.5vw, 36px); font-weight: 700;
    color: #121212; line-height: 1.2; margin: 0;
  }
  .p-section-header p {
    color: #616162; font-size: 16px; line-height: 1.6; margin: 0;
  }
  .p-entity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2px;
  }
  .p-form { display: flex; flex-direction: column; gap: 20px; }
  @media (min-width: 900px) {
    .p-hero-inner {
      flex-direction: row; align-items: center;
      justify-content: space-between; gap: 64px;
    }
    .p-hero-aside { align-items: flex-end; flex-shrink: 0; min-width: 240px; }
    .p-section-header { flex-direction: row; align-items: baseline; justify-content: space-between; }
    .p-section-header p { max-width: 560px; }
    .p-entity-grid { grid-template-columns: repeat(3, 1fr); }
    .p-form { max-width: 480px; }
  }
  @media (min-width: 1200px) {
    .p-entity-grid { grid-template-columns: repeat(4, 1fr); }
  }
`

type ThemeData = {
  theme: PulseTheme
  entities: PulseEntity[]
  dimensions: PulseDimension[]
}

function ThemePage() {
  const params = useParams()
  const themeSlug = params.theme as string

  const [data, setData] = useState<ThemeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Suggestion form state
  const [suggestion, setSuggestion] = useState('')
  const [suggestUrl, setSuggestUrl] = useState('')
  const [suggestEmail, setSuggestEmail] = useState('')
  const [suggestSubmitting, setSuggestSubmitting] = useState(false)
  const [suggestSubmitted, setSuggestSubmitted] = useState(false)
  const [suggestError, setSuggestError] = useState('')

  const [phaseRefresh, setPhaseRefresh] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/pulse/themes')
        if (!res.ok) throw new Error('Kan thema niet laden.')
        const json = (await res.json()) as { themes: (PulseTheme & { entity_count: number })[] }
        const theme = json.themes.find((t) => t.slug === themeSlug)
        if (!theme) {
          setError('Thema niet gevonden.')
          setLoading(false)
          return
        }

        const [entRes, dimRes] = await Promise.all([
          fetch(`/api/pulse/entities?themeId=${theme.id}`),
          fetch(`/api/pulse/dimensions?themeId=${theme.id}`),
        ])

        const entJson = entRes.ok ? (await entRes.json() as { entities: PulseEntity[] }) : { entities: [] }
        const dimJson = dimRes.ok ? (await dimRes.json() as { dimensions: PulseDimension[] }) : { dimensions: [] }

        setData({
          theme,
          entities: entJson.entities,
          dimensions: dimJson.dimensions ?? [],
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Er ging iets mis.')
      }
      setLoading(false)
    }
    void load()
  }, [themeSlug])

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuggestError('')
    if (!suggestion.trim() || !data) { setSuggestError('Voer een naam in.'); return }
    setSuggestSubmitting(true)
    try {
      const res = await fetch('/api/pulse/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeId: data.theme.id,
          suggestedLabel: suggestion.trim(),
          suggestedUrl: suggestUrl.trim() || undefined,
          email: suggestEmail.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        setSuggestError(d.error ?? 'Er ging iets mis.')
        setSuggestSubmitting(false)
        return
      }
      setSuggestSubmitted(true)
    } catch {
      setSuggestError('Er ging iets mis.')
    }
    setSuggestSubmitting(false)
  }

  const ff = "'Inter', system-ui, sans-serif"

  if (loading) {
    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: WHITE }}>
        <style>{SHARED_CSS}</style>
        <Nav />
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
          <p style={{ color: MID_GREY }}>Laden...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: WHITE }}>
        <style>{SHARED_CSS}</style>
        <Nav />
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
          <p style={{ color: '#c0392b' }}>{error || 'Thema niet gevonden.'}</p>
          <Link href="/pulse" style={{ color: OLIVE, textDecoration: 'underline', marginTop: '16px', display: 'inline-block' }}>
            ← Terug naar overzicht
          </Link>
        </div>
      </div>
    )
  }

  const { theme, entities, dimensions } = data
  const phase = getPulsePhase(theme)

  return (
    <div style={{ fontFamily: ff, minHeight: '100vh', background: WHITE, color: NEAR_BLACK }}>
      <style>{SHARED_CSS}</style>
      <Nav themeTitle={theme.title} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="p-hero">
        <div className="p-hero-inner">

          {/* Left: title + description */}
          <div className="p-hero-text">
            <p style={{ color: OLIVE, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 16px' }}>
              DE MACHINE · PULSE
            </p>
            <h1>{theme.title}</h1>
            {theme.description && <p>{theme.description}</p>}
          </div>

          {/* Right: countdown or phase label */}
          <div className="p-hero-aside">
            {phase === 'presub' && theme.presub_close_at && (
              <Countdown
                targetDate={new Date(theme.presub_close_at)}
                label="Suggesties sluiten over"
                onExpired={() => setPhaseRefresh((p) => p + 1)}
              />
            )}
            {phase === 'active' && theme.closes_at && (
              <Countdown
                targetDate={new Date(theme.closes_at)}
                label="Meting sluit over"
                onExpired={() => setPhaseRefresh((p) => p + 1)}
              />
            )}
            {phase === 'active' && entities.length > 0 && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: MID_GREY, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Festivals</p>
                <p style={{ color: YELLOW, fontSize: '48px', fontWeight: 700, lineHeight: 1, margin: '0 0 4px' }}>{entities.length}</p>
                <p style={{ color: MID_GREY, fontSize: '12px', margin: 0 }}>{dimensions.length} beoordelingsdimensies</p>
              </div>
            )}
            {(phase === 'teaser' || (!theme.closes_at && phase !== 'presub')) && (
              <span
                style={{
                  background: MID_GREY,
                  color: BLACK,
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '6px 14px',
                  display: 'inline-block',
                }}
              >
                Binnenkort
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Phase: Teaser ────────────────────────────────────────────────── */}
      {phase === 'teaser' && (
        <div className="p-section">
          {theme.editorial_intro && (
            <p style={{ color: SUBTLE, fontSize: '17px', lineHeight: '1.7', maxWidth: '680px', marginBottom: '24px' }}>
              {theme.editorial_intro}
            </p>
          )}
          <p style={{ color: MID_GREY, fontSize: '14px', margin: 0 }}>Binnenkort beschikbaar.</p>
        </div>
      )}

      {/* ── Phase: Pre-subscription ──────────────────────────────────────── */}
      {phase === 'presub' && (
        <div className="p-section">
          <div className="p-section-header">
            <h2>Welk festival wil jij in deze meting?</h2>
            {theme.editorial_intro && <p>{theme.editorial_intro}</p>}
          </div>

          {suggestSubmitted ? (
            <div style={{ background: LIGHT_GREY, padding: '32px', borderLeft: `4px solid ${YELLOW}`, maxWidth: '560px' }}>
              <p style={{ fontWeight: 700, fontSize: '18px', color: NEAR_BLACK, margin: '0 0 8px' }}>Bedankt.</p>
              <p style={{ color: SUBTLE, margin: 0, fontSize: '15px' }}>We laten je weten wanneer de meting opengaat.</p>
            </div>
          ) : (
            <form onSubmit={handleSuggest} className="p-form">
              <Field label="Naam festival of event">
                <input
                  type="text" placeholder="Naam..." value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)} maxLength={100}
                  style={inputStyle}
                />
              </Field>
              <Field label="Website (optioneel)">
                <input
                  type="url" placeholder="https://..." value={suggestUrl}
                  onChange={(e) => setSuggestUrl(e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label="Jouw e-mail (optioneel)">
                <input
                  type="email" placeholder="jouw@email.nl" value={suggestEmail}
                  onChange={(e) => setSuggestEmail(e.target.value)}
                  style={inputStyle}
                />
              </Field>
              {suggestError && <p style={{ color: '#c0392b', fontSize: '14px', margin: 0 }}>{suggestError}</p>}
              <button
                type="submit" disabled={suggestSubmitting}
                style={{ background: YELLOW, color: NEAR_BLACK, border: 'none', padding: '13px 28px', fontFamily: ff, fontWeight: 700, fontSize: '15px', cursor: suggestSubmitting ? 'not-allowed' : 'pointer', opacity: suggestSubmitting ? 0.7 : 1, alignSelf: 'flex-start' }}
              >
                {suggestSubmitting ? 'Even geduld...' : 'Suggestie insturen →'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── Phase: Active ────────────────────────────────────────────────── */}
      {phase === 'active' && (
        <div className="p-section">
          <div className="p-section-header">
            <h2>Kies een festival om te beoordelen</h2>
            <p>
              Selecteer een festival en beoordeel het op {dimensions.length} dimensies.
              Vergelijk jouw oordeel met dat van andere luisteraars.
            </p>
          </div>

          {entities.length === 0 ? (
            <p style={{ color: MID_GREY }}>Nog geen festivals beschikbaar.</p>
          ) : (
            <div className="p-entity-grid">
              {entities.map((entity) => (
                <EntityCard
                  key={entity.id}
                  entity={entity}
                  href={`/pulse/${themeSlug}/${entity.slug}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Phase: Closed ────────────────────────────────────────────────── */}
      {phase === 'closed' && (
        <div className="p-section">
          <div className="p-section-header">
            <h2>De meting is gesloten.</h2>
            <p>Bedankt voor je deelname. Bekijk hieronder de definitieve uitslag.</p>
          </div>

          {entities.length > 0 && (
            <div className="p-entity-grid">
              {entities.map((entity) => (
                <EntityCard
                  key={entity.id}
                  entity={entity}
                  href={`/pulse/${themeSlug}/${entity.slug}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Disclaimer ───────────────────────────────────────────────────── */}
      {theme.disclaimer_text && (
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 40px 40px' }}>
          <p style={{ color: SUBTLE, fontSize: '12px', lineHeight: '1.6' }}>{theme.disclaimer_text}</p>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ background: BLACK, padding: '32px 40px', marginTop: '40px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ color: WHITE, fontWeight: 700, fontSize: '14px', letterSpacing: '0.02em' }}>DE MACHINE PULSE</span>
          <span style={{ color: MID_GREY, fontSize: '13px' }}>Mogelijk gemaakt door VPRO 3voor12</span>
        </div>
      </footer>

      <span style={{ display: 'none' }}>{phaseRefresh}</span>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Nav({ themeTitle }: { themeTitle?: string }) {
  return (
    <nav style={{ background: BLACK, height: '56px', display: 'flex', alignItems: 'center' }}>
      <div className="p-nav-inner">
        <Link
          href="/pulse"
          style={{ color: WHITE, fontWeight: 700, fontSize: '15px', letterSpacing: '0.02em', textDecoration: 'none' }}
        >
          DE MACHINE PULSE
        </Link>
        {themeTitle && (
          <span style={{ color: MID_GREY, fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {themeTitle}
          </span>
        )}
      </div>
    </nav>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', color: NEAR_BLACK, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  border: '1px solid #424242', borderRadius: 0,
  fontSize: '15px', fontFamily: "'Inter', system-ui, sans-serif",
  outline: 'none', boxSizing: 'border-box', background: WHITE,
}

// ── Page export ────────────────────────────────────────────────────────────
export default function ThemePageWrapper() {
  return (
    <Suspense
      fallback={
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#828282' }}>Laden...</p>
        </div>
      }
    >
      <ThemePage />
    </Suspense>
  )
}
