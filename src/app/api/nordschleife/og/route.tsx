// Dynamic Open Graph card for Nordschleife lap-time shares.
// 1200x630 — LinkedIn / X / WhatsApp friendly.
//
// Params (all optional):
//   ?name=Mark           → driver name shown on the card
//   ?time=8:32.456       → lap time (already formatted)
//   ?rank=3              → leaderboard rank
//   ?correct=27          → number correct out of 30
//   ?lang=en|de|nl|fr|es → language of card labels
//
// No params → generic teaser card.

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const BG     = '#0B1A0E'
const CARD   = '#142318'
const BORDER = '#1E3320'
const GREEN  = '#45A85F'
const DEEP   = '#2D7A3E'
const RED    = '#C8102E'
const GOLD   = '#F5C518'
const PURPLE = '#B026FF'
const WHITE  = '#FFFFFF'
const MUTED  = '#7A8E7E'
const BODY   = '#C5D5C8'

const SIZE = { width: 1200, height: 630 } as const

type Lang = 'en' | 'de' | 'nl' | 'fr' | 'es'
const LANGS: Lang[] = ['en', 'de', 'nl', 'fr', 'es']

// Compact translation table local to the edge runtime — keeps the OG bundle small.
const L = {
  lap_of:       { en: "'s lap",       de: ' – Runde',    nl: ' – ronde',    fr: ' – tour',     es: ' – vuelta' },
  record:       { en: '🟣 Track record', de: '🟣 Streckenrekord', nl: '🟣 Baanrecord', fr: '🟣 Record du tour', es: '🟣 Récord de pista' },
  pos:          { en: '🏁 P{n} on the leaderboard', de: '🏁 P{n} in der Bestenliste', nl: '🏁 P{n} in het klassement', fr: '🏁 P{n} au classement', es: '🏁 P{n} en la clasificación' },
  of_30:        { en: 'of 30 correct',  de: 'von 30 richtig', nl: 'van 30 goed', fr: 'sur 30 bonnes', es: 'de 30 correctas' },
  hero_kicker:  { en: '20.832 km · 170+ corners · 1 lap', de: '20,832 km · 170+ Kurven · 1 Runde', nl: '20,832 km · 170+ bochten · 1 ronde', fr: '20,832 km · 170+ virages · 1 tour', es: '20,832 km · 170+ curvas · 1 vuelta' },
  green:        { en: 'Green', de: 'Grüne', nl: 'Groene', fr: 'Enfer', es: 'Infierno' },
  hell:         { en: 'Hell',  de: 'Hölle', nl: 'Hel',    fr: 'Vert',  es: 'Verde' },
  trivia:       { en: 'Trivia.', de: 'Trivia.', nl: 'Trivia.', fr: 'Trivia.', es: 'Trivia.' },
  teaser_body:  { en: '30 questions about the world’s most legendary track. Every second counts.', de: '30 Fragen über die legendärste Rennstrecke der Welt. Jede Sekunde zählt.', nl: '30 vragen over het meest legendarische circuit ter wereld. Elke seconde telt.', fr: '30 questions sur le circuit le plus légendaire du monde. Chaque seconde compte.', es: '30 preguntas sobre el circuito más legendario del mundo. Cada segundo cuenta.' },
  can_you_beat: { en: 'CAN YOU BEAT IT?', de: 'SCHAFFST DU DAS?', nl: 'KUN JIJ HET BETER?', fr: 'VOUS FAITES MIEUX ?', es: '¿PUEDES SUPERARLO?' },
  body_pitch:   { en: '30 trivia questions, one lap of the Green Hell.', de: '30 Trivia-Fragen, eine Runde Grüne Hölle.', nl: '30 trivia-vragen, één ronde Groene Hel.', fr: '30 questions de trivia, un tour de l’Enfer Vert.', es: '30 preguntas de trivia, una vuelta al Infierno Verde.' },
  body_addto:   { en: 'Every second you think is added to your lap time.', de: 'Jede Denksekunde wird zur Rundenzeit addiert.', nl: 'Elke seconde nadenken telt op bij je rondetijd.', fr: 'Chaque seconde de réflexion s’ajoute au temps.', es: 'Cada segundo que piensas se suma a tu vuelta.' },
  cta:          { en: 'nordschleife trivia →', de: 'nordschleife trivia →', nl: 'nordschleife trivia →', fr: 'nordschleife trivia →', es: 'nordschleife trivia →' },
  green_hell:   { en: '🌲 GREEN HELL · TIME TRIAL', de: '🌲 GRÜNE HÖLLE · ZEITFAHREN', nl: '🌲 GROENE HEL · TIME TRIAL', fr: '🌲 ENFER VERT · CONTRE-LA-MONTRE', es: '🌲 INFIERNO VERDE · CONTRARRELOJ' },
} as const

