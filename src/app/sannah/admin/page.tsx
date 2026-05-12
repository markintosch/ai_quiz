// FILE: src/app/sannah/admin/page.tsx
// Sannah's eigen admin-interface — beheert haar werken + pagina's, in haar
// eigen portfolio-look (geen Mark-sidebar). Auth: Sannah-cookie OR master.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isSannahAuthorised } from '@/lib/sannah/auth'
import { createServiceClient } from '@/lib/supabase/server'
import SannahWorksManager from '@/components/admin/SannahWorksManager'
import SannahPagesEditor  from '@/components/admin/SannahPagesEditor'
import SannahLogoutButton from '@/components/sannah/LogoutButton'
import type { SannahWork, SannahPage } from '@/lib/sannah/types'

export const dynamic = 'force-dynamic'

export default async function SannahOwnAdminPage() {
  if (!(await isSannahAuthorised())) {
    redirect('/sannah/admin/login')
  }

  const sb = createServiceClient()
  const [worksRes, pagesRes] = await Promise.all([
    sb.from('sannah_works').select('*').order('position', { ascending: true }),
    sb.from('sannah_pages').select('*'),
  ])

  const works = (worksRes.data ?? []) as SannahWork[]
  const pages = (pagesRes.data ?? []) as SannahPage[]
  const order: SannahPage['page_key'][] = ['homepage', 'over_mij', 'cv', 'contact']
  const orderedPages = order
    .map(k => pages.find(p => p.page_key === k))
    .filter((p): p is SannahPage => !!p)

  const publishedCount = works.filter(w => w.is_published).length
  const draftCount     = works.length - publishedCount

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header strip — eigen kleuren via vars */}
      <header style={{
        borderBottom: '1px solid var(--sannah-border)',
        background: 'var(--sannah-nav-bg)',
        backdropFilter: 'saturate(180%) blur(8px)',
      }}>
        <div style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <h1 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--sannah-text)',
              margin: 0,
              letterSpacing: '0.02em',
            }}>
              Beheer — Sannah de&nbsp;Zwart
            </h1>
            <p style={{
              fontSize: 12,
              color: 'var(--sannah-text-muted)',
              margin: '2px 0 0',
            }}>
              Live:{' '}
              <Link href="/sannah" style={{ color: 'var(--sannah-text-muted)', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">
                /sannah ↗
              </Link>
              {' · '}
              <Link href="/sannah/en" style={{ color: 'var(--sannah-text-muted)', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">
                /sannah/en ↗
              </Link>
            </p>
          </div>
          <SannahLogoutButton />
        </div>
      </header>

      <main style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '32px 24px 80px',
      }}>
        {/* KPIs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <KPI label="Werken" value={works.length.toString()} />
          <KPI label="Gepubliceerd" value={publishedCount.toString()} />
          <KPI label="Concept" value={draftCount.toString()} />
        </div>

        {/* De bestaande managers — werken + pagina's */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          <section>
            <h2 style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--sannah-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 16,
            }}>
              Werken
            </h2>
            <SannahWorksManager works={works} />
          </section>

          <section>
            <h2 style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--sannah-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 16,
            }}>
              Pagina&apos;s — concept &amp; publish
            </h2>
            <SannahPagesEditor pages={orderedPages} />
          </section>
        </div>
      </main>
    </div>
  )
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      borderRadius: 10,
      background: 'var(--sannah-bg-soft)',
      border: '1px solid var(--sannah-border)',
      padding: '8px 14px',
    }}>
      <p style={{
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--sannah-text-muted)',
        margin: 0,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--sannah-text)',
        margin: '2px 0 0',
      }}>
        {value}
      </p>
    </div>
  )
}
