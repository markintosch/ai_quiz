// FILE: src/app/perimenopause-compass/results/[id]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Results page voor één Compass-afname.
// Toont: overall score, dimensie-radar (visueel met bars), AI-paragraaf,
// 3 hypothesen, micro-experiment, recommended tracking, CTA naar Cycle login.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { BAND_COPY, type Band } from '@/lib/perimenopause-compass/scoring'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:  'Je Perimenopause Compass — resultaten',
  robots: { index: false, follow: false },
}

interface AssessmentRow {
  id:                       string
  email:                    string | null
  display_name:             string | null
  stage:                    string
  age_band:                 string | null
  hrt_status:               string | null
  score_overall:            number
  score_symptom_burden:     number
  score_sleep_recovery:     number
  score_energy_capacity:    number
  score_stress_context:     number
  score_lifestyle:          number
  score_self_awareness:     number
  band:                     Band | null
  goal_90d:                 string | null
  ai_observation:           string | null
  ai_hypotheses:            string[]
  ai_micro_experiment:      string | null
  ai_recommended_tracking:  { symptoms?: string[]; fields?: string[] } | null
  created_at:               string
}

const STAGE_LABEL: Record<string, string> = {
  regular_cycle:           'Regelmatige cyclus',
  irregular_cycle:         'Onregelmatige cyclus / vermoedelijk perimenopauze',
  perimenopause_diagnosed: 'Perimenopauze (vastgesteld)',
  postmenopause:           'Postmenopauze',
  unknown:                 'Cyclus-stadium onbekend',
}

const DIM_LABELS: { key: keyof Pick<AssessmentRow,
  'score_symptom_burden'|'score_sleep_recovery'|'score_energy_capacity'|
  'score_stress_context'|'score_lifestyle'|'score_self_awareness'>;
  label: string }[] = [
  { key: 'score_symptom_burden',  label: 'Symptoombelasting' },
  { key: 'score_sleep_recovery',  label: 'Slaap & herstel' },
  { key: 'score_energy_capacity', label: 'Energie & capaciteit' },
  { key: 'score_stress_context',  label: 'Stress & context' },
  { key: 'score_lifestyle',       label: 'Leefstijl' },
  { key: 'score_self_awareness',  label: 'Zelfkennis & motivatie' },
]

const FIELD_LABELS: Record<string, string> = {
  sleep:      'Slaap',
  mood:       'Stemming',
  stress:     'Stress',
  energy:     'Energie',
  hrt_taken:  'HRT-compliance',
  alcohol:    'Alcohol',
  busy_day:   'Drukke dag',
  activity:   'Beweging',
  nap:        'Dutje',
}

export default async function CompassResultsPage({ params }: { params: { id: string } }) {
  const a = await fetchAssessment(params.id)
  if (!a) notFound()

  const band = (a.band ?? 'navigating') as Band
  const bandCopy = BAND_COPY[band]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-accent">
            Je Perimenopause Compass
          </p>
          <h1 className="mb-3 text-3xl font-bold text-brand md:text-4xl">
            {a.display_name ? `Hoi ${a.display_name.split(' ')[0]},` : 'Je nulmeting'}
          </h1>
          <p className="text-sm text-gray-600">
            {STAGE_LABEL[a.stage]}
            {a.age_band && ` · leeftijd ${a.age_band}`}
            {a.hrt_status && a.hrt_status !== 'prefer_not_say' && ` · HRT: ${a.hrt_status}`}
          </p>
        </div>

        {/* Score badge */}
        <div className="mb-8 rounded-xl bg-brand p-8 text-center text-white shadow-lg">
          <p className="font-mono text-7xl font-black text-brand-accent md:text-8xl">{a.score_overall}</p>
          <p className="mt-2 text-xl font-semibold">{bandCopy.title}</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-200">
            {bandCopy.sub}
          </p>
        </div>

        {/* Dimensies */}
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-bold text-brand">Per dimensie</h2>
          <div className="space-y-3">
            {DIM_LABELS.map((d) => (
              <DimensionBar key={d.key} label={d.label} score={a[d.key]} />
            ))}
          </div>
        </section>

        {/* AI observation */}
        {a.ai_observation && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-brand">Wat ik zie</h2>
            <p className="leading-relaxed text-gray-800">{a.ai_observation}</p>
          </section>
        )}

        {/* Hypothesen */}
        {a.ai_hypotheses?.length > 0 && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-brand">Drie hypothesen</h2>
            <ol className="space-y-3">
              {a.ai_hypotheses.slice(0, 3).map((h, i) => (
                <li key={i} className="flex gap-3 text-gray-800">
                  <span className="font-mono font-bold text-brand-accent">{i + 1}.</span>
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-gray-100 pt-3 text-xs italic text-gray-600">
              Hypothesen — geen diagnose. Voor medische vragen: huisarts of menopauze-arts.
            </p>
          </section>
        )}

        {/* Micro-experiment */}
        {a.ai_micro_experiment && (
          <section className="mb-8 rounded-xl border border-brand-accent/30 bg-gradient-to-br from-orange-50 to-rose-50 p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-accent">
              Eerste experiment · 30 dagen
            </p>
            <p className="text-base leading-relaxed text-gray-900">{a.ai_micro_experiment}</p>
          </section>
        )}

        {/* Recommended tracking */}
        {a.ai_recommended_tracking && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-brand">Wat we voor jou voorstellen om te tracken</h2>
            {a.ai_recommended_tracking.symptoms && a.ai_recommended_tracking.symptoms.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Symptomen</p>
                <div className="flex flex-wrap gap-2">
                  {a.ai_recommended_tracking.symptoms.map((s) => (
                    <span key={s} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                      {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {a.ai_recommended_tracking.fields && a.ai_recommended_tracking.fields.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">Velden</p>
                <div className="flex flex-wrap gap-2">
                  {a.ai_recommended_tracking.fields.map((f) => (
                    <span key={f} className="rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-medium text-brand-dark">
                      {FIELD_LABELS[f] ?? f}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-4 text-xs text-gray-600">
              Deze voorstellen worden gebruikt om je daily check-in scherm te personaliseren zodra je begint met tracken.
            </p>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="mb-3 text-xl font-bold text-brand">Klaar om te beginnen?</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-700">
            Met daily check-ins van 60 seconden bouw je in 4-12 weken een patronen-overzicht
            dat geen enkele app je in één moment kan geven.
          </p>
          <Link
            href={a.email
              ? `/Cycle/login?email=${encodeURIComponent(a.email)}`
              : '/Cycle/login'}
            className="inline-block rounded-md bg-brand-accent px-7 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-accent/90"
          >
            Start dagelijkse tracking →
          </Link>
          {!a.email && (
            <p className="mt-4 text-xs text-gray-600">
              Voor toegang tot de Cycle app heb je een account nodig.
            </p>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-gray-600">
          Bewaar deze pagina — de URL is uniek voor jou en blijft bereikbaar.
        </p>
      </div>
    </main>
  )
}

// ── Subcomponents ─────────────────────────────────────────────────────────
function DimensionBar({ label, score }: { label: string; score: number }) {
  const pct = Math.max(0, Math.min(100, score))
  // Kleurband: rood < 40, oranje 40-65, groen > 65
  const color = pct >= 65 ? 'bg-emerald-500' : pct >= 40 ? 'bg-brand-accent' : 'bg-rose-500'
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-800">{label}</span>
        <span className="font-mono font-semibold text-brand">{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────
async function fetchAssessment(id: string): Promise<AssessmentRow | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('perimenopause_compass_assessments')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return (data as AssessmentRow | null) ?? null
}
