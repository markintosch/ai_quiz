import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nordschleife — Green Hell Time Trial',
  description: '30 trivia questions, one lap of the Green Hell. Every second you spend thinking is added to your lap time. First 5 laps free.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Nordschleife — Green Hell Time Trial',
    description: '30 trivia questions, one lap of the Green Hell. Every second you spend thinking is added to your lap time.',
    type: 'website',
  },
}

export default function NordschleifeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
