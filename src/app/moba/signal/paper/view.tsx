'use client'

// FILE: src/app/moba/signal/paper/view.tsx
// Client shell for the paper page: header, edition metadata, the shared
// PositioningPaperView components.

import type { PositioningPaper } from '@/products/moba_signal/types'
import { PositioningPaperView } from '@/components/moba/signal/Positioning'

export function PaperPageBody({ paper, names, live }: {
  paper: PositioningPaper
  names: Record<string, string>
  live: boolean
}) {
  const entityName = (id: string) => names[id] ?? id
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-3 min-w-0">
            <a href="/moba/signal" className="text-xs text-gray-400 hover:text-brand whitespace-nowrap">← Dashboard</a>
            <h1 className="text-base font-bold text-brand whitespace-nowrap">Brand &amp; Positioning Paper</h1>
          </div>
          <span className="text-[11px] text-gray-400">
            Edition {paper.edition} · {live ? 'live' : 'sample edition'} ·
            {paper.approvedAt ? ` approved ${paper.approvedAt.slice(0, 10)}` : ' draft'} · quarterly update by the Positioning agent
          </span>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <PositioningPaperView paper={paper} entityName={entityName} />
        <footer className="pt-6 pb-8 text-[11px] text-gray-400 space-y-1">
          <p>
            Structure is fixed across editions so quarters compare: snapshot, stated positioning, audience,
            proof points and channel behaviour per company; map, themes, collisions, deltas and implications
            across companies. Every profile statement links its public source.
          </p>
          <p>
            The Positioning agent drafts each quarter from public pages and approved signals; the analyst
            edits and approves in the collection console before an edition appears here.
          </p>
        </footer>
      </div>
    </main>
  )
}
