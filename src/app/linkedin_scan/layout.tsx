import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LinkedIn Recruiter Scan · Bas Westland',
  description: 'Hoe effectief gebruik jij LinkedIn voor recruitment? 15 vragen, 5 dimensies, één concreet scorekaart.',
  robots: { index: false, follow: false },
}

export default function LinkedInScanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
