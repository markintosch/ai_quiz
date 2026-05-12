// FILE: src/app/Cycle/dashboard/DashboardClient.tsx
// Drie visualisaties op één pagina, scrollable.

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts'

interface EntryRow {
  entry_date:        string
  mood_score:        number | null
  sleep:             number | null
  stress:            number | null
  alcohol_glasses:   number | null
  busy_day:          boolean | null
  symptoms:          string[] | null
}

interface BaselineRow {
  score_overall:        number
  score_sleep_recovery: number
  score_energy_capacity:number
  score_stress_context: number
}

interface Props {
  entries:  EntryRow[]
  baseline: BaselineRow | null
  range:    number
}

export default function DashboardClient({ entries, baseline, range }: Props) {
  // Heatmap-data: per dag een kleur-intensity op basis van symptomen-aantal
  const heatmap = useMemo(() => buildHeatmap(entries, range), [entries, range])

  // Trend-data: per week aggregeren — slaap, mood, stress
  const trend = useMemo(() => buildTrend(entries), [entries])

  // Co-occurrence: paar-frequentie van symptomen
  const cooccur = useMemo(() => buildCooccurrence(entries), [entries])

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: 'var(--cycle-bg, #0e0e0e)' }}>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-3">
          <h1 className="cycle-display text-3xl">Dashboard</h1>
          <div className="flex items-center gap-3 text-sm">
            {([60, 90, 180] as const).map((d) => (
              <Link
                key={d}
                href={`/Cycle/dashboard?range=${d}d`}
                style={{
                  color: d === range ? 'var(--cycle-fg, #fff)' : 'var(--cycle-muted, #888)',
                  textDecoration: d === range ? 'underline' : 'none',
                  fontWeight: d === range ? 600 : 400,
                }}
              >
                {d}d
              </Link>
            ))}
            <Link href="/Cycle/timeline" className="underline" style={{ color: 'var(--cycle-muted, #888)' }}>
              Tijdlijn
            </Link>
          </div>
        </header>

        {entries.length < 7 ? (
          <p className="text-sm" style={{ color: 'var(--cycle-muted, #888)' }}>
            Nog niet genoeg data. Minimaal 7 check-ins nodig om patronen te zien.
            Je hebt er nu {entries.length}.
          </p>
        ) : (
          <>
            {/* ── 1. Weekly heatmap ──────────────────────────── */}
            <section className="mb-10">
              <h2 className="cycle-display text-xl mb-1">Symptomen-kalender</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--cycle-muted, #888)' }}>
                Donkerder = meer symptomen die dag. Lege cel = geen check-in.
              </p>
              <div className="cycle-card p-4">
                <Heatmap data={heatmap} />
                <Legend7 />
              </div>
            </section>

            {/* ── 2. Trend vs baseline ───────────────────────── */}
            <section className="mb-10">
              <h2 className="cycle-display text-xl mb-1">Trend per week vs. nulmeting</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--cycle-muted, #888)' }}>
                Je gemiddelden per week (slaap, stemming, stress).
                {baseline && ' De stippellijnen zijn je Peri-Compass nulmeting.'}
              </p>
              <div className="cycle-card p-4" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.07)" />
                    <XAxis dataKey="weekLabel" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                    <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid #333', fontSize: 12 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {baseline && (
                      <>
                        <ReferenceLine y={baseline.score_sleep_recovery / 10} stroke="#60a5fa" strokeDasharray="3 3" label={{ value: 'Slaap nulmeting', position: 'left', fill: '#60a5fa', fontSize: 10 }} />
                        <ReferenceLine y={baseline.score_stress_context / 10} stroke="#fbbf24" strokeDasharray="3 3" />
                      </>
                    )}
                    <Line type="monotone" dataKey="sleep"  stroke="#60a5fa" name="Slaap"   dot={{ r: 3 }} strokeWidth={2} />
                    <Line type="monotone" dataKey="mood"   stroke="#34d399" name="Stemming" dot={{ r: 3 }} strokeWidth={2} />
                    <Line type="monotone" dataKey="stress" stroke="#fbbf24" name="Stress"   dot={{ r: 3 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* ── 3. Co-occurrence ───────────────────────────── */}
            <section className="mb-10">
              <h2 className="cycle-display text-xl mb-1">Symptomen die samen voorkomen</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--cycle-muted, #888)' }}>
                Wanneer je symptoom A had, hoe vaak had je dezelfde dag ook symptoom B?
              </p>
              <div className="cycle-card p-4">
                {cooccur.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--cycle-muted, #888)' }}>
                    Nog niet genoeg overlappende symptomen om patronen te zien.
                  </p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {cooccur.slice(0, 8).map((c, i) => (
                      <li key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        fontSize: 14,
                      }}>
                        <span>
                          <strong>{labelOf(c.a)}</strong> &amp; <strong>{labelOf(c.b)}</strong>
                        </span>
                        <span style={{ color: 'var(--cycle-muted, #888)', fontSize: 12 }}>
                          {c.bothDays} van de {c.aDays} dagen ({c.pct}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs mt-3" style={{ color: 'var(--cycle-muted, #888)' }}>
                  Tip: noteer deze patronen mee als je naar de dokter gaat — &quot;mijn opvliegers
                  komen meestal samen met slechte slaap&quot; is concretere informatie dan elk
                  apart noemen.
                </p>
              </div>
            </section>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/Cycle/export" className="text-sm underline" style={{ color: 'var(--cycle-muted, #888)' }}>
            🩺 Print-versie voor je arts
          </Link>
        </div>
      </div>
    </main>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Visualization helpers
// ───────────────────────────────────────────────────────────────────────────

interface HeatmapCell {
  date:     string
  weekday:  number              // 0 = ma, 6 = zo
  weekIdx:  number              // 0..N-1 (oudste links)
  count:    number              // aantal symptomen die dag
  hasEntry: boolean
}

function buildHeatmap(entries: EntryRow[], days: number): { cells: HeatmapCell[]; weeks: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today.getTime() - (days - 1) * 86400000)
  // Snap start aan maandag
  const startWeekday = (start.getDay() + 6) % 7   // 0 = ma
  start.setDate(start.getDate() - startWeekday)

  const byDate: Record<string, EntryRow> = {}
  for (const e of entries) byDate[e.entry_date] = e

  const cells: HeatmapCell[] = []
  const totalDays = Math.ceil((today.getTime() - start.getTime()) / 86400000) + 1
  const weeks = Math.ceil(totalDays / 7)

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start.getTime() + i * 86400000)
    const iso = d.toISOString().slice(0, 10)
    const e = byDate[iso]
    const weekday = (d.getDay() + 6) % 7
    cells.push({
      date:     iso,
      weekday,
      weekIdx:  Math.floor(i / 7),
      count:    e?.symptoms?.length ?? 0,
      hasEntry: !!e,
    })
  }
  return { cells, weeks }
}

function Heatmap({ data }: { data: { cells: HeatmapCell[]; weeks: number } }) {
  const { cells, weeks } = data
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `auto repeat(${weeks}, 1fr)`,
      gap: 3,
      fontSize: 10,
      color: 'var(--cycle-muted, #888)',
    }}>
      {/* Day labels column */}
      <div></div>
      {Array.from({ length: weeks }, (_, w) => (
        <div key={`w${w}`} style={{ textAlign: 'center', fontSize: 9 }}>{w === 0 ? 'oud' : (w === weeks - 1 ? 'nu' : '')}</div>
      ))}

      {['ma','di','wo','do','vr','za','zo'].map((dayLabel, dIdx) => (
        <div key={dayLabel} style={{ display: 'contents' }}>
          <div style={{ paddingRight: 8, alignSelf: 'center' }}>{dayLabel}</div>
          {Array.from({ length: weeks }, (_, w) => {
            const cell = cells.find((c) => c.weekIdx === w && c.weekday === dIdx)
            const future = cell && new Date(cell.date) > new Date()
            const intensity = cell?.hasEntry ? Math.min(1, (cell.count + 1) / 6) : 0
            const bg = future
              ? 'transparent'
              : !cell?.hasEntry
                ? 'rgba(255,255,255,0.04)'
                : `rgba(232, 97, 26, ${0.2 + intensity * 0.8})`     // brand-accent oranje
            return (
              <div
                key={`${dayLabel}-${w}`}
                title={cell ? `${cell.date} · ${cell.count} symptomen` : ''}
                style={{
                  aspectRatio: '1 / 1',
                  background: bg,
                  borderRadius: 3,
                  border: cell?.hasEntry && cell.count === 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function Legend7() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11, color: 'var(--cycle-muted, #888)' }}>
      <span>weinig</span>
      <div style={{ display: 'flex', gap: 2 }}>
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 3,
            background: `rgba(232, 97, 26, ${i})`,
          }} />
        ))}
      </div>
      <span>veel symptomen</span>
      <span style={{ marginLeft: 16 }}>· lege cel = geen check-in</span>
    </div>
  )
}

