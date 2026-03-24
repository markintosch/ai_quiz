import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CLL Clinical Practice Optimiser | AbbVie',
  description:
    'A non-promotional self-assessment for haematologists. Review your CLL practice across 6 clinical dimensions — patient identification, biomarkers, treatment sequencing, multidisciplinary care, therapy monitoring, and shared decision-making.',
  robots: { index: false, follow: false },
}

export default function AbbvieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
