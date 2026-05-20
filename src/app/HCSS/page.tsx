// FILE: src/app/HCSS/page.tsx
// Landing voor HCSS Cyber Compass.

import type { Metadata } from 'next'
import Link from 'next/link'
import { LANDING, BRAND, pickLang, type Lang } from '@/lib/cyber-compass/i18n'
import { createServiceClient } from '@/lib/supabase/server'

const BASE = 'https://markdekock.com'

type Testimonial = { quote: string; role: string }

// CMS override for the testimonials block, editable via /admin/hcss and stored
// in site_content (product_key 'hcss', per locale). Falls back to the i18n
// defaults when no row exists or the platform is unreachable.
async function loadTestimonials(lang: Lang): Promise<{ heading?: string; items?: Testimonial[] }> {
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('site_content')
      .select('content')
      .eq('locale', lang)
      .eq('product_key', 'hcss')
      .single() as { data: { content: { testimonialsHeading?: string; testimonials?: Testimonial[] } } | null }
    const c = data?.content
    return { heading: c?.testimonialsHeading, items: c?.testimonials }
  } catch {
    return {}
  }
}

export async function generateMetadata(
  props: {
    searchParams: Promise<{ lang?: string }>
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const lang = pickLang(searchParams.lang)
  const t    = LANDING[lang]
  const canonical = lang === 'nl' ? `${BASE}/HCSS` : `${BASE}/HCSS?lang=${lang}`
  return {
    title:       t.metaTitle,
    description: t.metaDesc,
    alternates: {
      canonical,
      languages: {
        nl: `${BASE}/HCSS`,
        en: `${BASE}/HCSS?lang=en`,
        'x-default': `${BASE}/HCSS`,
      },
    },
    openGraph: {
      title:       t.title,
      description: t.metaDesc,
      url:         canonical,
      siteName:    `${BRAND.ownerLong} · ${BRAND.productName}`,
      type:        'website',
    },
    twitter: { card: 'summary_large_image', title: t.title, description: t.metaDesc },
  }
}

export default async function CyberCompassLandingPage(
  props: {
    searchParams: Promise<{ lang?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const lang = pickLang(searchParams.lang)
  const t    = LANDING[lang]
  const assessHref = `/HCSS/assess${lang === 'nl' ? '' : '?lang=' + lang}`

  const tmOverride = await loadTestimonials(lang)
  const testimonialsHeading = tmOverride.heading ?? t.testimonialsHeading
  const testimonials = (tmOverride.items && tmOverride.items.length > 0) ? tmOverride.items : t.testimonials

  return (
    <main className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-brand">
            ← markdekock.com
          </Link>
          <LangSwitcher current={lang} />
        </div>
      </header>

      {/* Hero — HCSS branding kleur */}
      <section className="border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f0f4f8 100%)' }}>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#1f3a4a' }}>{t.eyebrow}</p>
          <h1 className="mb-5 text-4xl font-bold leading-tight md:text-5xl" style={{ color: '#1f3a4a' }}>{t.title}</h1>
          <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-gray-700">{t.intro}</p>
          <Link
            href={assessHref}
            className="inline-block rounded-md px-7 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:opacity-90"
            style={{ background: '#E8611A' }}
          >
            {t.cta}
          </Link>
          <p className="mt-4 text-xs text-gray-600">{t.ctaSub}</p>
        </div>
      </section>

      {/* What you get back */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold" style={{ color: '#1f3a4a' }}>{t.whatHeading}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.feat.map((f) => (
            <div key={f.num} className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="mb-3 font-mono text-xs" style={{ color: '#E8611A' }}>{f.num}</p>
              <h3 className="mb-2 text-base font-bold" style={{ color: '#1f3a4a' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-700">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — role-attributed, no names. CMS-editable via /admin/hcss */}
      {testimonials.length > 0 && (
        <section className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="mb-8 text-center text-2xl font-bold" style={{ color: '#1f3a4a' }}>{testimonialsHeading}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((tm, i) => (
                <figure key={i} className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6">
                  <span aria-hidden="true" className="mb-3 text-3xl leading-none" style={{ color: '#E8611A' }}>&ldquo;</span>
                  <blockquote className="mb-4 flex-1 text-sm leading-relaxed text-gray-700">{tm.quote}</blockquote>
                  <figcaption className="text-xs font-medium" style={{ color: '#1f3a4a' }}>{tm.role}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* For whom */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="mb-4 text-2xl font-bold" style={{ color: '#1f3a4a' }}>{t.forWhomHeading}</h2>
          <ul className="space-y-3 text-gray-700">
            {t.forWhom.map((w, i) => (
              <li key={i}><strong style={{ color: '#1f3a4a' }}>{w.strong}</strong> {w.text}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* What it isn't */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="mb-4 text-2xl font-bold" style={{ color: '#1f3a4a' }}>{t.notHeading}</h2>
        <ul className="space-y-3 text-gray-700">
          {t.notList.map((n, i) => <li key={i}>● {n}</li>)}
        </ul>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-100" style={{ background: '#1f3a4a' }}>
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <p className="mb-6 text-lg leading-relaxed text-white">{t.finalLine}</p>
          <Link
            href={assessHref}
            className="inline-block rounded-md px-7 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:opacity-90"
            style={{ background: '#E8611A' }}
          >
            {t.cta}
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-8 text-center text-xs text-gray-600">
          {t.ownedBy}
        </div>
      </footer>
    </main>
  )
}

function LangSwitcher({ current }: { current: Lang }) {
  return (
    <div className="flex gap-1 text-sm">
      {(['nl','en'] as const).map((code) => (
        <Link
          key={code}
          href={code === 'nl' ? '/HCSS' : `/HCSS?lang=${code}`}
          className={
            code === current
              ? 'rounded px-2.5 py-1 font-semibold text-white'
              : 'rounded px-2.5 py-1 text-gray-600 hover:bg-gray-100'
          }
          style={code === current ? { background: '#1f3a4a' } : undefined}
        >
          {code.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}
