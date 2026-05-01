import type { Metadata } from 'next'

// Private landing voor Sannah & Remco — niet geïndexeerd, niet gelinkt vanaf
// elders. Bereikbaar via directe URL.
export const metadata: Metadata = {
  title:       'Briefing — Sannah & Remco | Brand PWRD Media',
  description: 'Twee korte briefings: portfolio voor Sannah en online presence voor Remco.',
  robots:      { index: false, follow: false },
}

export default function SannahRemcoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
