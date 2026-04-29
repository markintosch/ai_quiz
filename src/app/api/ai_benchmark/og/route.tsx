// Dynamic Open Graph image for the AI-benchmark.
// 1200x630 — LinkedIn / X / WhatsApp friendly.
// Two modes:
//   ?id=<uuid>   → personalised result card (archetype + score + name)
//   ?type=landing → generic landing/teaser card
//   ?type=dashboard → generic dashboard card
// (no params)   → defaults to the landing card.

import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { getContent } from '@/products/ai_benchmark/data'

export const runtime = 'edge'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const INK    = '#0F172A'
const ACCENT = '#1D4ED8'
const WARM   = '#D97706'
const WHITE  = '#FFFFFF'

const SIZE = { width: 1200, height: 630 } as const

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id   = searchParams.get('id')
  const type = (searchParams.get('type') || '').toLowerCase()

  // ── Result-specific card ───────────────────────────────────────────────
  if (id) {
    let name        = ''
    let archetype   = 'pragmatist'
    let totalScore  = 0
    let role        = 'marketing'

    const { data } = await supabase
      .from('ai_benchmark_responses')
      .select('name, role, archetype, total_score')
      .eq('id', id)
      .single()
    if (data) {
      name        = (data.name as string | null) ?? ''
      archetype   = (data.archetype as string) ?? 'pragmatist'
      totalScore  = (data.total_score as number) ?? 0
      role        = (data.role as string) ?? 'marketing'
    }

    const t = getContent('nl')
    const arch = t.ARCHETYPES.find(a => a.id === archetype) ?? t.ARCHETYPES[0]
    const headline = name
      ? `${name} is een ${arch.name}.`
      : `Een ${arch.name} in marketing & sales.`

    return new ImageResponse(
      (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: INK, color: WHITE,
          padding: '60px 70px', fontFamily: 'sans-serif',
        }}>
          <BrandStrip />

          <div style={{ display: 'flex', flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 18 }}>
            <span style={{ fontSize: 120, lineHeight: 1 }}>{arch.emoji}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 28, color: WARM, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {arch.name}
              </span>
              <span style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.05, marginTop: 4 }}>
                {headline}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 96, fontWeight: 900, color: ACCENT, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {totalScore}
              </span>
              <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>
                /100 AI Fluency
              </span>
            </div>
            <span style={{
              fontSize: 18, color: 'rgba(255,255,255,0.7)', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.25)', padding: '6px 14px', borderRadius: 100,
            }}>
              {role}
            </span>
          </div>

          <div style={{ display: 'flex', flex: 1 }} />
          <FooterStrip />
        </div>
      ),
      SIZE,
    )
  }

  // ── Dashboard generic card ─────────────────────────────────────────────
  if (type === 'dashboard') {
    return new ImageResponse(
      (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: INK, color: WHITE,
          padding: '60px 70px', fontFamily: 'sans-serif',
        }}>
          <BrandStrip />
          <div style={{ display: 'flex', flex: 1 }} />

          <span style={{ fontSize: 24, color: WARM, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Wekelijks geüpdatet onderzoek
          </span>
          <span style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.025em' }}>
            State of AI in
          </span>
          <span style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.025em', color: ACCENT }}>
            marketing &amp; sales
          </span>

          <div style={{ display: 'flex', flex: 1 }} />

          <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.78)', lineHeight: 1.4, maxWidth: 900 }}>
            Tools, tijdwinst, blokkades en archetypes uit honderden marketeers en sellers in BeNeLux.
          </span>

          <div style={{ display: 'flex', flex: 1 }} />
          <FooterStrip />
        </div>
      ),
      SIZE,
    )
  }

  // ── Landing generic card (default) ─────────────────────────────────────
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        background: INK, color: WHITE,
        padding: '60px 70px', fontFamily: 'sans-serif',
      }}>
        <BrandStrip />
        <div style={{ display: 'flex', flex: 1 }} />

        <span style={{ fontSize: 24, color: WARM, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          Onafhankelijk onderzoek · door Mark de Kock
        </span>
        <span style={{ fontSize: 90, fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.025em' }}>
          Hoe gebruik jij AI in
        </span>
        <span style={{ fontSize: 90, fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.025em' }}>
          marketing &amp; sales,{' '}
          <span style={{ color: ACCENT }}>écht?</span>
        </span>

        <div style={{ display: 'flex', flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 18px', borderRadius: 100,
            background: 'rgba(217,119,6,0.18)', border: `1px solid ${WARM}66`,
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: WARM }} />
            <span style={{ fontSize: 18, color: WARM, fontWeight: 800, letterSpacing: '0.08em' }}>LIVE</span>
          </span>
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.78)' }}>
            18 vragen · ~6 minuten · persoonlijk dashboard direct na invullen
          </span>
        </div>

        <div style={{ display: 'flex', flex: 1 }} />
        <FooterStrip />
      </div>
    ),
    SIZE,
  )
}

// ── Shared chrome ────────────────────────────────────────────────────────
function BrandStrip() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>
        AI-benchmark
      </span>
      <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)' }}>
        voor marketing & sales
      </span>
    </div>
  )
}

function FooterStrip() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
      <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)' }}>
        markdekock.com/ai_benchmark
      </span>
      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
        ONAFHANKELIJK ONDERZOEK · MARK DE KOCK
      </span>
    </div>
  )
}
