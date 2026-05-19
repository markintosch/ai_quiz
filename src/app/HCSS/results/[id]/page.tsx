// FILE: src/app/HCSS/results/[id]/page.tsx
// Results page voor HCSS Cyber Compass.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { dimensionLabel, type Band } from '@/lib/cyber-compass/scoring'
import { RESULTS, BAND_COPY, BRAND, pickLang, type Lang } from '@/lib/cyber-compass/i18n'
import type { Dimension } from '@/lib/cyber-compass/questions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:  'HCSS Cyber Compass — resultaten',
  robots: { index: false, follow: false },
}

interface QuickWin {
  code:      string
  title:     string
  text:      string
  rationale: string
  source:    string
  sourceUrl?: string
  effort:    string
}

interface AssessmentRow {
  id:                       string
  email:                    string | null
  display_name:             string | null
  organisation_name:        string | null
  organisation_size:        string | null
  sector:                   string | null
  language:                 string
  score_overall:            number
  score_iam:                number
  score_awareness:          number
  score_data:               number
  score_endpoint:           number
  score_backup:             number
  score_compliance:         number
  score_supply_chain:       number
  band:                     Band | null
  nis2_in_scope:            boolean | null
  ai_observation:           string | null
  ai_risk_observations:     string[]
  ai_quick_wins:            QuickWin[]
  ai_specialist_topic:      string | null
  ai_specialist_reason:     string | null
  created_at:               string
}

const DIM_KEYS: { key: keyof Pick<AssessmentRow,
  'score_iam'|'score_awareness'|'score_data'|'score_endpoint'|'score_backup'|'score_compliance'|'score_supply_chain'>;
  dim: Dimension }[] = [
  { key: 'score_iam',          dim: 'iam' },
  { key: 'score_awareness',    dim: 'awareness' },
  { key: 'score_data',         dim: 'data' },
  { key: 'score_endpoint',     dim: 'endpoint' },
  { key: 'score_backup',       dim: 'backup' },
  { key: 'score_compliance',   dim: 'compliance' },
  { key: 'score_supply_chain', dim: 'supply_chain' },
]

