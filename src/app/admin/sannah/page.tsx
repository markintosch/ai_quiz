// FILE: src/app/admin/sannah/page.tsx
// Sannah portfolio admin — werken upload/order + paginas teksten met preview-publish.

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import SannahWorksManager from '@/components/admin/SannahWorksManager'
import SannahPagesEditor from '@/components/admin/SannahPagesEditor'
import type { SannahWork, SannahPage } from '@/lib/sannah/types'

export const dynamic = 'force-dynamic'

export default async function AdminSannahPage() {
  const sb = createServiceClient()

  const [worksRes, pagesRes] = await Promise.all([
    sb.from('sannah_works').select('*').order('position', { ascending: true }),
    sb.from('sannah_pages').select('*'),
  ])

  const works = (worksRes.data ?? []) as SannahWork[]
  const pages = (pagesRes.data ?? []) as SannahPage[]
  // Display pages in fixed order
  const order: SannahPage['page_key'][] = ['homepage', 'over_mij', 'cv', 'contact']
  const orderedPages = order
    .map(k => pages.find(p => p.page_key === k))
    .filter((p): p is SannahPage => !!p)

  const publishedCount = works.filter(w => w.is_published).length
  const draftCount     = works.length - publishedCount

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Sannah De Zwart — portfolio CMS</h1>
          <p className="text-sm text-gray-600 mt-1">
            Live site:{' '}
            <Link href="/sannah" target="_blank" className="text-brand-accent underline">/sannah ↗</Link>
            {' · '}
            <Link href="/sannah/en" target="_blank" className="text-brand-accent underline">/sannah/en ↗</Link>
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <KPI label="Werken totaal" value={works.length.toString()} />
          <KPI label="Gepubliceerd" value={publishedCount.toString()} color="green" />
          <KPI label="Concept" value={draftCount.toString()} color="amber" />
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">Werken</h2>
          <SannahWorksManager works={works} />
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">Paginas — concept &amp; publish</h2>
          <SannahPagesEditor pages={orderedPages} />
        </section>
      </div>
    </div>
  )
}

function KPI({ label, value, color }: { label: string; value: string; color?: 'green' | 'amber' }) {
  const cls = color === 'green' ? 'text-green-700' : color === 'amber' ? 'text-amber-700' : 'text-brand-dark'
  return (
    <div className="rounded-xl bg-white border border-gray-200 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-600">{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${cls}`}>{value}</p>
    </div>
  )
}
