'use client'

import { useState, useCallback } from 'react'
import type { AILContent } from '@/app/ai-leiderschap/content'

function Field({ label, value, onChange, textarea = false }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean
}) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}</span>
      {textarea ? (
        <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
          rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
          value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-gray-200 rounded-xl p-5 mb-5 bg-white">
      <h2 className="text-lg font-bold text-brand mb-3">{title}</h2>
      {children}
    </section>
  )
}

function StringList({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="mb-3">
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
            value={it} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])}
        className="text-sm text-brand-accent font-semibold hover:underline">+ regel toevoegen</button>
    </div>
  )
}

function ObjectList<T extends Record<string, string>>({ label, items, fields, empty, onChange }: {
  label: string; items: T[]; fields: Array<{ key: keyof T; label: string; textarea?: boolean }>; empty: T; onChange: (v: T[]) => void
}) {
  return (
    <div className="mb-2">
      <span className="block text-xs font-semibold text-gray-700 mb-2">{label}</span>
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-500">#{i + 1}</span>
            <button type="button" className="text-xs text-red-600 hover:underline"
              onClick={() => onChange(items.filter((_, j) => j !== i))}>verwijderen</button>
          </div>
          {fields.map((f) => (
            <Field key={String(f.key)} label={f.label} textarea={f.textarea}
              value={item[f.key]}
              onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)))} />
          ))}
        </div>
      ))}
      <button type="button" className="text-sm text-brand-accent font-semibold hover:underline"
        onClick={() => onChange([...items, { ...empty }])}>+ item toevoegen</button>
    </div>
  )
}

