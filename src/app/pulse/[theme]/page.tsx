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

type ThemeData = {
  theme: PulseTheme
  entities: PulseEntity[]
  dimensions: PulseDimension[]
}

function PulseNav({ themeTitle }: { themeTitle?: string }) {
  return (
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
      <Link
        href="/pulse"
        style={{
          color: WHITE,
          fontWeight: 700,
          fontSize: '16px',
          letterSpacing: '0.02em',
          textDecoration: 'none',
        }}
      >
        DE MACHINE PULSE
      </Link>
      {themeTitle && (
        <span style={{ color: MID_GREY, fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {themeTitle}
        </span>
      )}
    </nav>
  )
}

function ThemePageContent() {
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

        // Load entities and dimensions for this theme
        const [entRes, dimRes] = await Promise.all([
          fetch(`/api/admin/pulse/entities?themeId=${theme.id}`),
          fetch(`/api/admin/pulse/themes/${theme.id}`),
        ])

        const entJson = entRes.ok ? (await entRes.json() as { entities: PulseEntity[] }) : { entities: [] }
        const dimJson = dimRes.ok ? (await dimRes.json() as { dimensions: PulseDimension[] }) : { dimensions: [] }

        setData({
          theme,
          entities: entJson.entities.filter((e) => e.ingest_status === 'live'),
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
    if (!suggestion.trim() || !data) {
      setSuggestError('Voer een naam in.')
      return
    }
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

  if (loading) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: WHITE }}>
        <PulseNav />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ color: MID_GREY }}>Laden...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: WHITE }}>
        <PulseNav />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ color: '#c0392b' }}>{error || 'Thema niet gevonden.'}</p>
          <Link href="/pulse" style={{ color: OLIVE, textDecoration: 'underline', marginTop: '16px', display: 'inline-block' }}>
            ← Terug
          </Link>
        </div>
      </div>
    )
  }

  const { theme, entities } = data
  const phase = getPulsePhase(theme)

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: WHITE, color: NEAR_BLACK }}>
      <PulseNav themeTitle={theme.title} />

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
        <p style={{ color: OLIVE, fontSize: '12px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          DE MACHINE
        </p>
        <h1
          style={{
            color: WHITE,
            fontWeight: 700,
            fontSize: 'clamp(28px, 4vw, 52px)',
            lineHeight: '1.2',
            margin: 0,
            maxWidth: '800px',
          }}
        >
          {theme.title}
        </h1>
        {theme.description && (
          <p style={{ color: MID_GREY, fontSize: '18px', lineHeight: '1.5', margin: 0, maxWidth: '560px' }}>
            {theme.description}
          </p>
        )}
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
      </div>

      {/* Phase: Teaser */}
      {phase === 'teaser' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          {theme.editorial_intro && (
            <p style={{ color: SUBTLE, fontSize: '16px', lineHeight: '1.6', maxWidth: '640px', margin: '0 auto 32px' }}>
              {theme.editorial_intro}
            </p>
          )}
          <p style={{ color: MID_GREY, fontSize: '14px' }}>Binnenkort beschikbaar.</p>
        </div>
      )}

      {/* Phase: Pre-subscription (suggestions) */}
      {phase === 'presub' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '28px', lineHeight: '1.2', color: NEAR_BLACK, marginBottom: '16px' }}>
            Welk festival wil jij in deze meting?
          </h2>
          {theme.editorial_intro && (
            <p style={{ color: SUBTLE, fontSize: '16px', lineHeight: '1.6', marginBottom: '40px', maxWidth: '560px' }}>
              {theme.editorial_intro}
            </p>
          )}

          {suggestSubmitted ? (
            <div style={{ background: LIGHT_GREY, padding: '32px', borderLeft: `4px solid ${YELLOW}` }}>
              <p style={{ fontWeight: 700, fontSize: '18px', color: NEAR_BLACK, margin: '0 0 8px' }}>Bedankt.</p>
              <p style={{ color: SUBTLE, margin: 0, fontSize: '15px' }}>We laten je weten wanneer de meting opengaat.</p>
            </div>
          ) : (
            <form onSubmit={handleSuggest} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: NEAR_BLACK, marginBottom: '6px' }}>
                  Naam festival of event
                </label>
                <input
                  type="text"
                  placeholder="Naam..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  maxLength={100}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #424242', borderRadius: 0, fontSize: '15px', fontFamily: "'Inter', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: NEAR_BLACK, marginBottom: '6px' }}>
                  Website (optioneel)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={suggestUrl}
                  onChange={(e) => setSuggestUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #424242', borderRadius: 0, fontSize: '15px', fontFamily: "'Inter', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: NEAR_BLACK, marginBottom: '6px' }}>
                  Jouw e-mail (optioneel)
                </label>
                <input
                  type="email"
                  placeholder="jouw@email.nl"
                  value={suggestEmail}
                  onChange={(e) => setSuggestEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #424242', borderRadius: 0, fontSize: '15px', fontFamily: "'Inter', system-ui, sans-serif", outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              {suggestError && <p style={{ color: '#c0392b', fontSize: '14px', margin: 0 }}>{suggestError}</p>}
              <button
                type="submit"
                disabled={suggestSubmitting}
                style={{ background: YELLOW, color: NEAR_BLACK, border: `1px solid ${YELLOW}`, borderRadius: 0, padding: '12px 24px', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: '15px', cursor: suggestSubmitting ? 'not-allowed' : 'pointer', opacity: suggestSubmitting ? 0.7 : 1, alignSelf: 'flex-start' }}
              >
                {suggestSubmitting ? 'Even geduld...' : 'Suggestie insturen →'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Phase: Active */}
      {phase === 'active' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '28px', lineHeight: '1.2', color: NEAR_BLACK, marginBottom: '8px' }}>
            Kies een festival om te beoordelen
          </h2>
          <p style={{ color: SUBTLE, fontSize: '16px', lineHeight: '1.6', marginBottom: '40px', maxWidth: '560px' }}>
            Selecteer een festival en beoordeel het op {data.dimensions.length} dimensies. Vergelijk jouw oordeel met dat van andere luisteraars.
          </p>

          {entities.length === 0 ? (
            <p style={{ color: MID_GREY }}>Nog geen festivals beschikbaar.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
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

      {/* Phase: Closed */}
      {phase === 'closed' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontWeight: 700, fontSize: '28px', color: NEAR_BLACK, marginBottom: '16px' }}>
            De meting is gesloten.
          </h2>
          <p style={{ color: SUBTLE, fontSize: '16px', lineHeight: '1.6', maxWidth: '480px' }}>
            Bedankt voor je deelname. Bekijk hieronder de definitieve uitslag.
          </p>

          {entities.length > 0 && (
            <div style={{ marginTop: '48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
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

      {/* Disclaimer */}
      {theme.disclaimer_text && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 40px' }}>
          <p style={{ color: SUBTLE, fontSize: '12px', lineHeight: '1.6' }}>{theme.disclaimer_text}</p>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: BLACK, padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: MID_GREY, fontSize: '13px', margin: 0 }}>
          De Machine Pulse wordt mogelijk gemaakt door VPRO 3voor12
        </p>
      </footer>

      {/* Used to force re-render when phase changes */}
      <span style={{ display: 'none' }}>{phaseRefresh}</span>
    </div>
  )
}

export default function ThemePage() {
  return (
    <Suspense
      fallback={
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#828282' }}>Laden...</p>
        </div>
      }
    >
      <ThemePageContent />
    </Suspense>
  )
}
