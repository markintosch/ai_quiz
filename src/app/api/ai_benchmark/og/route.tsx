// Dynamic Open Graph image for shared AI-benchmark results.
// 1200x630 — LinkedIn / X / WhatsApp friendly.
// Pulls archetype + score from Supabase by ?id=...

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  let name        = ''
  let archetype   = 'pragmatist'
  let totalScore  = 0
  let role        = 'marketing'

  if (id) {
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
  }

  const t = getContent('nl')
  const arch = t.ARCHETYPES.find(a => a.id === archetype) ?? t.ARCHETYPES[0]

  const headline = name
    ? `${name} is een ${arch.name}.`
    : `Een ${arch.name} in marketing & sales.`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: INK, color: WHITE,
          padding: '60px 70px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top brand strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>
            AI-benchmark
          </span>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)' }}>
            voor marketing &amp; sales
          </span>
        </div>

        {/* Spacer */}
        <div style={{ display: 'flex', flex: 1 }} />

        {/* Big archetype + emoji */}
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

        {/* Score row + role */}
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

        {/* Spacer */}
        <div style={{ display: 'flex', flex: 1 }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)' }}>
            markdekock.com/ai_benchmark
          </span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
            ONAFHANKELIJK ONDERZOEK · MARK DE KOCK
          </span>
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
    },
  )
}
