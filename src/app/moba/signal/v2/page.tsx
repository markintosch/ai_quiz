// FILE: src/app/moba/signal/v2/page.tsx
// ─── Moba Signal V2 preview — the decision layer over the V1 dataset ─────────
//
// Same auth, same live/demo loading and same dataset as V1 (/moba/signal).
// Only the surface differs: attention first, actions with owners, role
// lenses, chapters, and the evidence layer collapsed behind one confidence
// figure. V1 stays untouched as the rollback point and the analyst surface;
// see docs/moba-signal-v1.md.

import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { isSignalAuthorised, signalPassword } from '@/lib/signal/auth'
import { loadLiveDataset } from '@/lib/signal/db'
import { SIGNAL_DEMO } from '@/products/moba_signal/data'
import { SignalV2Dashboard } from '@/components/moba/signal/v2/SignalV2Dashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Moba Signal — Competitive Intelligence',
  description: 'Internal intelligence on competitors, markets, accounts and positioning.',
  robots: { index: false, follow: false }, // internal, never index
}

interface PageProps {
  searchParams: Promise<{ demo?: string }>
}

export default async function MobaSignalV2Page({ searchParams }: PageProps) {
  if (!signalPassword()) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Moba Signal is locked</h1>
          <p className="text-sm text-gray-600">
            Set the MOBA_SIGNAL_PASSWORD environment variable and redeploy to enable access.
          </p>
        </div>
      </main>
    )
  }
  if (!(await isSignalAuthorised())) redirect('/moba/signal/login')

  const { demo } = await searchParams

  if (demo === undefined) {
    try {
      const live = await loadLiveDataset(createServiceClient())
      if (live) {
        return (
          <SignalV2Dashboard
            data={live.dataset}
            sourceLabel={`live · ${live.counts.approved} approved items${live.counts.proposed ? ` · ${live.counts.proposed} awaiting review` : ''}`}
          />
        )
      }
    } catch {
      // fall through to demo
    }
  }

  return <SignalV2Dashboard data={SIGNAL_DEMO} sourceLabel="prototype, sample data" />
}
