import { createServiceClient } from '@/lib/supabase/server'
import { MobaSurvey } from './MobaSurvey'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'MOBA Marketing Survey',
  robots: { index: false, follow: false }, // internal, anonymous — never index
}

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ view?: string }>
}

export default async function MobaSurveyPage({ params, searchParams }: PageProps) {
  const { token } = await params
  const { view } = await searchParams

  // ── Demo / evaluation mode — no DB, nothing saved ──────────
  if (token === 'demo') {
    return (
      <MobaSurvey
        submitToken="demo"
        teamName="Demo — MOBA Marketing Survey"
        segmentationEnabled
        demo
        initialStep={view === 'report' ? 'demoReport' : 'intro'}
      />
    )
  }

  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: team } = await (supabase.from('moba_teams') as any)
    .select('name, submit_token, segmentation_enabled, active')
    .eq('submit_token', token)
    .maybeSingle()

  if (!team || team.active === false) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Survey niet beschikbaar</h1>
          <p className="text-gray-600">
            Deze link is niet (meer) geldig. Vraag je contactpersoon om een actuele link.
          </p>
        </div>
      </main>
    )
  }

  return (
    <MobaSurvey
      submitToken={team.submit_token}
      teamName={team.name}
      segmentationEnabled={team.segmentation_enabled !== false}
    />
  )
}
