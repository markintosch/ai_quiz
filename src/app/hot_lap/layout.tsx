import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hot Lap | Vrooooom × Viaplay',
  description: 'Set the fastest lap time in the Vrooooom F1 knowledge time trial. 10 questions. Every second counts.',
  robots: { index: false, follow: false },
}

export default function HotLapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
