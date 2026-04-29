// FILE: src/app/proserve/arena/[code]/play/page.tsx
// Proserve-themed play screen. Wraps ProserveArenaGameClient.

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import type { ArenaQuestion } from '@/products/cloud_arena/types'
import {
  NAVY, NAVY_DARK, BLUE, INK, BODY, MUTED, BORDER, LIGHT_BG, FONT,
  ProserveNav, ProserveFooter,
} from '../../../_chrome'
import ProserveArenaGameClient from '@/components/proserve/ProserveArenaGameClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cloud Arena · spel · Proserve',
  robots: { index: false, follow: false },
}

interface SessionRow {
  id:             string
  join_code:      string
  status:         string
  questions:      unknown
  time_per_q:     number
  question_count: number
  title:          string | null
}

interface PageProps {
  params:       { code: string }
  searchParams: { pid?: string }
}

export default async function ProserveArenaPlayPage({ params, searchParams }: PageProps) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()
  const pid  = searchParams.pid ?? ''

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, join_code, status, questions, time_per_q, question_count, title')
    .eq('join_code', code)
    .single() as { data: SessionRow | null }

  if (!session || session.status === 'cancelled') return notFound()

  const eventName = session.title ?? 'Cloud Arena'

  // If still in lobby, send the user back to the join/lobby page.
  if (session.status === 'lobby') {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT }}>
        <ProserveNav trail="Cloud Arena" />
        <section style={{ background: LIGHT_BG, padding: '80px 24px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '36px 32px', maxWidth: 480, textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              In de wachtkamer
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: NAVY, marginBottom: 12, letterSpacing: '-0.015em' }}>
              We wachten op de host.
            </h1>
            <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6, marginBottom: 22 }}>
              Het spel is nog niet gestart. Ga terug naar de lobby — je springt automatisch in zodra de eerste vraag verschijnt.
            </p>
            <Link href={`/proserve/arena/${code}`} style={{
              display: 'inline-block',
              background: BLUE, color: '#fff', fontWeight: 700, fontSize: 14,
              padding: '12px 28px', borderRadius: 100, textDecoration: 'none',
            }}>
              ← Terug naar de lobby
            </Link>
          </div>
        </section>
        <ProserveFooter />
      </div>
    )
  }

  const questions = session.questions as unknown as ArenaQuestion[]

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
      <ProserveNav trail={`Cloud Arena · ${code}`} />

      {/* Compact event header */}
      <section style={{ background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 100%)`, color: '#fff', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
              Live spel
            </p>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
              {eventName}
            </p>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em', fontFamily: 'monospace' }}>
            CODE · {code}
          </p>
        </div>
      </section>

      <main style={{ flex: 1, background: LIGHT_BG, padding: '40px 24px 80px' }}>
        <ProserveArenaGameClient
          joinCode={code}
          participantId={pid}
          questions={questions}
          timePerQ={session.time_per_q}
          sessionStatus={session.status}
        />
      </main>

      <ProserveFooter />
    </div>
  )
}
