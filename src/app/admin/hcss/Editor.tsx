'use client'

import { useState, useCallback } from 'react'
import type { HcssContent } from '@/app/HCSS/content'

// ── Field primitives ────────────────────────────────────────────────────────

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

function StringList({ label, items, onChange }: {
  label: string; items: string[]; onChange: (v: string[]) => void
}) {
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

// Generic editor for a list of objects with string fields.
function ObjectList<T extends Record<string, string>>({ label, items, fields, empty, onChange }: {
  label: string
  items: T[]
  fields: Array<{ key: keyof T; label: string; textarea?: boolean }>
  empty: T
  onChange: (v: T[]) => void
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

// ── Main editor ─────────────────────────────────────────────────────────────

export default function HcssEditor({ initial }: { initial: HcssContent }) {
  const [c, setC] = useState<HcssContent>(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const patch = useCallback(<K extends keyof HcssContent>(key: K, value: Partial<HcssContent[K]>) => {
    setC((prev) => ({ ...prev, [key]: { ...prev[key], ...value } }))
  }, [])

  const save = async () => {
    setSaving(true); setMsg(null)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: 'nl', product_key: 'hcss', content: c }),
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
      <Section title="Navigatie">
        <ObjectList label="Menu-links" items={c.nav.links} empty={{ label: '', href: '' }}
          fields={[{ key: 'label', label: 'Label' }, { key: 'href', label: 'Link (#anchor of URL)' }]}
          onChange={(v) => patch('nav', { links: v })} />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="CTA-label" value={c.nav.cta.label} onChange={(v) => patch('nav', { cta: { ...c.nav.cta, label: v } })} />
          <Field label="CTA-link" value={c.nav.cta.href} onChange={(v) => patch('nav', { cta: { ...c.nav.cta, href: v } })} />
        </div>
      </Section>

      <Section title="Hero">
        <Field label="Titel" value={c.hero.title} onChange={(v) => patch('hero', { title: v })} textarea />
        <Field label="Subtitel" value={c.hero.subtitle} onChange={(v) => patch('hero', { subtitle: v })} textarea />
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA primair — label" value={c.hero.ctaPrimary.label} onChange={(v) => patch('hero', { ctaPrimary: { ...c.hero.ctaPrimary, label: v } })} />
          <Field label="CTA primair — link" value={c.hero.ctaPrimary.href} onChange={(v) => patch('hero', { ctaPrimary: { ...c.hero.ctaPrimary, href: v } })} />
          <Field label="CTA secundair — label" value={c.hero.ctaSecondary.label} onChange={(v) => patch('hero', { ctaSecondary: { ...c.hero.ctaSecondary, label: v } })} />
          <Field label="CTA secundair — link" value={c.hero.ctaSecondary.href} onChange={(v) => patch('hero', { ctaSecondary: { ...c.hero.ctaSecondary, href: v } })} />
        </div>
        <StringList label="Trust bar (badges)" items={c.hero.trustBar} onChange={(v) => patch('hero', { trustBar: v })} />
      </Section>

      <Section title="Probleem / herkenning">
        <Field label="Kop" value={c.problem.heading} onChange={(v) => patch('problem', { heading: v })} />
        <Field label="Tekst" value={c.problem.body} onChange={(v) => patch('problem', { body: v })} textarea />
        <Field label="Afsluitende regel" value={c.problem.closing} onChange={(v) => patch('problem', { closing: v })} textarea />
        <Field label="Foto (pad in /public, leeg = geen foto)" value={c.problem.photo} onChange={(v) => patch('problem', { photo: v })} />
      </Section>

      <Section title="Diensten">
        <Field label="Kop" value={c.services.heading} onChange={(v) => patch('services', { heading: v })} />
        <Field label="Intro" value={c.services.intro} onChange={(v) => patch('services', { intro: v })} textarea />
        <ObjectList label="Diensten-kaarten" items={c.services.cards} empty={{ title: '', body: '' }}
          fields={[{ key: 'title', label: 'Titel' }, { key: 'body', label: 'Tekst', textarea: true }]}
          onChange={(v) => patch('services', { cards: v })} />
      </Section>

      <Section title="Assessment (lead-gen)">
        <Field label="Eyebrow" value={c.assessment.eyebrow} onChange={(v) => patch('assessment', { eyebrow: v })} />
        <Field label="Kop" value={c.assessment.heading} onChange={(v) => patch('assessment', { heading: v })} />
        <Field label="Tekst" value={c.assessment.body} onChange={(v) => patch('assessment', { body: v })} textarea />
        <StringList label="Bullets" items={c.assessment.bullets} onChange={(v) => patch('assessment', { bullets: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA-label" value={c.assessment.ctaLabel} onChange={(v) => patch('assessment', { ctaLabel: v })} />
          <Field label="CTA-link (URL assessment-tool)" value={c.assessment.ctaHref} onChange={(v) => patch('assessment', { ctaHref: v })} />
        </div>
        <Field label="Notitie onder CTA" value={c.assessment.note} onChange={(v) => patch('assessment', { note: v })} textarea />
        <ObjectList label="Assessment-niveaus" items={c.assessment.tiers} empty={{ name: '', forWho: '', contains: '' }}
          fields={[{ key: 'name', label: 'Naam' }, { key: 'forWho', label: 'Voor wie' }, { key: 'contains', label: 'Bevat', textarea: true }]}
          onChange={(v) => patch('assessment', { tiers: v })} />
        <Field label="Notitie onder niveaus" value={c.assessment.tiersNote} onChange={(v) => patch('assessment', { tiersNote: v })} textarea />
      </Section>

      <Section title="Werkwijze">
        <Field label="Kop" value={c.werkwijze.heading} onChange={(v) => patch('werkwijze', { heading: v })} />
        <Field label="Intro" value={c.werkwijze.intro} onChange={(v) => patch('werkwijze', { intro: v })} textarea />
        <ObjectList label="Stappen" items={c.werkwijze.steps} empty={{ title: '', body: '' }}
          fields={[{ key: 'title', label: 'Titel' }, { key: 'body', label: 'Tekst', textarea: true }]}
          onChange={(v) => patch('werkwijze', { steps: v })} />
      </Section>

      <Section title="Waarom HCSS">
        <Field label="Kop" value={c.waarom.heading} onChange={(v) => patch('waarom', { heading: v })} />
        <ObjectList label="Punten" items={c.waarom.items} empty={{ title: '', body: '' }}
          fields={[{ key: 'title', label: 'Titel' }, { key: 'body', label: 'Tekst', textarea: true }]}
          onChange={(v) => patch('waarom', { items: v })} />
      </Section>

      <Section title="Over / oprichter">
        <Field label="Kop" value={c.founder.heading} onChange={(v) => patch('founder', { heading: v })} />
        <Field label="Naam" value={c.founder.name} onChange={(v) => patch('founder', { name: v })} />
        <Field label="Bio" value={c.founder.bio} onChange={(v) => patch('founder', { bio: v })} textarea />
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA-label" value={c.founder.ctaLabel} onChange={(v) => patch('founder', { ctaLabel: v })} />
          <Field label="CTA-link" value={c.founder.ctaHref} onChange={(v) => patch('founder', { ctaHref: v })} />
        </div>
        <Field label="Titel credentials" value={c.founder.credsTitle} onChange={(v) => patch('founder', { credsTitle: v })} />
        <ObjectList label="Credentials" items={c.founder.creds} empty={{ category: '', detail: '' }}
          fields={[{ key: 'category', label: 'Categorie' }, { key: 'detail', label: 'Detail', textarea: true }]}
          onChange={(v) => patch('founder', { creds: v })} />
      </Section>

      <Section title="Testimonials">
        <Field label="Kop" value={c.testimonials.heading} onChange={(v) => patch('testimonials', { heading: v })} />
        <ObjectList label="Testimonials (rol, geen naam)" items={c.testimonials.items} empty={{ quote: '', role: '' }}
          fields={[{ key: 'quote', label: 'Quote', textarea: true }, { key: 'role', label: 'Rol / duiding (geen naam)' }]}
          onChange={(v) => patch('testimonials', { items: v })} />
      </Section>

      <Section title="Contact">
        <Field label="Kop" value={c.contact.heading} onChange={(v) => patch('contact', { heading: v })} />
        <Field label="Intro" value={c.contact.intro} onChange={(v) => patch('contact', { intro: v })} textarea />
        <Field label="Titel — wat te verwachten" value={c.contact.expectTitle} onChange={(v) => patch('contact', { expectTitle: v })} />
        <StringList label="Verwachtingen" items={c.contact.expect} onChange={(v) => patch('contact', { expect: v })} />
        <Field label="Titel — direct contact" value={c.contact.directTitle} onChange={(v) => patch('contact', { directTitle: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="E-mail" value={c.contact.email} onChange={(v) => patch('contact', { email: v })} />
          <Field label="Telefoon" value={c.contact.phone} onChange={(v) => patch('contact', { phone: v })} />
          <Field label="LinkedIn-URL" value={c.contact.linkedin} onChange={(v) => patch('contact', { linkedin: v })} />
          <Field label="KvK" value={c.contact.kvk} onChange={(v) => patch('contact', { kvk: v })} />
        </div>
        <Field label="Succesmelding na verzenden" value={c.contact.successMessage} onChange={(v) => patch('contact', { successMessage: v })} textarea />
      </Section>

      <Section title="FAQ">
        <Field label="Kop" value={c.faq.heading} onChange={(v) => patch('faq', { heading: v })} />
        <ObjectList label="Vragen" items={c.faq.items} empty={{ q: '', a: '' }}
          fields={[{ key: 'q', label: 'Vraag' }, { key: 'a', label: 'Antwoord', textarea: true }]}
          onChange={(v) => patch('faq', { items: v })} />
      </Section>

      <Section title="Footer">
        <Field label="Tagline" value={c.footer.tagline} onChange={(v) => patch('footer', { tagline: v })} textarea />
        <Field label="Copyright-regel" value={c.footer.legal} onChange={(v) => patch('footer', { legal: v })} />
      </Section>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 flex items-center gap-4">
        <button type="button" onClick={save} disabled={saving}
          className="bg-brand-accent text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50">
          {saving ? 'Opslaan…' : 'Opslaan & live zetten'}
        </button>
        <a href="/HCSS" target="_blank" className="text-sm text-gray-500 underline">Bekijk pagina ↗</a>
        {msg && <span className={`text-sm ${msg.startsWith('Fout') ? 'text-red-600' : 'text-green-600'}`}>{msg}</span>}
      </div>
    </div>
  )
}
