// FILE: src/app/moba/signal/page.tsx
// ─── Moba Signal — competitive intelligence dashboard (prototype) ────────────
//
// Renders the v0 prototype against the seed dataset in
// src/products/moba_signal/data.ts. No database, no agent pipeline yet: the
// point of this build is to validate the information hierarchy and the scoring
// model before anything heavier exists (PRD phase 0).
//
// Internal only: noindexed, and the static /moba/signal segment sits outside
// the tokenised survey route. Access control moves to real auth when this
// leaves prototype.

import { SIGNAL_DEMO } from '@/products/moba_signal/data'
import { SignalDashboard } from '@/components/moba/signal/SignalDashboard'

export const metadata = {
  title: 'Moba Signal — Competitive Intelligence',
  robots: { index: false, follow: false }, // internal, never index
}

export default function MobaSignalPage() {
  return <SignalDashboard data={SIGNAL_DEMO} />
}
