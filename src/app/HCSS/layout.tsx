import type { Metadata } from 'next'

const BASE = 'https://markdekock.com'

export const metadata: Metadata = {
  title: 'HCSS | Pragmatische Cybersecurity voor het MKB',
  description:
    'Cybersecurity assessments, Security Officer as a Service en awareness trainingen voor MKB-organisaties. Persoonlijk, haalbaar, effectief.',
  metadataBase: new URL(BASE),
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE}/HCSS` },
  openGraph: {
    title: 'Hammer Cyber Security Services',
    description:
      'Pragmatische cybersecurity voor het MKB. Assessments, begeleiding en training door een ervaren specialist.',
    url: `${BASE}/HCSS`,
    siteName: 'Hammer Cyber Security Services',
    type: 'website',
    locale: 'nl_NL',
  },
}

export default function HcssLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
