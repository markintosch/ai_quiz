// FILE: src/app/perimenopause-compass/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Landing page voor Perimenopause Compass.
// Marketing-CTA → "Start de assessment" → /perimenopause-compass/assess
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import Link from 'next/link'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'

export const metadata: Metadata = {
  title:       'Perimenopause Compass — een nulmeting voor je dagelijkse tracking',
  description: 'Een eenmalige instap-assessment van 15 minuten. Krijg je baseline-score op 6 dimensies, drie hypothesen voor wat je ziet en een eerste experiment voor de komende 30 dagen.',
  alternates:  { canonical: `${BASE}/perimenopause-compass` },
  openGraph: {
    title:       'Perimenopause Compass',
    description: 'Een nulmeting voor je perimenopauze. 15 minuten, 6 dimensies, je startpunt voor dagelijks tracken.',
    url:         `${BASE}/perimenopause-compass`,
    siteName:    'Mark de Kock — Brand PWRD Media',
    type:        'website',
    images:      [{ url: `${BASE}/markdekock_2026.png` }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Perimenopause Compass',
    description: 'Een nulmeting voor je perimenopauze. 15 minuten, 6 dimensies.',
  },
}

export default function CompassLandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-gray-100 bg-gradient-to-br from-gray-50 via-white to-rose-50/30">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-accent">
            Een nulmeting voor je transitie
          </p>
          <h1 className="mb-5 text-4xl font-bold leading-tight text-brand md:text-5xl">
            Perimenopause Compass
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-gray-700">
            Een eenmalige assessment van 15 minuten. Daarna weet je waar je staat
            op zes dimensies, krijg je drie hypothesen die je antwoorden verklaren,
            en een eerste experiment voor de komende 30 dagen.
          </p>
          <Link
            href="/perimenopause-compass/assess"
            className="inline-block rounded-md bg-brand-accent px-7 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-accent/90"
          >
            Start je Compass →
          </Link>
          <p className="mt-4 text-xs text-gray-600">
            ~15 minuten · anoniem starten · e-mail pas bij resultaten
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-brand">Wat krijg je terug</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureBox
            num="01"
            title="Score op 6 dimensies"
            body="Symptomen · slaap · energie · stress · leefstijl · zelfkennis. Met radar-grafiek zodat je in één blik ziet waar je zit."
          />
          <FeatureBox
            num="02"
            title="Drie hypothesen"
            body="Wat verklaart wat je ervaart? Drie geformuleerde hypothesen op basis van je antwoorden. Geen diagnose — startpunten voor zelfregie."
          />
          <FeatureBox
            num="03"
            title="Eerste experiment"
            body="Eén concreet experiment voor de komende 30 dagen. Niet meer dan 5 min/dag. Iets dat zich in de Cycle app laat tracken."
          />
        </div>
      </section>

      {/* For whom */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="mb-4 text-2xl font-bold text-brand">Voor wie?</h2>
          <ul className="space-y-3 text-gray-700">
            <li><strong className="text-brand">Hoofddoelgroep:</strong> vrouwen van 40-55 die perimenopauze ervaren — vermoed of vastgesteld — en hun lichaam beter willen begrijpen.</li>
            <li><strong className="text-brand">Tweede groep:</strong> vrouwen met regelmatige cyclus die patronen rond hun cyclus willen leren herkennen.</li>
            <li><strong className="text-brand">Voor wie geschikt:</strong> mensen die bereid zijn 60 seconden per dag in een check-in te steken. Niet voor wie alleen een "test" wil zonder vervolg.</li>
          </ul>
        </div>
      </section>

      {/* What it isn't */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="mb-4 text-2xl font-bold text-brand">Wat dit niet is</h2>
        <ul className="space-y-3 text-gray-700">
          <li>● Geen medische diagnose. We schrijven niets voor en stellen geen toestand vast.</li>
          <li>● Geen vervanging voor je huisarts of menopauze-arts.</li>
          <li>● Geen therapeutische ruimte. Voor zware mentale klachten: zoek persoonlijke begeleiding.</li>
          <li>● Geen dataverkoop — je antwoorden blijven privé en zijn alleen toegankelijk voor jou en Mark de Kock (eigenaar).</li>
        </ul>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-100 bg-brand">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <p className="mb-6 text-lg leading-relaxed text-white">
            Klaar voor je nulmeting?
          </p>
          <Link
            href="/perimenopause-compass/assess"
            className="inline-block rounded-md bg-brand-accent px-7 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-accent/90"
          >
            Start je Compass →
          </Link>
        </div>
      </section>
    </main>
  )
}

function FeatureBox({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <p className="mb-3 font-mono text-xs text-brand-accent">{num}</p>
      <h3 className="mb-2 text-base font-bold text-brand">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-700">{body}</p>
    </div>
  )
}