interface TrendPoint {
  weekLabel: string
  sleep:     number | null
  mood:      number | null
  stress:    number | null
}

function buildTrend(entries: EntryRow[]): TrendPoint[] {
  // Bin per weeknummer (ISO week), pak gemiddelden
  const bins: Record<string, { sleep: number[]; mood: number[]; stress: number[]; date: Date }> = {}
  for (const e of entries) {
    const d = new Date(e.entry_date)
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const key = monday.toISOString().slice(0, 10)
    if (!bins[key]) bins[key] = { sleep: [], mood: [], stress: [], date: monday }
    if (e.sleep      != null) bins[key].sleep.push(e.sleep)
    if (e.mood_score != null) bins[key].mood.push(e.mood_score)
    if (e.stress     != null) bins[key].stress.push(e.stress)
  }
  return Object.entries(bins)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, b]) => ({
      weekLabel: b.date.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' }),
      sleep:     avg(b.sleep),
      mood:      avg(b.mood),
      stress:    avg(b.stress),
    }))
}
function avg(arr: number[]): number | null {
  if (arr.length === 0) return null
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
}

interface Cooccurrence {
  a:        string
  b:        string
  bothDays: number     // aantal dagen waarop beide voorkwamen
  aDays:    number     // aantal dagen waarop A voorkwam
  pct:      number     // bothDays / aDays * 100
}

