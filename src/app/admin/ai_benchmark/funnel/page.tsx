// FILE: src/app/admin/ai_benchmark/funnel/page.tsx
// AI-benchmark funnel — page-view → start → per-question → submit → share.
// Reads ai_benchmark_events. Date-range filter via ?range=7|30|90|all.

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getQuestions, type Role } from '@/products/ai_benchmark/data'

export const dynamic = 'force-dynamic'

interface EventRow {
  session_id:  string
  event_type:  string
  question_id: string | null
  role:        string | null
  created_at:  string
}

const RANGE_DAYS: Record<string, number | null> = {
  '7':  7,
  '30': 30,
  '90': 90,
  'all': null,
}

export default async function FunnelPage({
  searchParams,
}: {
  searchParams: { range?: string }
}) {
  const range = (searchParams.range && RANGE_DAYS[searchParams.range] !== undefined ? searchParams.range : '30')
  const days  = RANGE_DAYS[range]

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let q = supabase
    .from('ai_benchmark_events')
    .select('session_id, event_type, question_id, role, created_at')
    .order('created_at', { ascending: false })
    .limit(50000)

  if (days !== null) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    q = q.gte('created_at', since)
  }

  const { data: rows } = await q as unknown as { data: EventRow[] | null }
  const events = rows ?? []

  // Per-session aggregation
  const sessionsByEvent: Record<string, Set<string>> = {}
  const questionsAnswered: Record<string, Set<string>> = {} // question_id → sessions
  const sharePlatforms: Record<string, Set<string>> = {}    // platform → sessions

  for (const e of events) {
    ;(sessionsByEvent[e.event_type] ||= new Set()).add(e.session_id)
    if (e.event_type === 'question_answered' && e.question_id) {
      ;(questionsAnswered[e.question_id] ||= new Set()).add(e.session_id)
    }
  }

  // For platform breakdown, we'd need meta — skipped for v1, will add when meta querying is built

  const count = (k: string) => sessionsByEvent[k]?.size ?? 0
  const pageView         = count('page_view')
  const dashboardView    = count('dashboard_viewed')
  const introStarted     = count('intro_started')
  const introCompleted   = count('intro_completed')
  const submitAttempt    = count('submit_attempt')
  const submitSuccess    = count('submit_success')
  const submitError      = count('submit_error')
  const resultsViewed    = count('results_viewed')
  const shareOpened      = count('share_opened')
  const shareClicked     = count('share_clicked')

  // Funnel steps (ordered)
  const top = Math.max(pageView, introStarted, 1)
  const steps: { label: string; n: number; explainer?: string }[] = [
    { label: 'Bezoekers /ai_benchmark',        n: pageView,        explainer: 'Unieke sessies op de landing.' },
    { label: 'Bezoekers /dashboard',           n: dashboardView,   explainer: 'Unieke sessies op het publieke dashboard.' },
    { label: 'Start intake form',              n: introStarted,    explainer: 'Sessies die de /start pagina openden.' },
    { label: 'Intake voltooid',                n: introCompleted,  explainer: 'Klikten "Naar de vragen →" met geldige velden.' },
    { label: 'Submit-poging',                  n: submitAttempt,   explainer: 'Klikten "Toon mijn dashboard →" aan het einde.' },
    { label: 'Submit gelukt',                  n: submitSuccess,   explainer: 'Antwoorden opgeslagen; dashboard geopend.' },
    { label: 'Resultaat-pagina bezocht',       n: resultsViewed,   explainer: 'Inclusief reload door de respondent of via een gedeelde link.' },
    { label: 'Deel-modal geopend',             n: shareOpened,     explainer: 'Klikten "Deel je resultaat".' },
    { label: 'Daadwerkelijk gedeeld',          n: shareClicked,    explainer: 'Klikten een social-platform-knop binnen de modal.' },
  ]

  // Per-question drop-off (where in the questionnaire people exit)
  const allQs = [...getQuestions('marketing'), ...getQuestions('sales'), ...getQuestions('hybrid')]
  const seen  = new Set<string>()
  const orderedQs = allQs.filter(q => { if (seen.has(q.id)) return false; seen.add(q.id); return true })

  const perQuestion = orderedQs.map(q => ({
    id:       q.id,
    text:     q.text.slice(0, 80),
    answered: questionsAnswered[q.id]?.size ?? 0,
  })).sort((a, b) => b.answered - a.answered)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">AI-benchmark · Funnel</h1>
        <p className="text-sm text-gray-600 mt-1">
          Per-sessie conversie van page-view → start → submit → share. Drop-off per vraag onderaan.
        </p>
      </header>

      {/* Range filter */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Periode:</span>
        {['7', '30', '90', 'all'].map(r => (
          <Link
            key={r}
            href={`/admin/ai_benchmark/funnel?range=${r}`}
            className={`px-3 py-1 rounded-full border ${
              r === range
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            {r === 'all' ? 'Alles' : `${r} dagen`}
          </Link>
        ))}
        <Link href="/admin/ai_benchmark" className="ml-auto text-brand-accent hover:underline">← Terug naar overzicht</Link>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Sessies (landing)"     value={pageView.toLocaleString()} />
        <Stat label="→ Submit gelukt"       value={submitSuccess.toLocaleString()} sub={pct(submitSuccess, pageView)} />
        <Stat label="→ Deel-modal geopend"  value={shareOpened.toLocaleString()}   sub={pct(shareOpened, submitSuccess)} />
        <Stat label="Errors bij submit"     value={submitError.toLocaleString()} />
      </div>

      {/* Funnel bars */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-600 mb-4">Conversie per stap</h2>
        <div className="space-y-3">
          {steps.map((s, i) => {
            const widthPct = top === 0 ? 0 : Math.max(2, Math.round((s.n / top) * 100))
            const dropFrom = i > 0 ? steps[i - 1].n : null
            const dropPct  = dropFrom && dropFrom > 0 ? Math.round((1 - s.n / dropFrom) * 100) : null
            return (
              <div key={s.label}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-sm font-semibold text-gray-900 truncate">{s.label}</span>
                  <span className="text-sm font-mono text-gray-700 flex-shrink-0">
                    <strong>{s.n.toLocaleString()}</strong>
                    {dropPct !== null && (
                      <span className={`ml-2 text-xs ${dropPct > 50 ? 'text-red-600' : dropPct > 25 ? 'text-amber-600' : 'text-gray-500'}`}>
                        ({dropPct > 0 ? '−' : ''}{Math.abs(dropPct)}% drop)
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-brand-accent rounded-full transition-all"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                {s.explainer && (
                  <p className="text-xs text-gray-500 mt-1">{s.explainer}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Drop-off per question */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-600 mb-1">Drop-off per vraag</h2>
        <p className="text-xs text-gray-500 mb-4">
          Aantal sessies dat een antwoord op deze vraag opsloeg. Hoe lager dan het maximum, hoe vaker mensen daar uitstapten.
        </p>
        {introCompleted === 0 ? (
          <p className="text-sm text-gray-500">Nog geen vragen beantwoord in deze periode.</p>
        ) : (
          <div className="space-y-2">
            {perQuestion.map(q => {
              const max = perQuestion[0]?.answered || 1
              const widthPct = Math.round((q.answered / max) * 100)
              return (
                <div key={q.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-brand-accent w-12">{q.id.toUpperCase()}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-700 mb-0.5">
                      <span className="truncate pr-2">{q.text}</span>
                      <span className="font-mono font-semibold">{q.answered}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-brand-accent rounded-full" style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Events worden client-side verzameld vanaf {' '}<code className="bg-gray-100 px-1 rounded">/ai_benchmark/*</code>.
        Geen cookies; sessie-ID staat in <code className="bg-gray-100 px-1 rounded">sessionStorage</code>.
        Run <code className="bg-gray-100 px-1 rounded">supabase/migration_ai_benchmark_events.sql</code> als je deze pagina leeg ziet.
      </p>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function pct(num: number, denom: number): string {
  if (denom === 0) return '—'
  return `${Math.round((num / denom) * 100)}% van vorige stap`
}
