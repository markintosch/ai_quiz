// Dynamic Open Graph card for Nordschleife lap-time shares.
// 1200x630 — LinkedIn / X / WhatsApp friendly.
//
// Params (all optional):
//   ?name=Mark           → driver name shown on the card
//   ?time=8:32.456       → lap time (already formatted)
//   ?rank=3              → leaderboard rank
//   ?correct=27          → number correct out of 30
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name    = (searchParams.get('name') ?? '').slice(0, 30)
  const time    = (searchParams.get('time') ?? '').slice(0, 16)
  const rank    = (searchParams.get('rank') ?? '').slice(0, 5)
  const correct = (searchParams.get('correct') ?? '').slice(0, 5)

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
            🌲 GREEN HELL · TIME TRIAL
          </span>
        </div>

        {/* Body */}
        {isResult ? (
          <div style={{ flex: 1, display: 'flex', padding: '48px 56px', gap: 48 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {name && (
                <p style={{ fontSize: 24, color: MUTED, margin: 0, marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {name}&apos;s lap
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
                  {rankNum === 1 ? '🟣 Track record' : `🏁 P${rank} on the leaderboard`}
                  {correct && ` · ${correct} of 30 correct`}
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
                CAN YOU BEAT IT?
              </p>
              <p style={{ fontSize: 26, lineHeight: 1.3, fontWeight: 700, margin: 0, color: WHITE }}>
                30 trivia questions, one lap of the Green Hell.
              </p>
              <p style={{ fontSize: 20, color: BODY, marginTop: 16, marginBottom: 0 }}>
                Every second you think is added to your lap time.
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
                nordschleife trivia →
              </div>
            </div>
          </div>
        ) : (
          // Generic teaser
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 56px' }}>
            <p style={{ fontSize: 22, color: GREEN, margin: 0, marginBottom: 16, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              20.832 km · 170+ corners · 1 lap
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
              <span style={{ color: GREEN }}>Green</span>
              <span style={{ color: RED }}>Hell</span>
              <span>Trivia.</span>
            </h1>
            <p style={{ fontSize: 28, color: BODY, marginTop: 24, marginBottom: 0, lineHeight: 1.4 }}>
              30 questions about the world&apos;s most legendary track. Every second counts.
            </p>
          </div>
        )}
      </div>
    ),
    SIZE,
  )
}
