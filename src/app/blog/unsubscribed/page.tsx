// FILE: src/app/blog/unsubscribed/page.tsx
// Landing after the unsubscribe link in any blog email.
// Querystring: ?status=ok|invalid&lang=nl|en|de

import type { Metadata } from 'next'
import Link from 'next/link'
import { pickLang, type Lang } from '@/lib/blog/strings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:  'Uitgeschreven — Mark de Kock',
  robots: { index: false, follow: true },
}

const COPY: Record<Lang, {
  okTitle:      string; okBody:      string
  invalidTitle: string; invalidBody: string
  backToBlog:   string
  feedbackHint: string
}> = {
  nl: {
    okTitle:      'Uitgeschreven',
    okBody:       'Je krijgt geen mails meer van de blog. Geen gedoe, geen vragen.',
    invalidTitle: 'Link niet geldig',
    invalidBody:  'Deze uitschrijflink is niet meer geldig of bestaat niet. Mogelijk al uitgeschreven.',
    backToBlog:   '← Terug naar de blog',
    feedbackHint: 'Reden om uit te schrijven? Stuur me een mail — ik luister graag.',
  },
  en: {
    okTitle:      'Unsubscribed',
    okBody:       'You won\'t receive blog emails anymore. No fuss, no questions.',
    invalidTitle: 'Link not valid',
    invalidBody:  'This unsubscribe link is no longer valid or doesn\'t exist. Possibly already unsubscribed.',
    backToBlog:   '← Back to the blog',
    feedbackHint: 'Reason for unsubscribing? Send me a quick note — I\'m happy to hear it.',
  },
  de: {
    okTitle:      'Abgemeldet',
    okBody:       'Du erhältst keine Blog-Mails mehr. Kein Aufhebens, keine Fragen.',
    invalidTitle: 'Link nicht gültig',
    invalidBody:  'Dieser Abmeldelink ist nicht mehr gültig oder existiert nicht. Möglicherweise schon abgemeldet.',
    backToBlog:   '← Zurück zum Blog',
    feedbackHint: 'Grund für die Abmeldung? Schreib mir kurz — ich höre gern zu.',
  },
}

export default function UnsubscribedPage({
  searchParams,
}: {
  searchParams: { status?: string; lang?: string }
}) {
  const lang   = pickLang(searchParams.lang)
  const status = searchParams.status === 'invalid' ? 'invalid' : 'ok'
  const t      = COPY[lang]
  const blogUrl = lang === 'nl' ? '/blog' : `/blog?lang=${lang}`

  const { title, body } = status === 'invalid'
    ? { title: t.invalidTitle, body: t.invalidBody }
    : { title: t.okTitle,      body: t.okBody      }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-700">
          ✓
        </div>
        <h1 className="mb-3 text-3xl font-bold text-brand">{title}</h1>
        <p className="mx-auto mb-6 max-w-md text-base leading-relaxed text-gray-700">{body}</p>
        {status === 'ok' && (
          <p className="mx-auto max-w-md text-sm text-gray-600">
            {t.feedbackHint}{' '}
            <a href="mailto:mark@brandpwrdmedia.com" className="font-medium text-brand-accent underline underline-offset-2">
              mark@brandpwrdmedia.com
            </a>
          </p>
        )}
        <div className="mt-8">
          <Link href={blogUrl} className="text-sm font-medium text-brand-accent hover:underline">
            {t.backToBlog}
          </Link>
        </div>
      </div>
    </main>
  )
}
