// FILE: src/app/sannah/page.tsx
// Werk-overzicht (NL) — Tarr-stijl vertical scroll.

import WorksGrid from '@/components/sannah/WorksGrid'
import { getPublishedWorks, getPage } from '@/lib/sannah/server'

export const dynamic = 'force-dynamic'

export default async function SannahHomePage() {
  const [works, homepage] = await Promise.all([
    getPublishedWorks(),
    getPage('homepage'),
  ])

  const intro = homepage?.body_nl?.trim()

  return (
    <>
      {intro && (
        <section style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '64px 24px 0',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: '#1a1a1a', margin: 0, whiteSpace: 'pre-wrap' }}>
            {intro}
          </p>
        </section>
      )}
      <WorksGrid works={works} emptyLabel="Werk verschijnt hier zodra het is gepubliceerd." />
    </>
  )
}
