import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Transition Mentor | Mark de Kock',
  description:
    'I help C-level leaders at SMEs lead their organisation through the AI transition — not with training and theory, but with a working AI use case in your own business and the strategic insight to direct your team.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'AI Transition Mentor | Mark de Kock',
    description: 'From AI curiosity to AI output. 3-month mentorship for C-level SME leaders. Max 5 per cohort.',
    url: 'https://markdekock.com/mentor',
    siteName: 'Mark de Kock',
    type: 'website',
  },
}

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
