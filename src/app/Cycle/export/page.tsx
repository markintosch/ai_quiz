// FILE: src/app/Cycle/export/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Print-vriendelijke export voor mee te nemen naar de huisarts of menopauze-arts.
//
// URL: /Cycle/export?range=30d|60d|90d|180d  (default 30d)
//
// Bevat:
//   - Naam, datum-range, gegenereerd-op
//   - Peri-Compass baseline (als beschikbaar): overall + per dimensie
//   - Tabel daily check-ins (sleep, energie, mood, stress, busy_day, symptomen-aantal)
//   - Top symptomen met frequentie
//   - Open vragen-template voor arts
//
// Print-styling via @media print in cycle.css — gebruiker drukt Cmd+P en
// printer/PDF-export geeft een schone A4 weergave.
// ─────────────────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata = {
  title:  'Export voor je arts — Cycle',
  robots: { index: false, follow: false },
}

interface EntryRow {
  entry_date:        string
  mood_score:        number | null
  sleep:             number | null
  stress:            number | null
  readiness_score:   number | null
  alcohol_glasses:   number | null
  busy_day:          boolean | null
  nap_taken:         boolean | null
  menstruation_flag: boolean | null
  symptoms:          string[] | null
  cycle_phase:       string | null
}

const RANGE_DAYS: Record<string, number> = {
  '30d':  30,
  '60d':  60,
  '90d':  90,
  '180d': 180,
}

const RANGE_LABEL: Record<string, string> = {
  '30d':  'Afgelopen 30 dagen',
  '60d':  'Afgelopen 60 dagen',
  '90d':  'Afgelopen 90 dagen',
  '180d': 'Afgelopen 180 dagen',
}

