'use client'

import { useState } from 'react'

export default function SummerCourseQuestionForm() {
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [busy,    setBusy]    = useState(false)
  const [status,  setStatus]  = useState<'idle' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setStatus('idle')
    setErrorMsg('')

    try {
      const r = await fetch('/api/summercourse/question', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ email, message }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setStatus('error')
        setErrorMsg(j.error ?? `Er ging iets mis (${r.status}).`)
      } else {
        setStatus('ok')
        setEmail('')
        setMessage('')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Netwerkfout. Probeer het zo nog eens.')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'ok') {
    return (
      <div className="sc-qform-ok">
        <h3>Dank — we hebben je vraag binnen ✓</h3>
        <p>
          Mark leest mee. Je krijgt persoonlijk antwoord op het opgegeven mailadres,
          meestal binnen één werkdag.
        </p>
        <button type="button" className="sc-btn sc-btn-ghost" onClick={() => setStatus('idle')}>
          Stel nog een vraag
        </button>
      </div>
    )
  }

  return (
    <form className="sc-qform" onSubmit={onSubmit} noValidate>
      <div className="sc-qform-row">
        <label htmlFor="sc-q-email">Je e-mailadres</label>
        <input
          id="sc-q-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="naam@bedrijf.nl"
          disabled={busy}
        />
      </div>
      <div className="sc-qform-row">
        <label htmlFor="sc-q-message">Wat is je vraag?</label>
        <textarea
          id="sc-q-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Bijvoorbeeld: kan ik aansluiten zonder programmeerervaring? Of: wat is een geschikte case voor mij?"
          maxLength={4000}
          disabled={busy}
        />
        <span className="sc-qform-counter">{message.length}/4000</span>
      </div>
      {status === 'error' && (
        <p className="sc-qform-error" role="alert">{errorMsg}</p>
      )}
      <button type="submit" className="sc-btn sc-btn-primary" disabled={busy}>
        {busy ? 'Versturen…' : 'Verstuur vraag'}
      </button>
      <p className="sc-qform-note">
        Antwoord meestal binnen één werkdag. We gebruiken je mailadres alleen voor
        deze reactie — geen nieuwsbrief.
      </p>
    </form>
  )
}
