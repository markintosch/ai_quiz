// FILE: src/app/proserve/arena/[code]/results/page.tsx
// Proserve-themed end-of-game results: leaderboard + the player's own
// rank highlighted. Reads the same arena_participants data as the
// existing TFS-themed page.

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import {
  NAVY, NAVY_DARK, BLUE, BLUE_SOFT, INK, BODY, MUTED, BORDER, LIGHT_BG, FONT,
  ProserveNav, ProserveFooter,
} from '../../../_chrome'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cloud Arena · eindstand · Proserve',
  robots: { index: false, follow: false },
}

interface SessionRow {
  id:             string
  join_code:      string
  host_name:      string
  title:          string | null
  question_count: number
  status:         string
}

interface ParticipantRow {
  id:               string
  display_name:     string
  email:            string | null
  score:            number
  attempt_number:   number
}

interface PageProps {
  params:       { code: string }
  searchParams: { pid?: string }
}

export default async function ProserveArenaResultsPage({ params, searchParams }: PageProps) {
  const supabase = createServiceClient()
  const code = params.code.toUpperCase()
  const myPid = searchParams.pid ?? ''

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('id, join_code, host_name, title, question_count, status')
    .eq('join_code', code)
    .single() as { data: SessionRow | null }

  if (!session) return notFound()

  const { data: participants } = await supabase
    .from('arena_participants')
    .select('id, display_name, email, score, attempt_number')
    .eq('session_id', session.id)
    .order('score', { ascending: false }) as { data: ParticipantRow[] | null }

  const me = (participants ?? []).find(p => p.id === myPid)
  const myKey = me ? (me.email?.trim().toLowerCase() || me.display_name) : null

  // Deduplicate by player → keep best score
  const map = new Map<string, { display_name: string; best_score: number; attempts: number; isMe: boolean }>()
  for (const p of (participants ?? [])) {
    const key = p.email?.trim().toLowerCase() || p.display_name
    const existing = map.get(key)
    const isMe = key === myKey
    if (!existing || p.score > existing.best_score) {
      map.set(key, {
        display_name: p.display_name,
        best_score:   p.score,
        attempts:     (existing?.attempts ?? 0) + 1,
        isMe,
      })
    } else {
      existing.attempts += 1
      if (isMe) existing.isMe = true
    }
  }

  const leaderboard = Array.from(map.values())
    .sort((a, b) => b.best_score - a.best_score)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))

  const myEntry = leaderboard.find(e => e.isMe)
  const myRank  = myEntry?.rank ?? null
  const top     = leaderboard[0]

  const eventName = session.title ?? 'Cloud Arena'

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
      <ProserveNav trail="Cloud Arena · eindstand" />

      {/* ── Hero ── */}
      <section style={{ background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 100%)`, color: '#fff', padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Eindstand · {eventName}
          </p>

          {myEntry ? (
            <h1 style={{ fontSize: 'clamp(32px, 4.6vw, 50px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.025em', color: '#fff', marginBottom: 14 }}>
              {myRank === 1
                ? <>Je staat <span style={{ color: BLUE }}>op #1</span>. Sterk gespeeld.</>
                : <>Je eindigde op <span style={{ color: BLUE }}>plaats #{myRank}</span> van {leaderboard.length}.</>
              }
            </h1>
          ) : (
            <h1 style={{ fontSize: 'clamp(32px, 4.6vw, 50px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.025em', color: '#fff', marginBottom: 14 }}>
              De eindstand is binnen.
            </h1>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, flexWrap: 'wrap' }}>
            {myEntry && (
              <Stat label="Jouw score"  value={myEntry.best_score.toLocaleString('nl-NL')} sub="punten" />
            )}
            {top && (
              <Stat label="Topscore" value={top.best_score.toLocaleString('nl-NL')} sub={`door ${top.display_name}`} />
            )}
            <Stat label="Spelers" value={leaderboard.length.toString()} sub={`${session.question_count} vragen`} />
          </div>
        </div>
      </section>

      {/* ── Leaderboard ── */}
      <section style={{ background: LIGHT_BG, padding: '56px 24px', flex: 1 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Top spelers
          </h2>
          <p style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 20, letterSpacing: '-0.015em' }}>
            Wie scoorde het hoogst.
          </p>

          {leaderboard.length === 0 ? (
            <div style={{ background: '#fff', border: `1px dashed ${BORDER}`, borderRadius: 12, padding: '32px 24px', textAlign: 'center', fontSize: 14, color: MUTED }}>
              Geen spelers in deze sessie nog.
            </div>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.slice(0, 25).map(p => (
                <li key={p.rank} style={{
                  background: p.isMe ? BLUE_SOFT : '#fff',
                  border: `1.5px solid ${p.isMe ? BLUE : BORDER}`,
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background:
                      p.rank === 1 ? '#FEF3C7' :
                      p.rank === 2 ? '#F1F5F9' :
                      p.rank === 3 ? '#FED7AA' :
                      LIGHT_BG,
                    color:
                      p.rank === 1 ? '#854D0E' :
                      p.rank === 2 ? '#475569' :
                      p.rank === 3 ? '#9A3412' : MUTED,
                    fontSize: 14, fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {p.rank}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: INK }}>
                      {p.display_name}
                      {p.isMe && (
                        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          · jij
                        </span>
                      )}
                    </p>
                    {p.attempts > 1 && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: MUTED }}>
                        Beste van {p.attempts} pogingen
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: p.isMe ? BLUE : NAVY, fontVariantNumeric: 'tabular-nums' }}>
                    {p.best_score.toLocaleString('nl-NL')}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#fff', padding: '56px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 14, letterSpacing: '-0.015em' }}>
            Werken bij Proserve?
          </h2>
          <p style={{ fontSize: 15, color: BODY, lineHeight: 1.6, marginBottom: 22 }}>
            Je hebt cloud-skill — wij zijn altijd op zoek naar talent dat hetzelfde laat zien. Een gesprek is een mailtje verder.
          </p>
          <a
            href="https://www.proserve.nl/over-ons/werken-bij-proserve"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: BLUE, color: '#fff', fontWeight: 700, fontSize: 15,
              padding: '13px 30px', borderRadius: 100, textDecoration: 'none',
            }}
          >
            Bekijk vacatures bij Proserve →
          </a>
          <p style={{ marginTop: 18, fontSize: 12, color: MUTED }}>
            <Link href={`/proserve/arena/${code}`} style={{ color: MUTED, textDecoration: 'underline' }}>
              ← Terug naar de sessielobby
            </Link>
          </p>
        </div>
      </section>

      <ProserveFooter />
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ margin: 0, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.025em' }}>{value}</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{sub}</span>
      </p>
    </div>
  )
}
