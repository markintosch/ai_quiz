import type { Metadata } from 'next'

// Atelier — Dutch-native brief-to-direction working assistant.
// Private framework page, niet geïndexeerd. Bereikbaar via directe URL.
export const metadata: Metadata = {
  title:       'Atelier — brief-to-direction werkpartner',
  description: 'Decodeer een brief, bouw een audience picture, kies referenties en genereer 2–3 directional routes voor een werksessie.',
  robots:      { index: false, follow: false },
}

export default function AtelierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
