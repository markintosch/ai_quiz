'use client'

// FILE: src/components/sannahremco/BriefingForm.tsx
// Schema-driven briefing form for Sannah & Remco. Handles all question types
// (text, textarea, single, multi, rank, inspiration, upload), tracks state,
// uploads files via /api/sannahremco/upload, submits to /api/sannahremco/submit.

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import type { Schema, Question, Answers, Upload } from './types'

const OTHER_PREFIX = 'other:'

interface Props {
  schema: Schema
}

export default function BriefingForm({ schema }: Props) {
  const [answers, setAnswers] = useState<Answers>({})
  const [uploads, setUploads] = useState<Upload[]>([])
  const [otherText, setOtherText] = useState<Record<string, string>>({})    // key: question.id → "Anders" text
  const [revealText, setRevealText] = useState<Record<string, string>>({})  // key: question.id → reveal-on-option text
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setAnswer = useCallback((id: string, value: Answers[string]) => {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }, [])

  // Validation: every required question must have a value
  const missingRequired = useMemo(() => {
    const missing: string[] = []
    for (const q of schema.questions) {
      if (!('required' in q) || !q.required) continue
      const v = answers[q.id]
      if (q.type === 'multi') {
        if (!Array.isArray(v) || v.length === 0) missing.push(q.label)
      } else if (q.type === 'rank') {
        const r = v as Record<string, number | null> | undefined
        if (!r || !Object.values(r).some(n => typeof n === 'number')) missing.push(q.label)
      } else {
        if (typeof v !== 'string' || !v.trim()) missing.push(q.label)
      }
    }
    return missing
  }, [answers, schema.questions])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (missingRequired.length > 0) {
      setError(`Vul nog deze verplichte vragen in: ${missingRequired.slice(0, 3).join(' · ')}${missingRequired.length > 3 ? ` (+${missingRequired.length - 3})` : ''}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)

    // Build the payload: merge `otherText` and `revealText` into the final answers
    const payload: Record<string, unknown> = {}
    for (const q of schema.questions) {
      if (q.type === 'section') continue
      if (q.type === 'upload')  continue   // uploads are stored separately
      const v = answers[q.id]

      if (q.type === 'single') {
        let val = (typeof v === 'string') ? v : ''
        if (val === 'other' && otherText[q.id]) val = `${OTHER_PREFIX}${otherText[q.id]}`
        const reveal = (q.revealText && q.revealText[val]) ? revealText[q.id] ?? '' : ''
        payload[q.id] = reveal ? { value: val, detail: reveal } : val

      } else if (q.type === 'multi') {
        const arr = Array.isArray(v) ? [...v] : []
        if (arr.includes('other') && otherText[q.id]) {
          const idx = arr.indexOf('other')
          arr[idx] = `${OTHER_PREFIX}${otherText[q.id]}`
        }
        payload[q.id] = arr

      } else {
        payload[q.id] = v ?? ''
      }
    }

    const name  = (answers['meta.name']  as string) || ''
    const email = (answers['meta.email'] as string) || ''

    try {
      const res = await fetch('/api/sannahremco/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefing_type: schema.briefingType,
          name,
          email,
          payload,
          uploads,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success state ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/40">
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="text-6xl mb-6" aria-hidden>✓</div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Bedankt!</h1>
          <p className="text-lg text-slate-700 mb-2">
            Je antwoorden zijn opgeslagen. Mark krijgt een seintje en neemt contact op voor een vervolg.
          </p>
          <p className="text-sm text-slate-500 mb-10">
            Je mag dit venster sluiten — er is niks meer wat je hoeft te doen.
          </p>
          <Link
            href="/SannahRemco"
            className="inline-flex items-center gap-2 bg-brand-dark text-white font-semibold px-6 py-3 rounded-full hover:bg-brand-accent transition-colors"
          >
            ← Terug naar overzicht
          </Link>
        </div>
      </div>
    )
  }

  // ── Form ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/40">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">

        <Link
          href="/SannahRemco"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-accent mb-8"
        >
          ← Terug naar overzicht
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-3 leading-tight">
          {schema.title}
        </h1>
        <p className="text-slate-700 leading-relaxed mb-10">{schema.intro}</p>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {schema.questions.map(q => (
            <QuestionField
              key={q.id}
              q={q}
              value={answers[q.id]}
              onChange={(v) => setAnswer(q.id, v)}
              otherText={otherText[q.id] ?? ''}
              onOtherText={(t) => setOtherText(prev => ({ ...prev, [q.id]: t }))}
              revealText={revealText[q.id] ?? ''}
              onRevealText={(t) => setRevealText(prev => ({ ...prev, [q.id]: t }))}
              briefingType={schema.briefingType}
              uploads={uploads}
              onUploadsChange={setUploads}
            />
          ))}

          <div className="pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto bg-brand-dark text-white font-semibold px-8 py-4 rounded-full hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Bezig met versturen...' : 'Briefing versturen →'}
            </button>
            <p className="text-xs text-slate-500 mt-4">
              Door op versturen te klikken, sla je je antwoorden op zodat Mark ermee aan de slag kan.
              Alleen Mark heeft toegang.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Single question renderer ──────────────────────────────────────────────

interface FieldProps {
  q: Question
  value: Answers[string]
  onChange: (v: Answers[string]) => void
  otherText: string
  onOtherText: (t: string) => void
  revealText: string
  onRevealText: (t: string) => void
  briefingType: Schema['briefingType']
  uploads: Upload[]
  onUploadsChange: (u: Upload[]) => void
}

function QuestionField(props: FieldProps) {
  const { q } = props

  switch (q.type) {
    case 'section':
      return <SectionHeader q={q} />
    case 'text':
    case 'email':
      return <TextField {...props} q={q} />
    case 'textarea':
      return <TextareaField {...props} q={q} />
    case 'single':
      return <SingleField {...props} q={q} />
    case 'multi':
      return <MultiField {...props} q={q} />
    case 'rank':
      return <RankField {...props} q={q} />
    case 'inspiration':
      return <InspirationField {...props} q={q} />
    case 'upload':
      return <UploadField {...props} q={q} />
  }
}

// ── Subfield: section header ──
function SectionHeader({ q }: { q: Extract<Question, { type: 'section' }> }) {
  return (
    <div className="pt-6 pb-2 border-b border-slate-200">
      <h2 className="text-xs font-bold tracking-widest text-brand-accent uppercase">{q.label}</h2>
      {q.description && <p className="text-sm text-slate-600 mt-2">{q.description}</p>}
    </div>
  )
}

// ── Subfield: label + help text wrapper ──
function FieldShell({ q, children }: {
  q: Extract<Question, { label: string; help?: string; required?: boolean }>
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-base font-semibold text-brand-dark mb-1">
        {q.label}
        {('required' in q && q.required) && <span className="text-brand-accent ml-1">*</span>}
      </label>
      {('help' in q && q.help) && <p className="text-sm text-slate-600 mb-3">{q.help}</p>}
      <div className={('help' in q && q.help) ? '' : 'mt-2'}>{children}</div>
    </div>
  )
}

// ── Text / email ──
function TextField({ q, value, onChange }: FieldProps & { q: Extract<Question, { type: 'text' | 'email' }> }) {
  return (
    <FieldShell q={q}>
      <input
        type={q.type}
        value={(value as string) ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={q.placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
      />
    </FieldShell>
  )
}

// ── Textarea ──
function TextareaField({ q, value, onChange }: FieldProps & { q: Extract<Question, { type: 'textarea' }> }) {
  return (
    <FieldShell q={q}>
      <textarea
        value={(value as string) ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={q.placeholder}
        rows={q.rows ?? 4}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
      />
    </FieldShell>
  )
}

// ── Single (radio) with optional "Anders" + revealText ──
function SingleField({
  q, value, onChange, otherText, onOtherText, revealText, onRevealText,
}: FieldProps & { q: Extract<Question, { type: 'single' }> }) {
  const v = (value as string) ?? ''
  return (
    <FieldShell q={q}>
      <div className="space-y-2">
        {q.options.map(opt => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
              v === opt.value ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input
              type="radio"
              name={q.id}
              value={opt.value}
              checked={v === opt.value}
              onChange={() => onChange(opt.value)}
              className="mt-1 accent-brand-accent"
            />
            <span className="text-sm text-slate-800 leading-relaxed">{opt.label}</span>
          </label>
        ))}
        {q.allowOther && (
          <label
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
              v === 'other' ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input
              type="radio"
              name={q.id}
              value="other"
              checked={v === 'other'}
              onChange={() => onChange('other')}
              className="mt-1 accent-brand-accent"
            />
            <span className="text-sm text-slate-800 leading-relaxed">Anders:</span>
          </label>
        )}
      </div>

      {q.allowOther && v === 'other' && (
        <input
          type="text"
          value={otherText}
          onChange={e => onOtherText(e.target.value)}
          placeholder="Vul aan..."
          className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      )}

      {q.revealText && q.revealText[v] && (
        <input
          type="text"
          value={revealText}
          onChange={e => onRevealText(e.target.value)}
          placeholder={q.revealText[v]}
          className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      )}
    </FieldShell>
  )
}

// ── Multi (checkbox) with optional "Anders" ──
function MultiField({
  q, value, onChange, otherText, onOtherText,
}: FieldProps & { q: Extract<Question, { type: 'multi' }> }) {
  const arr = Array.isArray(value) ? (value as string[]) : []
  const toggle = (val: string) => {
    onChange(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }
  return (
    <FieldShell q={q}>
      <div className="space-y-2">
        {q.options.map(opt => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
              arr.includes(opt.value) ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input
              type="checkbox"
              checked={arr.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="mt-1 accent-brand-accent"
            />
            <span className="text-sm text-slate-800 leading-relaxed">{opt.label}</span>
          </label>
        ))}
        {q.allowOther && (
          <label
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
              arr.includes('other') ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <input
              type="checkbox"
              checked={arr.includes('other')}
              onChange={() => toggle('other')}
              className="mt-1 accent-brand-accent"
            />
            <span className="text-sm text-slate-800 leading-relaxed">Anders:</span>
          </label>
        )}
      </div>
      {q.allowOther && arr.includes('other') && (
        <input
          type="text"
          value={otherText}
          onChange={e => onOtherText(e.target.value)}
          placeholder="Vul aan..."
          className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      )}
    </FieldShell>
  )
}

// ── Rank: each option gets a 1/2/3/— select ──
function RankField({ q, value, onChange }: FieldProps & { q: Extract<Question, { type: 'rank' }> }) {
  const v = (typeof value === 'object' && value !== null && !Array.isArray(value))
    ? value as Record<string, number | null>
    : {}
  const topN = q.topN ?? 3
  const setRank = (optVal: string, rank: number | null) => {
    const next: Record<string, number | null> = { ...v }
    // Ensure rank is unique: if another option had this rank, clear it.
    if (rank !== null) {
      for (const k of Object.keys(next)) {
        if (next[k] === rank) next[k] = null
      }
    }
    next[optVal] = rank
    onChange(next)
  }
  return (
    <FieldShell q={q}>
      <div className="space-y-2">
        {q.options.map(opt => (
          <div
            key={opt.value}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
              v[opt.value] ? 'border-brand-accent bg-brand-accent/5' : 'border-slate-300'
            }`}
          >
            <select
              value={v[opt.value] ?? ''}
              onChange={e => setRank(opt.value, e.target.value === '' ? null : Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm bg-white focus:border-brand-accent focus:outline-none"
            >
              <option value="">—</option>
              {Array.from({ length: topN }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-sm text-slate-800 leading-relaxed flex-1">{opt.label}</span>
          </div>
        ))}
      </div>
    </FieldShell>
  )
}

// ── Inspiration: N rows of (URL + "what appeals") ──
function InspirationField({ q, value, onChange }: FieldProps & { q: Extract<Question, { type: 'inspiration' }> }) {
  const arr = Array.isArray(value)
    ? (value as Array<{ url: string; appeal: string }>)
    : Array.from({ length: q.count }, () => ({ url: '', appeal: '' }))
  const update = (idx: number, key: 'url' | 'appeal', v: string) => {
    const next = [...arr]
    while (next.length < q.count) next.push({ url: '', appeal: '' })
    next[idx] = { ...next[idx], [key]: v }
    onChange(next)
  }
  return (
    <FieldShell q={q}>
      <div className="space-y-4">
        {Array.from({ length: q.count }, (_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Voorbeeld {i + 1}</div>
            <input
              type="url"
              value={arr[i]?.url ?? ''}
              onChange={e => update(i, 'url', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            />
            <input
              type="text"
              value={arr[i]?.appeal ?? ''}
              onChange={e => update(i, 'appeal', e.target.value)}
              placeholder="Wat spreekt aan?"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            />
          </div>
        ))}
      </div>
    </FieldShell>
  )
}

// ── Upload (multi-file) ──
function UploadField({ q, briefingType, uploads, onUploadsChange }: FieldProps & { q: Extract<Question, { type: 'upload' }> }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setBusy(true)
    setErr(null)
    try {
      const newUploads: Upload[] = []
      for (const f of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', f)
        fd.append('briefing_type', briefingType)
        const res = await fetch('/api/sannahremco/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || `Upload mislukt (${res.status})`)
        }
        const j = await res.json()
        newUploads.push({ path: j.path, filename: j.filename, size: j.size, mime: j.mime })
      }
      onUploadsChange([...uploads, ...newUploads])
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload mislukt.')
    } finally {
      setBusy(false)
    }
  }

  function remove(idx: number) {
    onUploadsChange(uploads.filter((_, i) => i !== idx))
  }

  return (
    <FieldShell q={q as Extract<Question, { label: string }>}>
      {q.description && <p className="text-sm text-slate-600 mb-3 -mt-2">{q.description}</p>}

      <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-8 cursor-pointer hover:border-brand-accent hover:bg-brand-accent/5 transition-colors">
        <input
          type="file"
          multiple={q.multiple}
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/heic,application/pdf"
          onChange={e => handleFiles(e.target.files)}
          disabled={busy}
          className="hidden"
        />
        <span className="text-2xl" aria-hidden>📎</span>
        <span className="text-sm font-semibold text-brand-dark">
          {busy ? 'Uploaden...' : 'Klik om bestanden te kiezen'}
        </span>
        <span className="text-xs text-slate-500">PNG / JPG / WebP / HEIC / PDF · max 15 MB</span>
      </label>

      {err && <p className="mt-2 text-sm text-red-700">{err}</p>}

      {uploads.length > 0 && (
        <ul className="mt-4 space-y-2">
          {uploads.map((u, idx) => (
            <li key={idx} className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm">
              <span className="truncate flex-1 mr-3 text-slate-700">{u.filename}</span>
              <span className="text-xs text-slate-500 mr-3">{Math.round(u.size / 1024)} KB</span>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Verwijder
              </button>
            </li>
          ))}
        </ul>
      )}
    </FieldShell>
  )
}