type LKey = keyof typeof L
function tt(key: LKey, lang: Lang, vars?: Record<string, string | number>): string {
  let s: string = L[key][lang] ?? L[key].en
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name    = (searchParams.get('name') ?? '').slice(0, 30)
  const time    = (searchParams.get('time') ?? '').slice(0, 16)
  const rank    = (searchParams.get('rank') ?? '').slice(0, 5)
  const correct = (searchParams.get('correct') ?? '').slice(0, 5)
  const langRaw = (searchParams.get('lang') ?? '').slice(0, 2).toLowerCase()
  const lang: Lang = (LANGS as string[]).includes(langRaw) ? (langRaw as Lang) : 'en'

  const isResult = !!time

  // Rank colour
  const rankNum = parseInt(rank, 10)
  const lapColour = rankNum === 1 ? PURPLE : rankNum && rankNum <= 3 ? GOLD : GREEN

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: WHITE,
        }}
      >
        {/* Header strip */}
        <div
          style={{
            height: 8,
            background: `linear-gradient(90deg, ${PURPLE}, ${GREEN}, ${RED})`,
          }}
        />

        {/* Top nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '32px 56px',
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${DEEP}, ${GREEN})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 900, color: WHITE }}>N</span>
            </div>
            <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
              Nordschleife
            </span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: GREEN, letterSpacing: '0.18em' }}>
            {tt('green_hell', lang)}
          </span>
        </div>

        {/* Body */}
        {isResult ? (
          <div style={{ flex: 1, display: 'flex', padding: '48px 56px', gap: 48 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {name && (
                <p style={{ fontSize: 24, color: MUTED, margin: 0, marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {name}{tt('lap_of', lang)}
                </p>
              )}
              <div
                style={{
                  fontSize: 144,
                  fontWeight: 900,
                  color: lapColour,
                  fontFamily: 'monospace',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  display: 'flex',
                }}
              >
                {time}
              </div>
              {rank && (
                <p style={{ fontSize: 28, color: BODY, marginTop: 24, marginBottom: 0 }}>
                  {rankNum === 1 ? tt('record', lang) : tt('pos', lang, { n: rank })}
                  {correct && ` · ${correct} ${tt('of_30', lang)}`}
                </p>
              )}
            </div>
            <div
              style={{
                width: 340,
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 24,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 800, color: MUTED, letterSpacing: '0.12em', margin: 0, marginBottom: 24 }}>
                {tt('can_you_beat', lang)}
              </p>
              <p style={{ fontSize: 26, lineHeight: 1.3, fontWeight: 700, margin: 0, color: WHITE }}>
                {tt('body_pitch', lang)}
              </p>
              <p style={{ fontSize: 20, color: BODY, marginTop: 16, marginBottom: 0 }}>
                {tt('body_addto', lang)}
              </p>
              <div
                style={{
                  marginTop: 32,
                  padding: '16px 24px',
                  background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`,
                  borderRadius: 12,
                  fontSize: 22,
                  fontWeight: 900,
                  color: WHITE,
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {tt('cta', lang)}
              </div>
            </div>
          </div>
        ) : (
          // Generic teaser
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px' }}>
            <p style={{ fontSize: 22, color: GREEN, margin: 0, marginBottom: 16, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {tt('hero_kicker', lang)}
            </p>
            <h1
              style={{
                fontSize: 120,
                fontWeight: 900,
                margin: 0,
                lineHeight: 0.95,
                letterSpacing: '-0.04em',
                display: 'flex',
                gap: 24,
              }}
            >
              <span style={{ color: GREEN }}>{tt('green', lang)}</span>
              <span style={{ color: RED }}>{tt('hell', lang)}</span>
              <span>{tt('trivia', lang)}</span>
            </h1>
            <p style={{ fontSize: 28, color: BODY, marginTop: 24, marginBottom: 0, lineHeight: 1.4 }}>
              {tt('teaser_body', lang)}
            </p>
          </div>
        )}
      </div>
    ),
    SIZE,
  )
}
