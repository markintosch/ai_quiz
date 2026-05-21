import type { Metadata } from 'next'

const BASE = 'https://markdekock.com'

export const metadata: Metadata = {
  title: 'Verantwoord AI omarmen — introductiemiddag voor CISO, DPO & compliance',
  description:
    'Praktische introductiemiddag voor wie in zijn organisatie de guardrails voor AI moet neerzetten. Voor CISO, DPO, compliance en legal. Begeleid door Mark de Kock & Frank Meeuwsen.',
  metadataBase: new URL(BASE),
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE}/ai-governance` },
  openGraph: {
    title: 'Verantwoord AI omarmen — introductiemiddag',
    description: 'Van rem op AI naar enabler. Voor CISO, DPO, compliance en legal die verantwoorde AI-adoptie mogelijk maken.',
    url: `${BASE}/ai-governance`,
    siteName: 'Mark de Kock & Frank Meeuwsen',
    type: 'website',
    locale: 'nl_NL',
  },
}

export default function AIGovernanceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
