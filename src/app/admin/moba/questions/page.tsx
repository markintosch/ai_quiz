// FILE: src/app/admin/moba/questions/page.tsx
// Admin CMS for the MOBA survey copy. Edit question text + option labels, the
// priority labels, the open questions and the segmentation labels. Structure
// (dimensions, codes, 1–5 scale) is fixed in code and shown read-only.

'use client'

import { useEffect, useMemo, useState } from 'react'
import { MOBA_MARKETING_CONFIG } from '@/products/moba_marketing/config'
import type { MobaContent } from '@/lib/moba/content'

const DIMENSIONS = MOBA_MARKETING_CONFIG.dimensions

export default function AdminMobaQuestionsPage() {
  const [content, setContent] = useState<MobaContent | null>(null)
  const [customised, setCustomised] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => { void load() }, [])

  async function load() {
    setLoading(true); setError(null)
    try {
      const r = await fetch('/api/admin/moba/questions', { cache: 'no-store' })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`)
      setContent(j.content)
      setCustomised(Boolean(j.customised))
      setDirty(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden mislukt')
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    if (!content) return
    setSaving(true); setError(null)
    try {
      const r = await fetch('/api/admin/moba/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`)
      setContent(j.content)
      setCustomised(Boolean(j.customised))
      setDirty(false)
      setSavedAt(new Date().toLocaleTimeString('nl-NL'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    if (!confirm('Alle teksten terugzetten naar de standaard? Je aanpassingen gaan verloren.')) return
    setSaving(true); setError(null)
    try {
      const r = await fetch('/api/admin/moba/questions', { method: 'DELETE' })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`)
      setContent(j.content)
      setCustomised(false)
      setDirty(false)
      setSavedAt(new Date().toLocaleTimeString('nl-NL'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Herstellen mislukt')
    } finally {
      setSaving(false)
    }
  }

  // ── Field mutators ───────────────────────────────────────────
  function setQuestionText(code: string, text: string) {
    setContent(c => c && ({ ...c, questions: c.questions.map(q => q.code === code ? { ...q, text } : q) }))
    setDirty(true)
  }
  function setOptionLabel(code: string, value: number | null, label: string) {
    setContent(c => c && ({
      ...c,
      questions: c.questions.map(q => q.code === code
        ? { ...q, options: q.options.map(o => o.value === value ? { ...o, label } : o) }
        : q),
    }))
    setDirty(true)
  }
  function setPriorityLabel(key: string, label: string) {
    setContent(c => c && ({ ...c, priorityOptions: c.priorityOptions.map(o => o.key === key ? { ...o, label } : o) }))
    setDirty(true)
  }
  function setOpenText(key: string, text: string) {
    setContent(c => c && ({ ...c, openQuestions: c.openQuestions.map(o => o.key === key ? { ...o, text } : o) }))
    setDirty(true)
  }
  function setSegment(field: 'text' | 'minLabel' | 'maxLabel', value: string) {
    setContent(c => c && ({ ...c, segment: { ...c.segment, [field]: value } }))
    setDirty(true)
  }
  function setRoleField(field: 'text' | 'helper' | 'otherLabel', value: string) {
    setContent(c => c && ({ ...c, roleQuestion: { ...c.roleQuestion, [field]: value } }))
    setDirty(true)
  }
  function setRoleOptionLabel(code: string, label: string) {
    setContent(c => c && ({
      ...c,
      roleQuestion: { ...c.roleQuestion, options: c.roleQuestion.options.map(o => o.code === code ? { ...o, label } : o) },
    }))
    setDirty(true)
  }

  const byDimension = useMemo(() => {
    if (!content) return []
    return DIMENSIONS.map(dim => ({
      dim,
      questions: content.questions.filter(q => q.dimension === dim.key),
    }))
  }, [content])

  if (loading) {
    return <div className="max-w-3xl mx-auto px-6 py-10"><p className="text-sm text-gray-500">Laden…</p></div>
  }
  if (!content) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-sm text-red-600">{error ?? 'Kon de vragen niet laden.'}</p>
        <button onClick={() => void load()} className="mt-3 text-sm underline text-brand-accent">Opnieuw proberen</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">MOBA Survey · vragen</h1>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${customised ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
          {customised ? 'Aangepast' : 'Standaard'}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Pas hier de vraagteksten en antwoordlabels aan. De structuur (zes thema&apos;s, achttien
        vragen, de 1&ndash;5 schaal) ligt vast, zodat de scores blijven kloppen. Wijzigingen gelden
        meteen voor nieuwe invullers.{' '}
        <a href="/moba/demo" target="_blank" className="text-brand-accent underline">Bekijk de survey →</a>
      </p>

      <div className="mb-6 rounded-xl bg-gray-50 border border-gray-100 p-4 text-xs text-gray-500 leading-relaxed">
        Antwoord <strong>5</strong> staat bij elke vraag voor de volwassen/gewenste kant, <strong>1</strong>
        voor de minst volwassen. Houd die volgorde aan bij het herschrijven van de labels.
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      {/* Likert questions grouped by dimension */}
      {byDimension.map(({ dim, questions }) => (
        <section key={dim.key} className="mb-10">
          <div className="flex items-baseline gap-2 mb-1">
            <span aria-hidden>{dim.icon}</span>
            <h2 className="text-base font-bold text-gray-900">{dim.label}</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">{dim.description}</p>

          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.code} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{q.code}</span>
                </div>
                <textarea
                  value={q.text}
                  onChange={e => setQuestionText(q.code, e.target.value)}
                  rows={2}
                  className="w-full text-sm font-medium text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent resize-none"
                />
                <div className="mt-3 space-y-1.5">
                  {q.options.map(opt => (
                    <div key={String(opt.value)} className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-bold text-gray-400 shrink-0">{opt.value}</span>
                      <input
                        value={opt.label}
                        onChange={e => setOptionLabel(q.code, opt.value, e.target.value)}
                        className="flex-1 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Priority labels */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-1">Prioriteringsvraag</h2>
        <p className="text-xs text-gray-500 mb-4">
          De zes thema&apos;s waarover invullers {content.priorityTotal} punten verdelen.
        </p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-1.5">
          {content.priorityOptions.map(o => (
            <input
              key={o.key}
              value={o.label}
              onChange={e => setPriorityLabel(o.key, e.target.value)}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
          ))}
        </div>
      </section>

      {/* Open questions */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-1">Open vragen</h2>
        <p className="text-xs text-gray-500 mb-4">Drie open vragen aan het einde van de survey.</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          {content.openQuestions.map(o => (
            <textarea
              key={o.key}
              value={o.text}
              onChange={e => setOpenText(o.key, e.target.value)}
              rows={2}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent resize-none"
            />
          ))}
        </div>
      </section>

      {/* Role of marketing question */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-1">Rol van marketing</h2>
        <p className="text-xs text-gray-500 mb-4">
          Meerkeuze waar meerdere antwoorden mogen, plus een open aanvulling. De antwoordopties
          zelf liggen vast; alleen de teksten pas je hier aan.
        </p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Vraag</label>
            <textarea
              value={content.roleQuestion.text}
              onChange={e => setRoleField('text', e.target.value)}
              rows={2}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Toelichting</label>
            <input
              value={content.roleQuestion.helper}
              onChange={e => setRoleField('helper', e.target.value)}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Antwoordopties</label>
            <div className="space-y-1.5">
              {content.roleQuestion.options.map(o => (
                <input
                  key={o.code}
                  value={o.label}
                  onChange={e => setRoleOptionLabel(o.code, e.target.value)}
                  className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Label open aanvulling</label>
            <input
              value={content.roleQuestion.otherLabel}
              onChange={e => setRoleField('otherLabel', e.target.value)}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
          </div>
        </div>
      </section>

      {/* Segment question */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-1">Segmentatievraag</h2>
        <p className="text-xs text-gray-500 mb-4">Alleen zichtbaar wanneer segmentatie aanstaat voor een afname.</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Vraag</label>
            <textarea
              value={content.segment.text}
              onChange={e => setSegment('text', e.target.value)}
              rows={2}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Label links (1)</label>
              <input
                value={content.segment.minLabel}
                onChange={e => setSegment('minLabel', e.target.value)}
                className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Label rechts (5)</label>
              <input
                value={content.segment.maxLabel}
                onChange={e => setSegment('maxLabel', e.target.value)}
                className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs text-gray-500">
            {dirty ? 'Niet-opgeslagen wijzigingen' : savedAt ? `Opgeslagen om ${savedAt}` : 'Alles opgeslagen'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button" onClick={() => void reset()} disabled={saving || (!customised && !dirty)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
            >
              Herstel standaard
            </button>
            <button
              type="button" onClick={() => void save()} disabled={saving || !dirty}
              className="text-sm font-semibold px-6 py-2 rounded-lg bg-brand-accent text-white hover:bg-orange-700 disabled:opacity-40 transition-all"
            >
              {saving ? 'Opslaan…' : 'Opslaan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
