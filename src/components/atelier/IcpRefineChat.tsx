// FILE: src/components/atelier/IcpRefineChat.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Chat panel on the ICP detail page. Sends the user's question to the refine
// endpoint, which returns a narrative answer + an updated full ICP. We
// optimistically append to the visible history and call router.refresh()
// so the parent re-fetches the typed columns to show the updated state.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface HistoryEntry {
  question:   string
  answer:     string
  refined_at: string
}

interface Props {
  icpId:           string
  initialHistory:  HistoryEntry[]
}

export default function IcpRefineChat({ icpId, initialHistory }: Props) {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory)
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (busy || question.trim().length < 2) return
    const q = question.trim()
    setQuestion('')
    setBusy(true)
    setError('')

    try {
      const res = await fetch(`/api/atelier/icps/${icpId}/refine`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: q }),
      })
      const json = await res.json() as { answer?: string; refined_at?: string; error?: string }
      if (!res.ok || !json.answer || !json.refined_at) {
        setError(json.error || 'Refine mislukt.')
        setQuestion(q)  // restore so user can retry
      } else {
        setHistory(prev => [...prev, { question: q, answer: json.answer!, refined_at: json.refined_at! }])
        // Refresh the server-rendered ICP fields above
        router.refresh()
      }
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.')
      setQuestion(q)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl bg-white border border-stone-200 p-6">
      <header className="mb-4">
        <h2 className="text-xl font-bold text-brand-dark">Doorvragen</h2>
        <p className="text-sm text-slate-600">
          Vraag of vraag aanpassingen — de ICP hierboven wordt direct bijgewerkt. Eerdere vragen blijven zichtbaar.
        </p>
      </header>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-4 mb-5 max-h-[400px] overflow-y-auto pr-2">
          {history.map((h, i) => (
            <div key={i} className="space-y-2">
              <div className="rounded-xl bg-stone-50 border border-stone-100 px-4 py-2 text-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Jij</p>
                <p className="text-slate-800">{h.question}</p>
              </div>
              <div className="rounded-xl bg-amber-50/50 border border-amber-100 px-4 py-2 text-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1">Atelier</p>
                <p className="text-slate-800 leading-relaxed">{h.answer}</p>
                <p className="text-[10px] text-slate-400 mt-1">{new Date(h.refined_at).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex flex-col gap-2">
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Bv. &quot;Voeg een trigger toe rond AI-skepsis bij oudere managers&quot; of &quot;Maak hem specifiek voor MKB-retail in Nederland&quot;"
          rows={3}
          maxLength={1000}
          disabled={busy}
          className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-sm focus:outline-none focus:border-brand-accent transition-colors resize-y"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleSend(e)
            }
          }}
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-500">
            ⌘/Ctrl + Enter om te versturen.
          </p>
          <button
            type="submit"
            disabled={busy || question.trim().length < 2}
            className="px-5 py-2 rounded-xl bg-brand-dark text-white text-sm font-semibold hover:bg-brand-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {busy ? 'Bezig…' : 'Verfijn ICP →'}
          </button>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>
    </section>
  )
}
