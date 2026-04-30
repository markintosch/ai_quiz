import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import MentorPage from './mentor/page'

// Detect if this request is for markdekock.com
function isMentorDomain(): boolean {
  const hdrs = headers()
  const host     = hdrs.get('host')            ?? ''
  const xfwdHost = hdrs.get('x-forwarded-host') ?? ''
  return host.includes('markdekock.com') || xfwdHost.includes('markdekock.com')
}

export async function generateMetadata(): Promise<Metadata> {
  if (isMentorDomain()) {
    return {
      title: 'AI strategie & executie | Mark de Kock',
      description: 'Van AI-ambitie naar iets wat écht werkt in jouw organisatie. Persoonlijke begeleiding voor leiders. Max. 5 trajecten tegelijk.',
      openGraph: {
        title: 'Mark de Kock — AI strategie & executie',
        description: 'Van AI-ambitie naar iets wat écht werkt in jouw organisatie.',
        url: 'https://markdekock.com',
        siteName: 'markdekock.com',
        locale: 'nl_NL',
        type: 'website',
      },
    }
  }
  return {
    title: 'AI Maturity Assessment | Brand PWRD Media',
    description: 'Benchmark your AI maturity across 6 dimensions in 5 minutes. Free, instant results.',
  }
}

export default function RootPage() {
  if (isMentorDomain()) {
    return <MentorPage />
  }
  // All other domains: next-intl middleware handles locale redirect,
  // this is only reached as a fallback.
  redirect('/en')
}
