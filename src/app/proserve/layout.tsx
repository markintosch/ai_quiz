import type { Metadata } from 'next'

// PREVIEW pitch page — not linked anywhere, not indexed.
// Reachable by direct URL: cloud.brandpwrdmedia.nl/proserve (or any host).
export const metadata: Metadata = {
  title:  'Proserve · Cloud Readiness Assessment + Arena Game | Mark de Kock',
  description: 'Twee tools om cloud-talent aan te trekken en kwaliteit te benchmarken. Voorstel voor Proserve.',
  robots: { index: false, follow: false },
}

export default function ProserveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
