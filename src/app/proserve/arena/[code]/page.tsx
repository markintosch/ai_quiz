// FILE: src/app/proserve/arena/[code]/page.tsx
// Proserve-themed arena join page. Uses the existing arena_sessions
// backend; on submit, sends the player to /arena/[code]/play (the
// existing engine). Mark creates a session via /admin/arena/new and
// shares cloud.brandpwrdmedia.nl/proserve/arena/[CODE].

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import {
  NAVY, NAVY_DARK, BLUE, BLUE_SOFT, INK, BODY, MUTED, BORDER, LIGHT_BG, FONT,
  ProserveNav, ProserveFooter,
} from '../../_chrome'
import ProserveArenaJoinClient from '@/components/proserve/ProserveArenaJoinClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cloud Arena · doe mee · Proserve',
  robots: { index: false, follow: false },
}

interface SessionRow {
  id:              string
  join_code:       string
  host_name:       string
  title:           string | null
  status:          string
  question_count:  number
  time_per_q:      number
}

export default async function ProserveArenaJoinPage({ params }: { params: { code: string } }) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, join_code, host_name, title, status, question_count, time_per_q')
    .eq('join_code', code)
    .single() as { data: SessionRow | null }

  if (!session || session.status === 'cancelled') return notFound()

  // Live participant count (just for the side banner)
  const { count: participantCount } = await supabase
    .from('arena_participants')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session.id) as unknown as { count: number | null }

  const completed = session.status === 'completed'

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT }}>
      <ProserveNav trail="Cloud Arena" />

      {/* ── Hero ── */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 100%)`,
        color: '#fff', padding: '64px 24px 56px',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: BLUE }}>
              Cloud Arena · live quiz
            </span>
            {completed
              ? <Pill text="Sessie afgerond" tone="muted" />
              : session.status === 'active'
                ? <Pill text="Live · doe direct mee" tone="active" />
                : <Pill text={`In de lobby${participantCount ? ` · ${participantCount} spelers` : ''}`} tone="lobby" />
            }
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 4.6vw, 50px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.025em', color: '#fff' }}>
            {session.title ?? 'Cloud Arena · sessie ' + code}
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, marginBottom: 0, maxWidth: 720 }}>
            10 vragen · 30 seconden per vraag. Snelheid telt mee. Wie als eerste correct antwoordt scoort het hoogst.
            Voer je naam in om mee te doen — geen account nodig.
          </p>
        </div>
      </section>

      {/* ── Join form ── */}
      <section style={{ background: LIGHT_BG, padding: '56px 24px 80px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          {completed ? (
            <CompletedNotice code={code} />
          ) : (
            <ProserveArenaJoinClient
              joinCode={session.join_code}
              hostName={session.host_name}
              title={session.title}
              questionCount={session.question_count}
              timePerQ={session.time_per_q}
              initialStatus={session.status}
            />
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Tijdens het spel
          </h2>
          <p style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 24, letterSpacing: '-0.015em' }}>
            Wat je kunt verwachten.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <Card title="Snelheid telt"
                  body="Hoe sneller je correct antwoordt, hoe meer punten. Een verkeerd antwoord kost geen punten — een gemist antwoord wel." />
            <Card title="Live leaderboard"
                  body="Tussen de vragen door zie je waar je staat ten opzichte van de andere spelers." />
            <Card title="Korte sessie"
                  body="Gemiddelde sessie duurt zo'n 8 minuten. Speel op je telefoon, laptop of tablet." />
          </div>
        </div>
      </section>

      <ProserveFooter />
    </div>
  )
}

function Pill({ text, tone }: { text: string; tone: 'active' | 'lobby' | 'muted' }) {
  const palette = {
    active: { bg: 'rgba(34,197,94,0.18)', fg: '#4ADE80', border: 'rgba(34,197,94,0.4)' },
    lobby:  { bg: 'rgba(31,142,255,0.18)', fg: BLUE,    border: 'rgba(31,142,255,0.4)' },
    muted:  { bg: 'rgba(255,255,255,0.08)', fg: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.2)' },
  }[tone]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
      padding: '5px 12px', borderRadius: 100,
      background: palette.bg, color: palette.fg, border: `1px solid ${palette.border}`,
    }}>
      {tone !== 'muted' && (
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: palette.fg }} />
      )}
      {text}
    </span>
  )
}

function CompletedNotice({ code }: { code: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '36px 32px', maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
        Sessie afgerond
      </p>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: NAVY, marginBottom: 12 }}>
        Deze ronde is gespeeld.
      </h2>
      <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6, marginBottom: 22 }}>
        Geen probleem. Vraag Mark of Proserve recruitment om de volgende sessie-code, of bekijk de eindstand hieronder.
      </p>
      <a
        href={`/proserve/arena/${code}/results`}
        style={{
          display: 'inline-block',
          background: BLUE, color: '#fff', fontWeight: 700, fontSize: 14,
          padding: '12px 28px', borderRadius: 100, textDecoration: 'none',
        }}
      >
        Bekijk de eindstand →
      </a>
    </div>
  )
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: LIGHT_BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px' }}>
      <p style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: BODY, lineHeight: 1.55 }}>{body}</p>
      {/* unused */}
      <span style={{ display: 'none' }}>{BLUE_SOFT}</span>
    </div>
  )
}
