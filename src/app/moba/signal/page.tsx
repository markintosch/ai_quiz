// FILE: src/app/moba/signal/page.tsx
// ─── Moba Signal — competitive intelligence dashboard ────────────────────────
//
// Live mode renders approved items from the moba_signal_* tables, collected by
// the agent pipeline in src/lib/signal and approved in /admin/moba-signal.
// Until the database holds approved items (or when it is unreachable, or with
// ?demo) the page renders the curated sample dataset, clearly labelled — a
// fallback is visible, never silent (PRD §8.6).
//
// Internal only: noindexed. Real access control is P0 before collected
// intelligence replaces the sample data everywhere.

import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { isSignalAuthorised, signalPassword } from '@/lib/signal/auth'
import { loadLiveDataset } from '@/lib/signal/db'
import { SIGNAL_DEMO } from '@/products/moba_signal/data'
import { SignalDashboard } from '@/components/moba/signal/SignalDashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Moba Signal — Competitive Intelligence',
  robots: { index: false, follow: false }, // internal, never index
}

interface PageProps {
  searchParams: Promise<{ demo?: string }>
}

export default async function MobaSignalPage({ searchParams }: PageProps) {
  // Access control (P0): shared team password, demo mode included — the
  // approved briefs and so-whats are Moba's interpretation layer.
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
          <SignalDashboard
            data={live.dataset}
            sourceLabel={`live · ${live.counts.approved} approved items${live.counts.proposed ? ` · ${live.counts.proposed} awaiting review` : ''}`}
          />
        )
      }
    } catch {
      // fall through to demo
    }
  }

  return <SignalDashboard data={SIGNAL_DEMO} sourceLabel="prototype, sample data" />
}
