// FILE: src/app/mentor/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Server-component shell so we can run generateMetadata({ searchParams })
// per-locale. The actual page content is the client component MentorPageClient
// (it relies on framer-motion + useSearchParams + sessionStorage).
//
// Why this exists: layouts in Next 14 cannot read searchParams; only pages can.
// Without this split, /mentor?lang=en would still serve the NL OG preview
// because layout metadata can only be static.

import type { Metadata } from 'next'
import MentorPageClient from './MentorPageClient'

const BASE = 'https://markdekock.com'

type Lang = 'nl' | 'en' | 'de'

function pickLang(input: string | string[] | undefined): Lang {
  const v = Array.isArray(input) ? input[0] : input
  return v === 'en' ? 'en' : v === 'de' ? 'de' : 'nl'
}

const META: Record<Lang, {
  title:    string
  desc:     string
  ogTitle:  string
  ogDesc:   string
  twTitle:  string
  twDesc:   string
  ogLocale: string
}> = {
  nl: {
    title:    'AI strategie & executie | Mark de Kock',
    desc:     'Van AI-ambitie naar heldere richting, intern draagvlak en een eerste use case die werkt. Persoonlijke begeleiding voor senior leiders. Partner Kirk & Blackbeard. Max. 5 trajecten tegelijk.',
    ogTitle:  'Van AI-ambitie naar richting, draagvlak en een use case die werkt | Mark de Kock',
    ogDesc:   'Persoonlijke begeleiding voor senior leiders. Geen training, geen consultancy — strategische begeleiding op het punt waar ambitie concreet moet worden. Max. 5 trajecten tegelijk.',
    twTitle:  'AI strategie & executie | Mark de Kock',
    twDesc:   'Persoonlijke begeleiding voor senior leiders. Van AI-ambitie naar iets wat echt werkt.',
    ogLocale: 'nl_NL',
  },
  en: {
    title:    'AI strategy & execution | Mark de Kock',
    desc:     "From AI ambition to clear direction, internal buy-in and a first use case that actually works. Personal guidance for senior leaders. Partner at Kirk & Blackbeard. Max. 5 engagements at a time.",
    ogTitle:  'From AI ambition to direction, buy-in and a use case that works | Mark de Kock',
    ogDesc:   "Personal guidance for senior leaders. Not training, not consultancy — strategic guidance at the point where ambition has to become concrete. Max. 5 engagements at a time.",
    twTitle:  'AI strategy & execution | Mark de Kock',
    twDesc:   'Personal guidance for senior leaders. From AI ambition to something that actually works.',
    ogLocale: 'en_GB',
  },
  de: {
    title:    'KI-Strategie & Umsetzung | Mark de Kock',
    desc:     'Von KI-Ambition zu klarer Richtung, internem Rückhalt und einem ersten funktionierenden Use Case. Persönliche Begleitung für Senior Leader. Partner bei Kirk & Blackbeard. Max. 5 Engagements gleichzeitig.',
    ogTitle:  'Von KI-Ambition zu Richtung, Rückhalt und einem funktionierenden Use Case | Mark de Kock',
    ogDesc:   'Persönliche Begleitung für Senior Leader. Kein Training, keine Beratung — strategische Begleitung an dem Punkt, an dem Ambition konkret werden muss. Max. 5 Engagements gleichzeitig.',
    twTitle:  'KI-Strategie & Umsetzung | Mark de Kock',
    twDesc:   'Persönliche Begleitung für Senior Leader. Von KI-Ambition zu etwas, das wirklich funktioniert.',
    ogLocale: 'de_DE',
  },
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const lang      = pickLang(searchParams.lang)
  const m         = META[lang]
  const canonical = lang === 'nl' ? `${BASE}/mentor` : `${BASE}/mentor?lang=${lang}`

  return {
    title: m.title,
    description: m.desc,
    alternates: {
      canonical,
      languages: {
        'nl':         `${BASE}/mentor`,
        'en':         `${BASE}/mentor?lang=en`,
        'de':         `${BASE}/mentor?lang=de`,
        'x-default':  `${BASE}/mentor`,
      },
    },
    openGraph: {
      title:       m.ogTitle,
      description: m.ogDesc,
      url:         canonical,
      siteName:    'Mark de Kock',
      type:        'website',
      locale:      m.ogLocale,
    },
    twitter: {
      card:        'summary_large_image',
      title:       m.twTitle,
      description: m.twDesc,
    },
  }
}

export default function MentorPage() {
  return <MentorPageClient />
}
