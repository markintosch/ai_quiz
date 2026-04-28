import type { Metadata } from 'next'

// Per-respondent results pages contain personal data — never index.
export const metadata: Metadata = {
  title:  'Jouw AI-benchmark resultaat',
  robots: { index: false, follow: false },
}

export default function AiBenchmarkResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
