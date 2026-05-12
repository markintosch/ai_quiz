// FILE: src/app/peri-compass/results/[id]/page.tsx
// Meertalige results page — leest assessment.language uit DB en rendert in die taal.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { BAND_COPY, dimensionLabel, type Band } from '@/lib/peri-compass/scoring'
import { RESULTS, STAGE_LABELS, FIELD_LABELS, pickLang, type Lang } from '@/lib/peri-compass/i18n'
import type { Dimension } from '@/lib/peri-compass/questions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:  'Peri-Compass — results',
  robots: { index: false, follow: false },
}

interface AssessmentRow {
  id:                       string
  email:                    string | null
  display_name:             string | null
  stage:                    string
  age_band:                 string | null
  hrt_status:               string | null
  language:                 string
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

const DIM_KEYS: { key: keyof Pick<AssessmentRow,
  'score_symptom_burden'|'score_sleep_recovery'|'score_energy_capacity'|
  'score_stress_context'|'score_lifestyle'|'score_self_awareness'>;
  dim: Dimension }[] = [
  { key: 'score_symptom_burden',  dim: 'symptom_burden' },
  { key: 'score_sleep_recovery',  dim: 'sleep_recovery' },
  { key: 'score_energy_capacity', dim: 'energy_capacity' },
  { key: 'score_stress_context',  dim: 'stress_context' },
  { key: 'score_lifestyle',       dim: 'lifestyle' },
  { key: 'score_self_awareness',  dim: 'self_awareness' },
]

export default async function CompassResultsPage({
  params,
  searchParams,
}: {
  params:       { id: string }
  searchParams: { lang?: string }
}) {
  const a = await fetchAssessment(params.id)
  if (!a) notFound()

  const lang: Lang = pickLang(a.language || searchParams.lang)
  const t        = RESULTS[lang]
  const stages   = STAGE_LABELS[lang]
  const fields   = FIELD_LABELS[lang]
  const band     = (a.band ?? 'navigating') as Band
  const bandCopy = BAND_COPY[lang][band]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-accent">
            {t.eyebrow}
          </p>
          <h1 className="mb-3 text-3xl font-bold text-brand md:text-4xl">
            {a.display_name ? `${greetingFor(lang)} ${a.display_name.split(' ')[0]},` : t.greetingFallback}
          </h1>
          <p className="text-sm text-gray-600">
            {stages[a.stage] ?? a.stage}
            {a.age_band && ` · ${t.ageLabel} ${a.age_band}`}
            {a.hrt_status && a.hrt_status !== 'prefer_not_say' && ` · ${t.hrtLabel}: ${a.hrt_status}`}
          </p>
        </div>

        <div className="mb-8 rounded-xl bg-brand p-8 text-center text-white shadow-lg">
          <p className="font-mono text-7xl font-black text-brand-accent md:text-8xl">{a.score_overall}</p>
          <p className="mt-2 text-xl font-semibold">{bandCopy.title}</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-200">{bandCopy.sub}</p>
        </div>

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-bold text-brand">{t.perDimension}</h2>
          <div className="space-y-3">
            {DIM_KEYS.map((d) => (
              <DimensionBar key={d.key} label={dimensionLabel(d.dim, lang)} score={a[d.key]} />
            ))}
          </div>
        </section>

        {a.ai_observation && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-brand">{t.whatISee}</h2>
            <p className="leading-relaxed text-gray-800">{a.ai_observation}</p>
          </section>
        )}

        {a.ai_hypotheses?.length > 0 && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-brand">{t.threeHypotheses}</h2>
            <ol className="space-y-3">
              {a.ai_hypotheses.slice(0, 3).map((h, i) => (
                <li key={i} className="flex gap-3 text-gray-800">
                  <span className="font-mono font-bold text-brand-accent">{i + 1}.</span>
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-gray-100 pt-3 text-xs italic text-gray-600">
              {t.hypothesisDisclaimer}
            </p>
          </section>
        )}

        {a.ai_micro_experiment && (
          <section className="mb-8 rounded-xl border border-brand-accent/30 bg-gradient-to-br from-orange-50 to-rose-50 p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-accent">
              {t.experimentEyebrow}
            </p>
            <p className="text-base leading-relaxed text-gray-900">{a.ai_micro_experiment}</p>
          </section>
        )}

        {a.ai_recommended_tracking && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-brand">{t.recommendedHeading}</h2>
            {a.ai_recommended_tracking.symptoms && a.ai_recommended_tracking.symptoms.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">{t.recSymptoms}</p>
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
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">{t.recFields}</p>
                <div className="flex flex-wrap gap-2">
                  {a.ai_recommended_tracking.fields.map((f) => (
                    <span key={f} className="rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-medium text-brand-dark">
                      {fields[f] ?? f}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-4 text-xs text-gray-600">{t.recHint}</p>
          </section>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="mb-3 text-xl font-bold text-brand">{t.ctaHeading}</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-700">{t.ctaBody}</p>
          <Link
            href={a.email ? `/Cycle/login?email=${encodeURIComponent(a.email)}` : '/Cycle/login'}
            className="inline-block rounded-md bg-brand-accent px-7 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-accent/90"
          >
            {t.ctaButton}
          </Link>
          {!a.email && <p className="mt-4 text-xs text-gray-600">{t.ctaNote}</p>}
        </section>

        <p className="mt-8 text-center text-xs text-gray-600">{t.bookmarkHint}</p>
      </div>
    </main>
  )
}

function greetingFor(lang: Lang): string {
  return lang === 'nl' ? 'Hoi'
       : lang === 'en' ? 'Hi'
       : lang === 'fr' ? 'Bonjour'
       :                 'Hallo'
}

function DimensionBar({ label, score }: { label: string; score: number }) {
  const pct = Math.max(0, Math.min(100, score))
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

async function fetchAssessment(id: string): Promise<AssessmentRow | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('perimenopause_compass_assessments')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return (data as AssessmentRow | null) ?? null
}
