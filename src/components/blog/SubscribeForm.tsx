// FILE: src/components/blog/SubscribeForm.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Newsletter signup form for the blog (drop-in card).
//
// Fields:
//   - email
//   - AVG checkbox (verplicht; getoonde tekst wordt mee verstuurd voor audit)
//
// States: idle → submitting → success | error
//
// Calls POST /api/blog/subscribe and on success shows a "check je inbox" message.
// Geen leak: bij "al ingeschreven" toont de API ook gewoon "ok" — wij tonen
// dezelfde succes-boodschap.
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useState } from 'react'

type Lang = 'nl' | 'en' | 'de'

interface Props {
  lang:          Lang
  sourcePath?:   string                     // bijv. '/blog' of '/blog/post-slug'
  sourcePostId?: string                     // optionally pin to a specific post
  variant?:      'card' | 'inline'          // visual variant
  className?:    string
}

const COPY: Record<Lang, {
  title:        string
  subtitle:     string
  emailLabel:   string
  emailPlaceholder: string
  consentLabel: (privacyUrl: string, privacyLabel: string) => React.ReactNode
  privacyLabel: string
  submit:       string
  submitting:   string
  successTitle: string
  successBody:  string
  errorBody:    string
  rateLimit:    string
}> = {
  nl: {
    title:        'Krijg de blog in je inbox',
    subtitle:     'Korte updates en lange essays. Geen spam, makkelijk uitschrijven.',
    emailLabel:   'E-mailadres',
    emailPlaceholder: 'naam@bedrijf.nl',
    consentLabel: (url, label) => (
      <>Ik ga akkoord met het <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand">{label}</a> en het ontvangen van de blog per e-mail.</>
    ),
    privacyLabel: 'privacybeleid',
    submit:       'Inschrijven',
    submitting:   'Versturen…',
    successTitle: 'Bevestig je inschrijving in je inbox',
    successBody:  'Ik heb je een bevestigingsmail gestuurd. Klik op de link erin om je adres te bevestigen — daarna ben je officieel ingeschreven.',
    errorBody:    'Er ging iets mis. Probeer het zo opnieuw.',
    rateLimit:    'Te veel pogingen vanaf dit adres. Probeer het over een uurtje opnieuw.',
  },
  en: {
    title:        'Get the blog in your inbox',
    subtitle:     'Short updates and long essays. No spam, easy to unsubscribe.',
    emailLabel:   'Email',
    emailPlaceholder: 'name@company.com',
    consentLabel: (url, label) => (
      <>I agree with the <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand">{label}</a> and to receive the blog by email.</>
    ),
    privacyLabel: 'privacy policy',
    submit:       'Subscribe',
    submitting:   'Sending…',
    successTitle: 'Confirm your subscription in your inbox',
    successBody:  'I\'ve sent you a confirmation email. Click the link inside to verify your address — then you\'re officially in.',
    errorBody:    'Something went wrong. Please try again.',
    rateLimit:    'Too many attempts from this address. Try again in an hour.',
  },
  de: {
    title:        'Hol dir den Blog in deine Inbox',
    subtitle:     'Kurze Updates und längere Essays. Kein Spam, einfach abzubestellen.',
    emailLabel:   'E-Mail',
    emailPlaceholder: 'name@firma.de',
    consentLabel: (url, label) => (
      <>Ich akzeptiere die <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand">{label}</a> und stimme dem Empfang des Blogs per E-Mail zu.</>
    ),
    privacyLabel: 'Datenschutzerklärung',
    submit:       'Anmelden',
    submitting:   'Wird gesendet…',
    successTitle: 'Bestätige dein Abonnement in deinem Posteingang',
    successBody:  'Ich habe dir eine Bestätigungsmail geschickt. Klicke auf den Link darin, um deine Adresse zu bestätigen — dann bist du offiziell dabei.',
    errorBody:    'Etwas ist schiefgegangen. Bitte versuche es erneut.',
    rateLimit:    'Zu viele Versuche von dieser Adresse. Versuche es in einer Stunde erneut.',
  },
}

const PRIVACY_URL = '/privacy'

/**
 * Compose the canonical consent text — exactly what the user sees,
 * stored as proof of opt-in. Keep this in sync with what the label renders.
 */
function consentTextFor(lang: Lang): string {
  switch (lang) {
    case 'nl': return 'Ik ga akkoord met het privacybeleid en het ontvangen van de blog per e-mail.'
    case 'en': return 'I agree with the privacy policy and to receive the blog by email.'
    case 'de': return 'Ich akzeptiere die Datenschutzerklärung und stimme dem Empfang des Blogs per E-Mail zu.'
  }
}

export default function SubscribeForm({
  lang, sourcePath, sourcePostId, variant = 'card', className = '',
}: Props) {
  const t = COPY[lang]
  const [email,    setEmail]    = useState('')
  const [consent,  setConsent]  = useState(false)
  const [state,    setState]    = useState<'idle'|'submitting'|'success'|'error'|'ratelimit'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'submitting') return
    if (!consent) return                                           // checkbox is required attribute too
    setState('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/blog/subscribe', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({
          email:        email.trim(),
          locale:       lang,
          consent:      true,
          consentText:  consentTextFor(lang),
          sourcePath,
          sourcePostId,
        }),
      })
      if (res.status === 429) {
        setState('ratelimit')
        return
      }
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg(j.error ?? t.errorBody)
        setState('error')
        return
      }
      setState('success')
    } catch {
      setErrorMsg(t.errorBody)
      setState('error')
    }
  }

  // ── Success state ─────────────────────────────────────────────────
  if (state === 'success') {
    return (
      <div className={cardClass(variant) + ' ' + className}>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            ✓
          </div>
          <div>
            <h3 className="mb-1 text-base font-semibold text-brand">{t.successTitle}</h3>
            <p className="text-sm leading-relaxed text-gray-700">{t.successBody}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────
  return (
    <form onSubmit={onSubmit} className={cardClass(variant) + ' ' + className}>
      <h3 className="mb-1 text-lg font-bold text-brand">{t.title}</h3>
      <p className="mb-4 text-sm text-gray-600">{t.subtitle}</p>

      <label className="mb-3 block">
        <span className="sr-only">{t.emailLabel}</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      </label>

      <label className="mb-4 flex items-start gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 cursor-pointer accent-brand-accent"
        />
        <span className="leading-relaxed">
          {t.consentLabel(PRIVACY_URL, t.privacyLabel)}
        </span>
      </label>

      <button
        type="submit"
        disabled={state === 'submitting' || !consent}
        className="w-full rounded-md bg-brand-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === 'submitting' ? t.submitting : t.submit}
      </button>

      {state === 'error' && (
        <p className="mt-3 text-xs text-red-700">
          {errorMsg || t.errorBody}
        </p>
      )}
      {state === 'ratelimit' && (
        <p className="mt-3 text-xs text-amber-800">{t.rateLimit}</p>
      )}
    </form>
  )
}

function cardClass(variant: 'card' | 'inline'): string {
  if (variant === 'inline') {
    return 'rounded-lg border border-gray-200 bg-white p-5'
  }
  return 'rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm'
}
