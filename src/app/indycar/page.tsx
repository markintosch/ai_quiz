import type { Metadata } from 'next'
import LandingClient from './LandingClient'

interface PageProps {
  searchParams?: Promise<{ from?: string; time?: string; rank?: string; lang?: string }>
}

const LOCALES = ['en', 'de', 'nl', 'fr', 'es'] as const
type Lang = typeof LOCALES[number]

// Title + description in 5 languages — used in OpenGraph + meta tags so a
// shared link renders the right preview text per the recipient's chosen lang.
const META = {
  en: { title: 'IndyCar — Indy 500 Time Trial',                desc: '30 trivia questions about the Greatest Spectacle in Racing. Every second you spend thinking is added to your lap time. First 3 laps free.' },
  de: { title: 'IndyCar — Indy 500 Zeitfahren',                desc: '30 Trivia-Fragen über das größte Rennen der Welt. Jede Sekunde Denkzeit zählt zur Rundenzeit. Die ersten 3 Runden gratis.' },
  nl: { title: 'IndyCar — Indy 500 Time Trial',                desc: '30 trivia-vragen over The Greatest Spectacle in Racing. Elke seconde nadenken telt op bij je rondetijd. Eerste 3 rondes gratis.' },
  fr: { title: 'IndyCar — Contre-la-montre Indy 500',          desc: '30 questions de trivia sur le Greatest Spectacle in Racing. Chaque seconde passée à réfléchir s’ajoute à votre temps. Les 3 premiers tours gratuits.' },
  es: { title: 'IndyCar — Contrarreloj Indy 500',              desc: '30 preguntas de trivia sobre el Greatest Spectacle in Racing. Cada segundo que pienses se suma a tu vuelta. Las 3 primeras vueltas son gratis.' },
} as const satisfies Record<Lang, { title: string; desc: string }>

const CHALLENGE_TITLE: Record<Lang, (from: string, time: string) => string> = {
  en: (from, time) => `${from} set ${time} on the Indy 500 trivia — can you beat it?`,
  de: (from, time) => `${from} fuhr ${time} im Indy-500-Trivia — schaffst du das?`,
  nl: (from, time) => `${from} zette ${time} op de Indy 500-trivia — kun jij het beter?`,
  fr: (from, time) => `${from} a fait ${time} sur la trivia Indy 500 — vous faites mieux ?`,
  es: (from, time) => `${from} marcó ${time} en la trivia Indy 500 — ¿puedes superarlo?`,
}

// Per-URL dynamic metadata. A challenge link like
//   /indycar?from=Mark&time=8:32.4&rank=3&lang=de
// gets a personalised title + OG image so social previews show that exact lap
// in the right language.
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
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
  const ogImage = `/api/indycar/og${ogParams.toString() ? `?${ogParams}` : ''}`

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

export default function IndycarLandingPage() {
  return <LandingClient />
}