export default async function CyberResultsPage(
  props: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ lang?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const a = await fetchAssessment(params.id)
  if (!a) notFound()

  const lang: Lang = pickLang(a.language || searchParams.lang)
  const t        = RESULTS[lang]
  const band     = (a.band ?? 'aware') as Band
  const bandCopy = BAND_COPY[lang][band]

  // Topo lever = laagst scorende dimensie
  const dimScores = DIM_KEYS.map((d) => ({ dim: d.dim, score: a[d.key] }))
                            .sort((x, y) => x.score - y.score)
  const topLever     = dimScores[0]
  const topLeverText = t.topLeverFor[topLever.dim] ?? ''

  return (
    <main className="min-h-screen" style={{ background: '#f4f6f8' }}>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/HCSS" className="text-sm font-medium text-gray-700 hover:text-gray-900">← HCSS Cyber Compass</Link>
          <span className="text-xs text-gray-500">{a.organisation_name ?? a.email ?? 'anoniem'}</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#E8611A' }}>{t.eyebrow}</p>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl" style={{ color: '#1f3a4a' }}>
            {a.display_name ? `Hoi ${a.display_name.split(' ')[0]},` : t.greetingFallback}
          </h1>
          <p className="text-sm text-gray-600">
            {a.organisation_name && <>{a.organisation_name} · </>}
            {a.organisation_size}
            {a.sector && ` · ${a.sector}`}
            {a.nis2_in_scope === true && ' · NIS2'}
          </p>
        </div>

        {/* Score badge */}
        <div className="mb-8 rounded-xl p-8 text-center text-white shadow-lg" style={{ background: '#1f3a4a' }}>
          <p className="font-mono text-7xl font-black md:text-8xl" style={{ color: '#E8611A' }}>{a.score_overall}</p>
          <p className="mt-2 text-xl font-semibold">{bandCopy.title}</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-200">{bandCopy.sub}</p>
        </div>

        {/* Top lever */}
        {topLever && topLeverText && (
          <section className="mb-6 rounded-xl border-2 bg-white p-6" style={{ borderColor: '#E8611A66' }}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#E8611A' }}>{t.topRiskHeading}</p>
            <h2 className="mb-2 text-xl font-bold" style={{ color: '#1f3a4a' }}>{dimensionLabel(topLever.dim, lang)}</h2>
            <p className="text-sm leading-relaxed text-gray-700">{topLeverText}</p>
          </section>
        )}

        {/* Dimensions */}
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-bold" style={{ color: '#1f3a4a' }}>{t.perDimension}</h2>
          <div className="space-y-3">
            {DIM_KEYS.map((d) => (
              <DimensionBar key={d.key} label={dimensionLabel(d.dim, lang)} score={a[d.key]}
                isTopLever={d.dim === topLever?.dim} />
            ))}
          </div>
        </section>

        {/* AI observation */}
        {a.ai_observation && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold" style={{ color: '#1f3a4a' }}>{t.eyebrow.replace('Je ', 'Wat we zien — ').replace('Your ', 'What we see — ')}</h2>
            <p className="leading-relaxed text-gray-800">{a.ai_observation}</p>
          </section>
        )}

        {/* Risk observations */}
        {a.ai_risk_observations?.length > 0 && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold" style={{ color: '#1f3a4a' }}>{t.riskObservations}</h2>
            <ol className="space-y-3">
              {a.ai_risk_observations.slice(0, 3).map((r, i) => (
                <li key={i} className="flex gap-3 text-gray-800">
                  <span className="font-mono font-bold" style={{ color: '#E8611A' }}>{i + 1}.</span>
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Quick wins */}
        {a.ai_quick_wins?.length > 0 && (
          <section className="mb-8 overflow-hidden rounded-xl border-2" style={{ borderColor: '#0F7A3D40', background: 'linear-gradient(135deg, #F0FAF4 0%, #ffffff 100%)' }}>
            <div className="p-6">
              <h2 className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: '#0F7A3D' }}>
                {t.quickWinsHeading}
              </h2>
              <p className="mb-5 text-xs text-gray-600">Concrete acties met bron — pak ze deze week op.</p>
              <div className="space-y-5">
                {a.ai_quick_wins.map((qw, i) => (
                  <div key={i} className="rounded-md bg-white p-4 shadow-sm">
                    <p className="mb-1 text-base font-bold text-gray-900">{i + 1}. {qw.title}</p>
                    <p className="mb-2 text-sm leading-relaxed text-gray-800">{qw.text}</p>
                    <p className="mb-3 text-xs italic text-gray-700">{qw.rationale}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span>⏱ {qw.effort}</span>
                      <span>·</span>
                      <span>
                        {t.sourceLabel}:{' '}
                        {qw.sourceUrl ? (
                          <a href={qw.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-600">{qw.source}</a>
                        ) : qw.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Specialist topic */}
        {a.ai_specialist_topic && (
          <section className="mb-8 overflow-hidden rounded-xl border-2 bg-white" style={{ borderColor: '#E8611A66' }}>
            <div className="p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#E8611A' }}>
                {t.specialistHeading}
              </p>
              <h3 className="mb-2 text-lg font-bold" style={{ color: '#1f3a4a' }}>{a.ai_specialist_topic}</h3>
              {a.ai_specialist_reason && (
                <p className="mb-4 text-sm leading-relaxed text-gray-700">{a.ai_specialist_reason}</p>
              )}
              <p className="mb-4 text-sm leading-relaxed text-gray-800">{t.specialistIntro}</p>
              <a href={BRAND.calendlyUrl} target="_blank" rel="noopener noreferrer"
                className="inline-block rounded-md px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                style={{ background: '#E8611A' }}>
                {t.bookCallCta}
              </a>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center text-xs leading-relaxed text-gray-600">
          <p className="mb-2">{t.bookmarkHint}</p>
          <p className="mb-2">{t.evidenceFooter}</p>
          <p>{t.ownerFooter}</p>
        </div>
      </div>
    </main>
  )
}

function DimensionBar({ label, score, isTopLever }: { label: string; score: number; isTopLever?: boolean }) {
  const pct = Math.max(0, Math.min(100, score))
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? '' : 'bg-rose-500'
  const inlineBg = pct >= 50 && pct < 75 ? '#E8611A' : undefined
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-800">
          {label}
          {isTopLever && (
            <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white" style={{ background: '#E8611A' }}>
              focus
            </span>
          )}
        </span>
        <span className="font-mono font-semibold" style={{ color: '#1f3a4a' }}>{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%`, background: inlineBg }} />
      </div>
    </div>
  )
}

async function fetchAssessment(id: string): Promise<AssessmentRow | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('cyber_compass_assessments')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return (data as AssessmentRow | null) ?? null
}
