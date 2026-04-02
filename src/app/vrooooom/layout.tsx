import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vrooooom Games | Viaplay F1',
  description: 'Two F1 knowledge games powered by Vrooooom on Viaplay. Play the Hot Lap time trial or join a live Vrooooom Arena session.',
  robots: { index: false, follow: false },
}

export default function VrooooomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
