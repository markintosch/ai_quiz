// FILE: src/components/peri-compass/ShareActions.tsx
// Client-component voor de results page: kopieer-link + (optioneel) email-form
// Voor anonieme afnames toon je het email-form, voor afnames met email alleen kopieer-link.

'use client'

import { useState } from 'react'
import type { Lang } from '@/lib/peri-compass/i18n'

interface Props {
  assessmentId:    string
  hasEmail:        boolean
  lang:            Lang
  t: {
    copyLink:        string
    copyLinkDone:    string
    emailMeResults:  string
    emailLabel:      string
    emailPlaceholder:string
    emailConsentText:string
    emailSendBtn:    string
    emailSending:    string
    emailSentOk:     string
    emailSentErr:    string
  }
}

export default function ShareActions({ assessmentId, hasEmail, lang, t }: Props) {
  const [copied, setCopied] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail]     = useState('')
  const [consent, setConsent] = useState(false)
  const [state, setState]     = useState<'idle'|'sending'|'sent'|'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback: select-and-copy fail silently
    }
  }

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'sending') return
    if (!consent) return
    setState('sending')
    setErrorMsg('')
    try {
      const r = await fetch('/api/peri-compass/email-results', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({
          id:           assessmentId,
          email:        email.trim(),
          consent:      true,
          consentText:  t.emailConsentText,
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setErrorMsg(j.error ?? t.emailSentErr)
        setState('error')
        return
      }
      setState('sent')
    } catch {
      setErrorMsg(t.emailSentErr)
      setState('error')
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-center gap-3">
      <button
        type="button"
        onClick={copyLink}
        className={
          'rounded-md border px-4 py-2 text-sm font-medium transition-colors ' +
          (copied
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50')
        }
      >
        {copied ? t.copyLinkDone : t.copyLink}
      </button>

      {!hasEmail && (
        <>
          <button
            type="button"
            onClick={() => setShowEmailForm((v) => !v)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ✉ {t.emailMeResults}
          </button>

          {showEmailForm && (
            <form
              onSubmit={sendEmail}
              className="basis-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-left"
            >
              {state === 'sent' ? (
                <p className="text-sm text-emerald-800">{t.emailSentOk}</p>
              ) : (
                <>
                  <label className="mb-3 block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                      {t.emailLabel}
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      autoComplete="email"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                    />
                  </label>
                  <label className="mb-3 flex items-start gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 cursor-pointer accent-brand-accent"
                    />
                    <span className="leading-relaxed">{t.emailConsentText}</span>
                  </label>
                  <button
                    type="submit"
                    disabled={state === 'sending' || !consent}
                    className="rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {state === 'sending' ? t.emailSending : t.emailSendBtn}
                  </button>
                  {state === 'error' && (
                    <p className="mt-2 text-xs text-red-700">{errorMsg || t.emailSentErr}</p>
                  )}
                </>
              )}
            </form>
          )}
        </>
      )}
    </div>
  )
}