function buildCooccurrence(entries: EntryRow[]): Cooccurrence[] {
  // Tel alle paren — alleen kijken naar dagen met >= 2 symptomen
  const symFreq: Record<string, number> = {}
  const pairFreq: Record<string, number> = {}
  for (const e of entries) {
    const syms = (e.symptoms ?? []).slice().sort()
    if (syms.length === 0) continue
    for (const s of syms) symFreq[s] = (symFreq[s] ?? 0) + 1
    for (let i = 0; i < syms.length; i++) {
      for (let j = i + 1; j < syms.length; j++) {
        const key = `${syms[i]}|${syms[j]}`
        pairFreq[key] = (pairFreq[key] ?? 0) + 1
      }
    }
  }
  // Filter: alleen paren waar A vaak voorkomt EN paar minimaal 3x
  const pairs: Cooccurrence[] = []
  for (const [key, count] of Object.entries(pairFreq)) {
    if (count < 3) continue
    const [a, b] = key.split('|')
    const aDays = symFreq[a] ?? 0
    const bDays = symFreq[b] ?? 0
    if (aDays < 4 && bDays < 4) continue
    // Sorteer zodat de meest voorkomende A is
    const major = aDays >= bDays ? a : b
    const minor = aDays >= bDays ? b : a
    pairs.push({
      a:        major,
      b:        minor,
      bothDays: count,
      aDays:    Math.max(aDays, bDays),
      pct:      Math.round((count / Math.max(aDays, bDays)) * 100),
    })
  }
  return pairs.sort((a, b) => b.pct - a.pct)
}

function labelOf(code: string): string {
  return code.replace(/_/g, ' ')
}
