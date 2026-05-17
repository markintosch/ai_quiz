import type { Metadata } from 'next'
import LandingClient from './LandingClient'

interface PageProps {
  searchParams?: { from?: string; time?: string; rank?: string; lang?: string }
}

const LOCALES = ['en', 'de', 'nl', 'fr', 'es'] as const
type Lang = typeof LOCALES[number]

// Title + description in 5 languages — used in OpenGraph + meta tags so a
// shared link renders the right preview text per the recipient's chosen lang.
const META = {
  en: { title: 'Nordschleife — Green Hell Time Trial',  desc: '30 trivia questions, one lap of the Green Hell. Every second you spend thinking is added to your lap time. First 3 laps free.' },
  de: { title: 'Nordschleife — Grüne Hölle Zeitfahren', desc: '30 Trivia-Fragen, eine Runde Grüne Hölle. Jede Sekunde Denkzeit zählt zur Rundenzeit. Die ersten 3 Runden gratis.' },
  nl: { title: 'Nordschleife — Groene Hel Time Trial',  desc: '30 trivia-vragen, één ronde Groene Hel. Elke seconde nadenken telt op bij je rondetijd. Eerste 3 rondes gratis.' },
  fr: { title: 'Nordschleife — Contre-la-montre de l’Enfer Vert', desc: '30 questions de trivia, un tour de l’Enfer Vert. Chaque seconde passée à réfléchir s’ajoute à votre temps. Les 3 premiers tours gratuits.' },
  es: { title: 'Nordschleife — Contrarreloj del Infierno Verde',  desc: '30 preguntas de trivia, una vuelta al Infierno Verde. Cada segundo que pienses se suma a tu vuelta. Las 3 primeras vueltas son gratis.' },
} as const satisfies Record<Lang, { title: string; desc: string }>

const CHALLENGE_TITLE: Record<Lang, (from: string, time: string) => string> = {
  en: (from, time) => `${from} set ${time} on the Nordschleife — can you beat it?`,
  de: (from, time) => `${from} fuhr ${time} auf der Nordschleife — schaffst du das?`,
  nl: (from, time) => `${from} zette ${time} op de Nordschleife — kun jij het beter?`,
  fr: (from, time) => `${from} a fait ${time} sur la Nordschleife — vous faites mieux ?`,
  es: (from, time) => `${from} marcó ${time} en la Nordschleife — ¿puedes superarlo?`,
}

// Per-URL dynamic metadata. A challenge link like
//   /nordschleife?from=Mark&time=8:32.4&rank=3&lang=de
// gets a personalised title + OG image so social previews show that exact lap
// in the right language.
export function generateMetadata({ searchParams }: PageProps): Metadata {
  const from = (searchParams?.from ?? '').slice(0, 30)
  const time = (searchParams?.time ?? '').slice(0, 16)
  const rank = (searchParams?.rank ?? '').slice(0, 5)
  const langRaw = (searchParams?.lang ?? '').slice(0, 2).toLowerCase()
  const lang: Lang = (LOCALES as readonly string[]).includes(langRaw) ? (langRaw as Lang) : 'en'

  const ogParams = new URLSearchParams()
  if (from) ogParams.set('name', from)
  if (time) ogParams.set('time', time)
  if (rank) ogParams.set('rank', rank)
  if (lang !== 'en') ogParams.set('lang', lang)
  const ogImage = `/api/nordschleife/og${ogParams.toString() ? `?${ogParams}` : ''}`

  const base = META[lang]
  const personalisedTitle = (from && time) ? CHALLENGE_TITLE[lang](from, time) : base.title

  return {
    title: personalisedTitle,
    description: base.desc,
    robots: { index: true, follow: true },
    openGraph: {
      title: personalisedTitle,
      description: base.desc,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: personalisedTitle,
      description: base.desc,
      images: [ogImage],
    },
  }
}

export default function NordschleifeLandingPage() {
  return <LandingClient />
}
