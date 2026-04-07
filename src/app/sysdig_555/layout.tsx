import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '555 Games | Sysdig × Brand PWRD Media',
  description: 'Two ways to make cloud security knowledge stick: the 555 Time Trial (solo speed challenge) and the Live Arena (multiplayer conference game). Built for Sysdig demand gen and events.',
  robots: { index: false, follow: false },
}

export default function Sysdig555Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