export default async function CycleExportPage(
  props: {
    searchParams: Promise<{ range?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const user = await requireCycleUser()
  if (!user) redirect('/Cycle/login')

  const range = searchParams.range && RANGE_DAYS[searchParams.range] ? searchParams.range : '30d'
  const days  = RANGE_DAYS[range]

  const today = new Date()
  const since = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
  const sinceISO = since.toISOString().slice(0, 10)
  const todayISO = today.toISOString().slice(0, 10)

  const supabase = await createClient()
  const { data: entries } = await supabase
    .from('cycle_daily_entries')
    .select('entry_date, mood_score, sleep, stress, readiness_score, alcohol_glasses, busy_day, nap_taken, menstruation_flag, symptoms, cycle_phase')
    .eq('user_id', user.id)
    .gte('entry_date', sinceISO)
    .lte('entry_date', todayISO)
    .order('entry_date', { ascending: true })

  const rows = (entries ?? []) as EntryRow[]

  // Optioneel: koppel aan Peri-Compass baseline op basis van email
  const sc = createServiceClient()
  const { data: compassProfile } = await sc
    .from('perimenopause_compass_profiles')
    .select('latest_assessment_id, baseline_overall, baseline_taken_at, stage, recommended_symptoms, goal_90d')
    .ilike('email', user.email)
    .maybeSingle()

  type CompassAssessmentRow = {
    score_overall: number; score_symptom_burden: number; score_sleep_recovery: number
    score_energy_capacity: number; score_stress_context: number; score_lifestyle: number
    score_self_awareness: number; band: string | null; ai_micro_experiment: string | null
    ai_micro_experiment_source: string | null; created_at: string
  }
  let compassAssessment: CompassAssessmentRow | null = null
  const cp = compassProfile as { latest_assessment_id?: string | null } | null
  if (cp?.latest_assessment_id) {
    const { data } = await sc
      .from('perimenopause_compass_assessments')
      .select('score_overall, score_symptom_burden, score_sleep_recovery, score_energy_capacity, score_stress_context, score_lifestyle, score_self_awareness, band, ai_micro_experiment, ai_micro_experiment_source, created_at')
      .eq('id', cp.latest_assessment_id)
      .maybeSingle()
    compassAssessment = (data as unknown as CompassAssessmentRow | null) ?? null
  }

  // ── Aggregaties ───────────────────────────────────────────────────────
  const checkInDays = rows.length
  const avgSleep    = avgOf(rows.map((r) => r.sleep))
  const avgMood     = avgOf(rows.map((r) => r.mood_score))
  const avgStress   = avgOf(rows.map((r) => r.stress))
  const totalAlcGlasses = rows.reduce((acc, r) => acc + (r.alcohol_glasses ?? 0), 0)
  const busyDays    = rows.filter((r) => r.busy_day).length
  const napDays     = rows.filter((r) => r.nap_taken).length

  // Symptoom-frequentie
  const symptomCounts: Record<string, number> = {}
  for (const r of rows) {
    for (const s of r.symptoms ?? []) {
      symptomCounts[s] = (symptomCounts[s] ?? 0) + 1
    }
  }
  const topSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  return (
    <div className="cycle-export-root">
      {/* Print-control bar — verbergt bij printen */}
      <div className="cycle-export-controls" style={{ background: '#0e0e0e', color: '#fff', padding: '12px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/Cycle/today" style={{ color: '#9ca3af', fontSize: 13, textDecoration: 'none' }}>
              ← Terug naar Cycle
            </Link>
            <span style={{ color: '#4b5563', fontSize: 12 }}>·</span>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>Periode:</span>
            {(['30d','60d','90d','180d'] as const).map((r) => (
              <Link
                key={r}
                href={`/Cycle/export?range=${r}`}
                style={{
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  background: r === range ? '#fff' : 'transparent',
                  color:      r === range ? '#0e0e0e' : '#9ca3af',
                  border: r === range ? 'none' : '1px solid #374151',
                }}
              >
                {RANGE_LABEL[r].replace('Afgelopen ', '')}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={(() => 'window.print()') as unknown as undefined}
            // eslint-disable-next-line react/no-unknown-property
            data-onclick="window.print()"
            className="cycle-export-print-btn"
          >
            🖨 Print of bewaar als PDF
          </button>
        </div>
      </div>
      {/* Page content — print-friendly */}
      <article className="cycle-export-paper">
        <header className="cycle-export-header">
          <div>
            <h1 className="cycle-export-title">Cycle — overzicht voor consult</h1>
            <p className="cycle-export-meta">
              Naam: <strong>{user.email}</strong>
              {' · '}
              Periode: <strong>{RANGE_LABEL[range]}</strong>
              {' · '}
              Gegenereerd: <strong>{new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
            </p>
            <p className="cycle-export-disclaimer">
              Dit overzicht is gebaseerd op zelf-gerapporteerde dagelijkse check-ins.
              Geen medische diagnose. Bedoeld als gespreksvoorbereiding.
            </p>
          </div>
          <div className="cycle-export-brand">
            Brand PWRD Media · Cycle
          </div>
        </header>

        {/* ── Compass baseline ─────────────────────────────────── */}
        {compassAssessment && (
          <section className="cycle-export-section">
            <h2 className="cycle-export-h2">Peri-Compass nulmeting</h2>
            <p className="cycle-export-subtle">
              Afgenomen op {new Date(compassAssessment.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <table className="cycle-export-table cycle-export-table-compact">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Dimensie</th>
                  <th>Score (0-100)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>Overall</strong></td><td><strong>{compassAssessment.score_overall} ({compassAssessment.band})</strong></td></tr>
                <tr><td>Symptoombelasting</td><td>{compassAssessment.score_symptom_burden}</td></tr>
                <tr><td>Slaap & herstel</td><td>{compassAssessment.score_sleep_recovery}</td></tr>
                <tr><td>Energie & capaciteit</td><td>{compassAssessment.score_energy_capacity}</td></tr>
                <tr><td>Stress & context</td><td>{compassAssessment.score_stress_context}</td></tr>
                <tr><td>Leefstijl</td><td>{compassAssessment.score_lifestyle}</td></tr>
                <tr><td>Zelfkennis & motivatie</td><td>{compassAssessment.score_self_awareness}</td></tr>
              </tbody>
            </table>
            {compassAssessment.ai_micro_experiment && (
              <p className="cycle-export-subtle">
                <strong>Lopend experiment:</strong> {compassAssessment.ai_micro_experiment}
                {compassAssessment.ai_micro_experiment_source && (
                  <> <em>(bron: {compassAssessment.ai_micro_experiment_source})</em></>
                )}
              </p>
            )}
          </section>
        )}

        {/* ── Aggregaties ──────────────────────────────────────── */}
        <section className="cycle-export-section">
          <h2 className="cycle-export-h2">Samenvatting periode</h2>
          <div className="cycle-export-grid-4">
            <Stat label="Check-in dagen" value={`${checkInDays} / ${days}`} />
            <Stat label="Gem. slaap" value={fmtNum(avgSleep)} suffix="/10" />
            <Stat label="Gem. stemming" value={fmtNum(avgMood)} suffix="/10" />
            <Stat label="Gem. stress" value={fmtNum(avgStress)} suffix="/10" />
            <Stat label="Drukke dagen" value={busyDays.toString()} />
            <Stat label="Dutjes overdag" value={napDays.toString()} />
            <Stat label="Glazen alcohol totaal" value={totalAlcGlasses.toString()} />
            <Stat label="% met symptomen" value={`${pct(rows.filter((r) => (r.symptoms ?? []).length > 0).length, checkInDays)}%`} />
          </div>
        </section>

        {/* ── Top symptomen ────────────────────────────────────── */}
        {topSymptoms.length > 0 && (
          <section className="cycle-export-section">
            <h2 className="cycle-export-h2">Meest voorkomende symptomen</h2>
            <table className="cycle-export-table">
              <thead>
                <tr>
                  <th>Symptoom</th>
                  <th>Aantal dagen</th>
                  <th>% van check-ins</th>
                </tr>
              </thead>
              <tbody>
                {topSymptoms.map(([sym, count]) => (
                  <tr key={sym}>
                    <td>{sym.replace(/_/g, ' ')}</td>
                    <td>{count}</td>
                    <td>{pct(count, checkInDays)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ── Tabel daily entries ─────────────────────────────── */}
        <section className="cycle-export-section">
          <h2 className="cycle-export-h2">Dagelijks logboek</h2>
          {rows.length === 0 ? (
            <p className="cycle-export-subtle">Geen check-ins in deze periode.</p>
          ) : (
            <table className="cycle-export-table cycle-export-table-compact">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Slaap</th>
                  <th>Stemming</th>
                  <th>Stress</th>
                  <th>Symptomen</th>
                  <th>Overig</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.entry_date}>
                    <td>{new Date(r.entry_date).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' })}</td>
                    <td>{r.sleep ?? '—'}</td>
                    <td>{r.mood_score ?? '—'}</td>
                    <td>{r.stress ?? '—'}</td>
                    <td>{(r.symptoms ?? []).map((s) => s.replace(/_/g, ' ')).join(', ') || '—'}</td>
                    <td>
                      {[
                        r.busy_day ? 'druk' : null,
                        r.nap_taken ? 'dutje' : null,
                        r.menstruation_flag ? 'menstr.' : null,
                        r.alcohol_glasses ? `🍷 ${r.alcohol_glasses}` : null,
                      ].filter(Boolean).join(' · ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ── Vragen voor arts (template) ─────────────────────── */}
        <section className="cycle-export-section">
          <h2 className="cycle-export-h2">Mijn vragen voor dit consult</h2>
          <div className="cycle-export-question-lines">
            <div className="cycle-export-line"></div>
            <div className="cycle-export-line"></div>
            <div className="cycle-export-line"></div>
            <div className="cycle-export-line"></div>
          </div>
        </section>

        <footer className="cycle-export-footer">
          <p>
            Gegenereerd via Cycle (markdekock.com/Cycle) — een persoonlijk logboek-systeem
            van Brand PWRD Media B.V. Geen medisch advies; bedoeld als gespreksvoorbereiding
            tussen jou en je arts.
          </p>
        </footer>
      </article>
      {/* Inline script voor print-knop (server component kan geen onClick) */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('click', function(e) {
          var btn = e.target && e.target.closest && e.target.closest('.cycle-export-print-btn');
          if (btn) { window.print(); }
        });
      ` }} />
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="cycle-export-stat">
      <p className="cycle-export-stat-label">{label}</p>
      <p className="cycle-export-stat-value">
        {value}{suffix && <span style={{ fontSize: '0.6em', color: '#9ca3af', marginLeft: 2 }}>{suffix}</span>}
      </p>
    </div>
  )
}

function avgOf(arr: (number | null)[]): number | null {
  const nums = arr.filter((n): n is number => typeof n === 'number')
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}
function fmtNum(n: number | null): string { return n === null ? '—' : n.toFixed(1) }
function pct(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}
