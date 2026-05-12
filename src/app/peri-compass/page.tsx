// FILE: src/app/peri-compass/page.tsx
// Landing page voor Peri-Compass — meertalig (NL/EN/FR/DE) via ?lang=

import type { Metadata } from 'next'
import Link from 'next/link'
import { LANDING, LANG_LABELS, OG_LOCALE, pickLang, type Lang } from '@/lib/peri-compass/i18n'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { lang?: string }
}): Promise<Metadata> {
  const lang = pickLang(searchParams.lang)
  const t    = LANDING[lang]
  const canonical = lang === 'nl' ? `${BASE}/peri-compass` : `${BASE}/peri-compass?lang=${lang}`
  return {
    title:       t.metaTitle,
    description: t.metaDesc,
    alternates: {
      canonical,
      languages: {
        nl:           `${BASE}/peri-compass`,
        en:           `${BASE}/peri-compass?lang=en`,
        fr:           `${BASE}/peri-compass?lang=fr`,
        de:           `${BASE}/peri-compass?lang=de`,
        'x-default':  `${BASE}/peri-compass`,
      },
    },
    openGraph: {
      title:       t.title,
      description: t.metaDesc,
      url:         canonical,
      siteName:    'Mark de Kock — Brand PWRD Media',
      locale:      OG_LOCALE[lang],
      type:        'website',
      images:      [{ url: `${BASE}/markdekock_2026.png` }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       t.title,
      description: t.metaDesc,
    },
  }
}

export default function CompassLandingPage({
  searchParams,
}: {
  searchParams: { lang?: string; email?: string; source?: string }
}) {
  const lang = pickLang(searchParams.lang)
  const t    = LANDING[lang]
  const assessHref =
    `/peri-compass/assess?lang=${lang}` +
    (searchParams.email ? `&email=${encodeURIComponent(searchParams.email)}` : '') +
    (searchParams.source ? `&source=${encodeURIComponent(searchParams.source)}` : '')

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href={lang === 'nl' ? '/' : `/?lang=${lang}`} className="text-sm font-medium text-gray-700 hover:text-brand">
            ← markdekock.com
          </Link>
          <LangSwitcher current={lang} basePath="/peri-compass" />
        </div>
      </header>

      <section className="border-b border-gray-100 bg-gradient-to-br from-gray-50 via-white to-rose-50/30">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-accent">{t.eyebrow}</p>
          <h1 className="mb-5 text-4xl font-bold leading-tight text-brand md:text-5xl">{t.title}</h1>
          <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-gray-700">{t.intro}</p>
          <Link href={assessHref} className="inline-block rounded-md bg-brand-accent px-7 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-accent/90">
            {t.cta}
          </Link>
          <p className="mt-4 text-xs text-gray-600">{t.ctaSub}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-brand">{t.whatHeading}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {t.feat.map((f) => (
            <div key={f.num} className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="mb-3 font-mono text-xs text-brand-accent">{f.num}</p>
              <h3 className="mb-2 text-base font-bold text-brand">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-700">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="mb-4 text-2xl font-bold text-brand">{t.forWhomHeading}</h2>
          <ul className="space-y-3 text-gray-700">
            {t.forWhom.map((w, i) => (
              <li key={i}><strong className="text-brand">{w.strong}</strong> {w.text}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="mb-4 text-2xl font-bold text-brand">{t.notHeading}</h2>
        <ul className="space-y-3 text-gray-700">
          {t.notList.map((n, i) => <li key={i}>● {n}</li>)}
        </ul>
      </section>

      <section className="border-t border-gray-100 bg-brand">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <p className="mb-6 text-lg leading-relaxed text-white">{t.finalLine}</p>
          <Link href={assessHref} className="inline-block rounded-md bg-brand-accent px-7 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-accent/90">
            {t.cta}
          </Link>
        </div>
      </section>
    </main>
  )
}

function LangSwitcher({ current, basePath }: { current: Lang; basePath: string }) {
  const links: { code: Lang; href: string }[] = [
    { code: 'nl', href: basePath },
    { code: 'en', href: `${basePath}?lang=en` },
    { code: 'fr', href: `${basePath}?lang=fr` },
    { code: 'de', href: `${basePath}?lang=de` },
  ]
  return (
    <div className="flex gap-1 text-sm">
      {links.map(({ code, href }) => (
        <Link
          key={code}
          href={href}
          className={
            code === current
              ? 'rounded bg-brand px-2.5 py-1 font-semibold text-white'
              : 'rounded px-2.5 py-1 text-gray-600 hover:bg-gray-100 hover:text-brand'
          }
          title={LANG_LABELS[code]}
        >
          {code.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}
