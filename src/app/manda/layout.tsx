import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI & M&A Readiness Assessment | Blok, Hofstede & de Kock',
  description:
    'Does your company survive a buyer\'s lens? Ten minutes. Seven dimensions. One clear picture of your AI & M&A readiness — before the buyer, investor or board gets there first.',
  openGraph: {
    title: 'AI & M&A Readiness Assessment',
    description:
      'Seven dimensions. Two disciplines. One verdict. Take the free assessment from Blok, Hofstede & de Kock.',
    url: 'https://ai.brandpwrdmedia.nl/manda',
    siteName: 'Blok, Hofstede & de Kock',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI & M&A Readiness Assessment',
    description: 'Does your company survive a buyer\'s lens? Seven dimensions. Free. Instant results.',
  },
}

export default function MandaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
