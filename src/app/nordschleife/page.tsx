import type { Metadata } from 'next'
import LandingClient from './LandingClient'

const TITLE       = 'Nordschleife — Green Hell Time Trial'
const DESCRIPTION = '30 trivia questions, one lap of the Green Hell. Every second you spend thinking is added to your lap time. First 3 laps free.'

interface PageProps {
  searchParams?: { from?: string; time?: string; rank?: string }
}

// Per-URL dynamic metadata. A challenge link like
//   /nordschleife?from=Mark&time=8:32.4&rank=3
// gets a personalised title + OG image so social previews show that exact lap.
export function generateMetadata({ searchParams }: PageProps): Metadata {
  const from = (searchParams?.from ?? '').slice(0, 30)
  const time = (searchParams?.time ?? '').slice(0, 16)
  const rank = (searchParams?.rank ?? '').slice(0, 5)

  const ogParams = new URLSearchParams()
  if (from) ogParams.set('name', from)
  if (time) ogParams.set('time', time)
  if (rank) ogParams.set('rank', rank)
  const ogImage = `/api/nordschleife/og${ogParams.toString() ? `?${ogParams}` : ''}`

  const personalisedTitle = (from && time)
    ? `${from} set ${time} on the Nordschleife — can you beat it?`
    : TITLE

  return {
    title: personalisedTitle,
    description: DESCRIPTION,
    robots: { index: true, follow: true },
    openGraph: {
      title: personalisedTitle,
      description: DESCRIPTION,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: personalisedTitle,
      description: DESCRIPTION,
      images: [ogImage],
    },
  }
}

export default function NordschleifeLandingPage() {
  return <LandingClient />
}