export default function AILEditor({ initial }: { initial: AILContent }) {
  const [c, setC] = useState<AILContent>(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const patch = useCallback(<K extends keyof AILContent>(key: K, value: Partial<AILContent[K]>) => {
    setC((prev) => ({ ...prev, [key]: { ...prev[key], ...value } }))
  }, [])

  const save = async () => {
    setSaving(true); setMsg(null)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: 'nl', product_key: 'ai_leiderschap', content: c }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setMsg('Opgeslagen — wijzigingen zijn live.')
    } catch (e) {
      setMsg(`Fout bij opslaan: ${e instanceof Error ? e.message : 'onbekend'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <Section title="Hero">
        <Field label="Eyebrow" value={c.hero.eyebrow} onChange={(v) => patch('hero', { eyebrow: v })} />
        <Field label="Titel" value={c.hero.title} onChange={(v) => patch('hero', { title: v })} textarea />
        <Field label="Subtitel" value={c.hero.subtitle} onChange={(v) => patch('hero', { subtitle: v })} textarea />
        <Field label="Datum" value={c.hero.eventDate} onChange={(v) => patch('hero', { eventDate: v })} />
        <Field label="Locatie" value={c.hero.eventLocation} onChange={(v) => patch('hero', { eventLocation: v })} />
        <StringList label="Bullets" items={c.hero.bullets} onChange={(v) => patch('hero', { bullets: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA primair — label" value={c.hero.ctaPrimary.label} onChange={(v) => patch('hero', { ctaPrimary: { ...c.hero.ctaPrimary, label: v } })} />
          <Field label="CTA primair — link" value={c.hero.ctaPrimary.href} onChange={(v) => patch('hero', { ctaPrimary: { ...c.hero.ctaPrimary, href: v } })} />
          <Field label="CTA secundair — label" value={c.hero.ctaSecondary.label} onChange={(v) => patch('hero', { ctaSecondary: { ...c.hero.ctaSecondary, label: v } })} />
          <Field label="CTA secundair — link" value={c.hero.ctaSecondary.href} onChange={(v) => patch('hero', { ctaSecondary: { ...c.hero.ctaSecondary, href: v } })} />
        </div>
        <Field label="Notitie onder CTA" value={c.hero.note} onChange={(v) => patch('hero', { note: v })} textarea />
      </Section>

      <Section title="Probleem">
        <Field label="Kop" value={c.problem.heading} onChange={(v) => patch('problem', { heading: v })} />
        <Field label="Tekst" value={c.problem.body} onChange={(v) => patch('problem', { body: v })} textarea />
      </Section>

      <Section title="Voor wie">
        <Field label="Kop" value={c.audience.heading} onChange={(v) => patch('audience', { heading: v })} />
        <Field label="Intro" value={c.audience.intro} onChange={(v) => patch('audience', { intro: v })} textarea />
        <StringList label="Rollen" items={c.audience.roles} onChange={(v) => patch('audience', { roles: v })} />
        <Field label="Notitie" value={c.audience.note} onChange={(v) => patch('audience', { note: v })} textarea />
      </Section>

      <Section title="Programma">
        <Field label="Kop" value={c.program.heading} onChange={(v) => patch('program', { heading: v })} />
        <Field label="Intro" value={c.program.intro} onChange={(v) => patch('program', { intro: v })} textarea />
        <ObjectList label="Programmaonderdelen" items={c.program.items} empty={{ title: '', body: '' }}
          fields={[{ key: 'title', label: 'Titel' }, { key: 'body', label: 'Tekst', textarea: true }]}
          onChange={(v) => patch('program', { items: v })} />
      </Section>

      <Section title="90-dagen-traject">
        <Field label="Kop" value={c.trajectory.heading} onChange={(v) => patch('trajectory', { heading: v })} />
        <Field label="Intro" value={c.trajectory.intro} onChange={(v) => patch('trajectory', { intro: v })} textarea />
        <ObjectList label="Stappen" items={c.trajectory.steps} empty={{ label: '', title: '', body: '' }}
          fields={[{ key: 'label', label: 'Label (bijv. "Dag 15")' }, { key: 'title', label: 'Titel' }, { key: 'body', label: 'Tekst', textarea: true }]}
          onChange={(v) => patch('trajectory', { steps: v })} />
      </Section>

      <Section title="Begeleiders">
        <Field label="Kop" value={c.hosts.heading} onChange={(v) => patch('hosts', { heading: v })} />
        <Field label="Intro" value={c.hosts.intro} onChange={(v) => patch('hosts', { intro: v })} textarea />
        <ObjectList label="Personen" items={c.hosts.people} empty={{ initials: '', name: '', role: '', bio: '' }}
          fields={[
            { key: 'initials', label: 'Initialen' },
            { key: 'name',     label: 'Naam' },
            { key: 'role',     label: 'Rol-omschrijving' },
            { key: 'bio',      label: 'Bio', textarea: true },
          ]}
          onChange={(v) => patch('hosts', { people: v })} />
      </Section>

      <Section title="Praktisch">
        <Field label="Kop" value={c.practical.heading} onChange={(v) => patch('practical', { heading: v })} />
        <ObjectList label="Feiten" items={c.practical.facts} empty={{ label: '', value: '' }}
          fields={[{ key: 'label', label: 'Label' }, { key: 'value', label: 'Waarde' }]}
          onChange={(v) => patch('practical', { facts: v })} />
      </Section>

      <Section title="Tijdslots (Mollie-knoppen)">
        <Field label="Kop" value={c.slots.heading} onChange={(v) => patch('slots', { heading: v })} />
        <Field label="Intro" value={c.slots.intro} onChange={(v) => patch('slots', { intro: v })} textarea />
        <ObjectList label="Slots" items={c.slots.items} empty={{ id: '', label: '', time: '', price: '', mollieHref: '', note: '' }}
          fields={[
            { key: 'id',         label: 'ID (alleen letters/cijfers)' },
            { key: 'label',      label: 'Label (bijv. "Ochtend")' },
            { key: 'time',       label: 'Tijd' },
            { key: 'price',      label: 'Prijs (bijv. "€1.595")' },
            { key: 'mollieHref', label: 'Mollie Payment Link' },
            { key: 'note',       label: 'Subline (bijv. "Max. 20 plekken")' },
          ]}
          onChange={(v) => patch('slots', { items: v })} />
        <Field label="Notitie onder de knoppen" value={c.slots.payNote} onChange={(v) => patch('slots', { payNote: v })} textarea />
      </Section>

      <Section title="Voorinschrijving (wachtlijst)">
        <Field label="Kop" value={c.waitlist.heading} onChange={(v) => patch('waitlist', { heading: v })} />
        <Field label="Intro" value={c.waitlist.intro} onChange={(v) => patch('waitlist', { intro: v })} textarea />
        <Field label="Succesmelding na verzenden" value={c.waitlist.successMessage} onChange={(v) => patch('waitlist', { successMessage: v })} textarea />
      </Section>

      <Section title="FAQ">
        <Field label="Kop" value={c.faq.heading} onChange={(v) => patch('faq', { heading: v })} />
        <ObjectList label="Vragen" items={c.faq.items} empty={{ q: '', a: '' }}
          fields={[{ key: 'q', label: 'Vraag' }, { key: 'a', label: 'Antwoord', textarea: true }]}
          onChange={(v) => patch('faq', { items: v })} />
      </Section>

      <Section title="Footer">
        <Field label="Tagline" value={c.footer.tagline} onChange={(v) => patch('footer', { tagline: v })} />
        <Field label="Copyright-regel" value={c.footer.legal} onChange={(v) => patch('footer', { legal: v })} />
      </Section>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 flex items-center gap-4">
        <button type="button" onClick={save} disabled={saving}
          className="bg-brand-accent text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50">
          {saving ? 'Opslaan…' : 'Opslaan & live zetten'}
        </button>
        <a href="/ai-leiderschap" target="_blank" className="text-sm text-gray-500 underline">Bekijk pagina ↗</a>
        {msg && <span className={`text-sm ${msg.startsWith('Fout') ? 'text-red-600' : 'text-green-600'}`}>{msg}</span>}
      </div>
    </div>
  )
}
