import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Match Engine · e-people',
  description: 'Twee profielen. Één gespreksbasis. Kandidaat + vacature gematcht in minuten.',
  robots: { index: false, follow: false },
}

export default function MatchEngineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
