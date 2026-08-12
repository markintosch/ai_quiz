import { createServiceClient } from '@/lib/supabase/server'
import { aggregateMoba, type MobaSubmissionLike } from '@/lib/moba/aggregate'
import { MOBA_OPEN_QUESTIONS } from '@/products/moba_marketing/config'
import { MobaGroupReport } from '@/components/moba/MobaGroupReport'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'MOBA Marketing Survey — Teamoverzicht',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ token: string }>
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-3xl mx-auto">{children}</div>
    </main>
  )
}

export default async function MobaResultsPage({ params }: PageProps) {
  const { token } = await params
  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: team } = await (supabase.from('moba_teams') as any)
    .select('id, name, min_responses, active')
    .eq('results_token', token)
    .maybeSingle()

  if (!team) {
    return (
      <Shell>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Overzicht niet gevonden</h1>
          <p className="text-gray-600">Deze link is niet geldig.</p>
        </div>
      </Shell>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = await (supabase.from('moba_submissions') as any)
    .select('dimension_scores, priorities, open_answers, segment')
    .eq('team_id', team.id)

  const submissions: MobaSubmissionLike[] = (subs ?? []).map((s: Record<string, unknown>) => ({
    dimension_scores: (s.dimension_scores as Record<string, number>) ?? {},
    priorities: (s.priorities as Record<string, number>) ?? {},
    open_answers: (s.open_answers as Record<string, string>) ?? {},
    segment: (s.segment as number | null) ?? null,
  }))

  const minResponses = team.min_responses ?? 4

  if (submissions.length < minResponses) {
    return (
      <Shell>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-1">{team.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nog even geduld</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Het teamoverzicht wordt zichtbaar zodra minstens {minResponses} teamleden hebben
            ingevuld. Op dit moment zijn dat er {submissions.length}. Zo blijft anonimiteit
            gewaarborgd.
          </p>
        </div>
      </Shell>
    )
  }

  const data = aggregateMoba(submissions, [...MOBA_OPEN_QUESTIONS])

  return (
    <Shell>
      <MobaGroupReport data={data} teamName={team.name} />
    </Shell>
  )
}
