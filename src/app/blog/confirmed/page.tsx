// FILE: src/app/blog/confirmed/page.tsx
// Landing page after clicking the confirmation link in the welcome email.
// Querystring: ?status=ok|invalid|unsubscribed&lang=nl|en|de

import type { Metadata } from 'next'
import Link from 'next/link'
import { pickLang, type Lang } from '@/lib/blog/strings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:  'Inschrijving bevestigd — Mark de Kock',
  robots: { index: false, follow: true },
}

const COPY: Record<Lang, {
  okTitle:        string; okBody:        string
  invalidTitle:   string; invalidBody:   string
  unsubTitle:     string; unsubBody:     string
  backToBlog:     string
}> = {
  nl: {
    okTitle:      'Bevestigd ✓',
    okBody:       'Je bent ingeschreven. Bedankt — je krijgt de eerstvolgende post in je inbox.',
    invalidTitle: 'Link niet geldig',
    invalidBody:  'Deze bevestigingslink is verlopen of al gebruikt. Schrijf je gerust opnieuw in.',
    unsubTitle:   'Je was uitgeschreven',
    unsubBody:    'Dit adres heeft zich tussendoor uitgeschreven. Wil je toch de blog ontvangen? Schrijf je dan opnieuw in.',
    backToBlog:   '← Terug naar de blog',
  },
  en: {
    okTitle:      'Confirmed ✓',
    okBody:       'You\'re subscribed. Thanks — you\'ll get the next post in your inbox.',
    invalidTitle: 'Link not valid',
    invalidBody:  'This confirmation link has expired or been used already. You can subscribe again.',
    unsubTitle:   'You were unsubscribed',
    unsubBody:    'This address has unsubscribed in the meantime. If you want the blog after all, subscribe again.',
    backToBlog:   '← Back to the blog',
  },
  de: {
    okTitle:      'Bestätigt ✓',
    okBody:       'Du bist angemeldet. Danke — der nächste Beitrag landet in deinem Posteingang.',
    invalidTitle: 'Link nicht gültig',
    invalidBody:  'Dieser Bestätigungslink ist abgelaufen oder wurde bereits verwendet. Du kannst dich gerne erneut anmelden.',
    unsubTitle:   'Du warst abgemeldet',
    unsubBody:    'Diese Adresse hat sich zwischenzeitlich abgemeldet. Möchtest du den Blog doch erhalten? Melde dich erneut an.',
    backToBlog:   '← Zurück zum Blog',
  },
}

export default function ConfirmedPage({
  searchParams,
}: {
  searchParams: { status?: string; lang?: string }
}) {
  const lang   = pickLang(searchParams.lang)
  const status = searchParams.status === 'invalid' ? 'invalid'
              : searchParams.status === 'unsubscribed' ? 'unsubscribed'
              : 'ok'
  const t      = COPY[lang]
  const blogUrl = lang === 'nl' ? '/blog' : `/blog?lang=${lang}`

  const { title, body } =
    status === 'invalid'      ? { title: t.invalidTitle, body: t.invalidBody }
    : status === 'unsubscribed' ? { title: t.unsubTitle,   body: t.unsubBody   }
    :                              { title: t.okTitle,      body: t.okBody      }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className={
          'mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full text-2xl ' +
          (status === 'ok'
            ? 'bg-emerald-100 text-emerald-700'
            : status === 'unsubscribed'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-700')
        }>
          {status === 'ok' ? '✓' : status === 'unsubscribed' ? '↩' : '!'}
        </div>
        <h1 className="mb-3 text-3xl font-bold text-brand">{title}</h1>
        <p className="mx-auto max-w-md text-base leading-relaxed text-gray-700">{body}</p>
        <div className="mt-8">
          <Link href={blogUrl} className="text-sm font-medium text-brand-accent hover:underline">
            {t.backToBlog}
          </Link>
        </div>
      </div>
    </main>
  )
}
