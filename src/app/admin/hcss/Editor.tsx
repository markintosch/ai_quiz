'use client'

import { useState } from 'react'

type Lang = 'nl' | 'en'
type Testimonial = { quote: string; role: string }
export type LocaleData = { heading: string; items: Testimonial[] }

export default function HcssTestimonialsEditor({ initial }: { initial: Record<Lang, LocaleData> }) {
  const [data, setData] = useState<Record<Lang, LocaleData>>(initial)
  const [lang, setLang] = useState<Lang>('nl')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const cur = data[lang]
  const setCur = (next: Partial<LocaleData>) =>
    setData((prev) => ({ ...prev, [lang]: { ...prev[lang], ...next } }))

  const save = async () => {
    setSaving(true); setMsg(null)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: lang,
          product_key: 'hcss',
          content: { testimonialsHeading: cur.heading, testimonials: cur.items },
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setMsg(`Opgeslagen (${lang.toUpperCase()}) — live.`)
    } catch (e) {
      setMsg(`Fout bij opslaan: ${e instanceof Error ? e.message : 'onbekend'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Language toggle */}
      <div className="mb-4 flex gap-2">
        {(['nl', 'en'] as const).map((l) => (
          <button key={l} type="button" onClick={() => setLang(l)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${lang === l ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>
            {l.toUpperCase()}
          </button>
        ))}
        <span className="self-center text-xs text-gray-500">Opslaan geldt per taal.</span>
      </div>

      <section className="border border-gray-200 rounded-xl p-5 mb-5 bg-white">
        <label className="block mb-4">
          <span className="block text-xs font-semibold text-gray-700 mb-1">Kop</span>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
            value={cur.heading} onChange={(e) => setCur({ heading: e.target.value })} />
        </label>

        {cur.items.map((tm, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500">Testimonial {i + 1}</span>
              <button type="button" className="text-xs text-red-600 hover:underline"
                onClick={() => setCur({ items: cur.items.filter((_, j) => j !== i) })}>verwijderen</button>
            </div>
            <label className="block mb-3">
              <span className="block text-xs font-semibold text-gray-700 mb-1">Quote</span>
              <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
                value={tm.quote} onChange={(e) => setCur({ items: cur.items.map((x, j) => j === i ? { ...x, quote: e.target.value } : x) })} />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-gray-700 mb-1">Rol / duiding (geen naam)</span>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
                value={tm.role} onChange={(e) => setCur({ items: cur.items.map((x, j) => j === i ? { ...x, role: e.target.value } : x) })} />
            </label>
          </div>
        ))}
        <button type="button" className="text-sm text-brand-accent font-semibold hover:underline"
          onClick={() => setCur({ items: [...cur.items, { quote: '', role: '' }] })}>+ testimonial toevoegen</button>
      </section>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 flex items-center gap-4">
        <button type="button" onClick={save} disabled={saving}
          className="bg-brand-accent text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50">
          {saving ? 'Opslaan…' : `Opslaan ${lang.toUpperCase()} & live zetten`}
        </button>
        <a href="/HCSS" target="_blank" className="text-sm text-gray-500 underline">Bekijk pagina ↗</a>
        {msg && <span className={`text-sm ${msg.startsWith('Fout') ? 'text-red-600' : 'text-green-600'}`}>{msg}</span>}
      </div>
    </div>
  )
}
