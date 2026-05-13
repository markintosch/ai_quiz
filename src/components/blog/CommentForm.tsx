// FILE: src/components/blog/CommentForm.tsx
// Reactieformulier — naam + e-mail + tekst + AVG vinkje. Verstuurt naar
// /api/blog/comments. Toont moderatie-uitleg na succesvolle submit.

'use client'

import { useState } from 'react'
import { STRINGS, type Lang } from '@/lib/blog/strings'

interface Props {
  postId: string
  lang:   Lang
}

export default function CommentForm({ postId, lang }: Props) {
  const t = STRINGS[lang]
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [body,    setBody]    = useState('')
  const [consent, setConsent] = useState(false)
  const [state,   setState]   = useState<'idle'|'submitting'|'success'|'error'>('idle')
  const [errMsg,  setErrMsg]  = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'submitting') return
    setErrMsg(null)
    if (!name.trim() || !email.trim() || !body.trim() || !consent) {
      setErrMsg(t.cFormErrorRequired); return
    }
    setState('submitting')
    try {
      const r = await fetch('/api/blog/comments', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({
          post_id:      postId,
          author_name:  name.trim(),
          author_email: email.trim(),
          body:         body.trim(),
          consent:      true,
          consent_text: t.cFormConsentTextStored,
        }),
      })
      const j = await r.json().catch(() => ({})) as { ok?: boolean; error?: string }
      if (r.status === 429) { setErrMsg(t.cFormErrorRate); setState('error'); return }
      if (j.error === 'invalid_email')   { setErrMsg(t.cFormErrorEmail);    setState('error'); return }
      if (j.error === 'required_fields' || j.error === 'consent_required') { setErrMsg(t.cFormErrorRequired); setState('error'); return }
      if (!r.ok || !j.ok) { setErrMsg(t.cFormError); setState('error'); return }
      setState('success')
    } catch {
      setErrMsg(t.cFormError); setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-medium text-emerald-900">✓ {t.cFormSuccess}</p>
        <p className="mt-2 text-xs text-emerald-800">{t.commentsHidden}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-brand">{t.cFormHeading}</h3>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-700">{t.cFormName}</span>
          <input
            type="text" required maxLength={80}
            value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-700">{t.cFormEmail}</span>
          <input
            type="email" required maxLength={254}
            value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          />
          <span className="mt-1 block text-[11px] text-gray-600">{t.cFormEmailHint}</span>
        </label>
      </div>

      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-medium text-gray-700">{t.cFormBody}</span>
        <textarea
          required maxLength={4000} rows={4}
          value={body} onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      </label>

      <label className="mb-4 flex items-start gap-2 text-xs text-gray-700">
        <input
          type="checkbox" required
          checked={consent} onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 cursor-pointer accent-brand-accent"
        />
        <span className="leading-relaxed">{t.cFormConsent}</span>
      </label>

      <button
        type="submit"
        disabled={state === 'submitting' || !name || !email || !body || !consent}
        className="rounded-md bg-brand-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === 'submitting' ? t.cFormSubmitting : t.cFormSubmit}
      </button>

      {errMsg && (
        <p className="mt-3 text-xs text-red-700">{errMsg}</p>
      )}
    </form>
  )
}
