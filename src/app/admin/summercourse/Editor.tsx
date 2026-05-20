'use client'

import { useState, useCallback } from 'react'
import type {
  SummerCourseContent, SCDay, SCRow, SCHost, SCFaq,
} from '@/app/summercourse/content'

// ── Small field primitives ─────────────────────────────────────────────────

function Field({ label, value, onChange, textarea = false }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean
}) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}</span>
      {textarea ? (
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
          rows={3} value={value} onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
          value={value} onChange={(e) => onChange(e.target.value)}
        />
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

// Editor for a list of plain strings (bullets, items, included lines).
function StringList({ label, items, onChange }: {
  label: string; items: string[]; onChange: (v: string[]) => void
}) {
  return (
    <div className="mb-3">
      <span className="block text-xs font-semibold text-gray-700 mb-1">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
            value={it}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])}
        className="text-sm text-brand-accent font-semibold hover:underline">+ regel toevoegen</button>
    </div>
  )
}

// ── Main editor ─────────────────────────────────────────────────────────────

export default function SummerCourseEditor({ initial }: { initial: SummerCourseContent }) {
  const [c, setC] = useState<SummerCourseContent>(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // Patch a top-level section immutably.
  const patch = useCallback(<K extends keyof SummerCourseContent>(
    key: K, value: Partial<SummerCourseContent[K]>,
  ) => {
    setC((prev) => ({ ...prev, [key]: { ...prev[key], ...value } }))
  }, [])

  const save = async () => {
    setSaving(true); setMsg(null)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: 'nl', product_key: 'summer_course', content: c }),
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
      {/* HERO */}
      <Section title="Hero">
        <Field label="Eyebrow" value={c.hero.eyebrow} onChange={(v) => patch('hero', { eyebrow: v })} />
        <Field label="Titel" value={c.hero.title} onChange={(v) => patch('hero', { title: v })} textarea />
        <Field label="Subtitel" value={c.hero.subtitle} onChange={(v) => patch('hero', { subtitle: v })} textarea />
        <StringList label="Bullets" items={c.hero.bullets} onChange={(v) => patch('hero', { bullets: v })} />
        <Field label="Credibility-regel" value={c.hero.credibility} onChange={(v) => patch('hero', { credibility: v })} textarea />
        <Field label="CTA primair" value={c.hero.ctaPrimary} onChange={(v) => patch('hero', { ctaPrimary: v })} />
        <Field label="CTA secundair" value={c.hero.ctaSecondary} onChange={(v) => patch('hero', { ctaSecondary: v })} />
        <Field label="Notitie onder CTA" value={c.hero.note} onChange={(v) => patch('hero', { note: v })} textarea />
      </Section>

      {/* PROBLEM */}
      <Section title="Probleem">
        <Field label="Kop" value={c.problem.heading} onChange={(v) => patch('problem', { heading: v })} />
        <StringList label="Alinea's" items={c.problem.paragraphs} onChange={(v) => patch('problem', { paragraphs: v })} />
      </Section>

      {/* OUTCOME */}
      <Section title="Wat je meeneemt">
        <Field label="Kop" value={c.outcome.heading} onChange={(v) => patch('outcome', { heading: v })} />
        <Field label="Intro" value={c.outcome.intro} onChange={(v) => patch('outcome', { intro: v })} textarea />
        <StringList label="Opbrengsten" items={c.outcome.items} onChange={(v) => patch('outcome', { items: v })} />
      </Section>

      {/* AUDIENCE */}
      <Section title="Voor wie">
        <Field label="Kop" value={c.audience.heading} onChange={(v) => patch('audience', { heading: v })} />
        <Field label="Intro" value={c.audience.intro} onChange={(v) => patch('audience', { intro: v })} textarea />
        <Field label="Titel — wel voor" value={c.audience.forTitle} onChange={(v) => patch('audience', { forTitle: v })} />
        <StringList label="Wel voor — punten" items={c.audience.forItems} onChange={(v) => patch('audience', { forItems: v })} />
        <Field label="Titel — niet voor" value={c.audience.notTitle} onChange={(v) => patch('audience', { notTitle: v })} />
        <StringList label="Niet voor — punten" items={c.audience.notItems} onChange={(v) => patch('audience', { notItems: v })} />
      </Section>

      {/* PROGRAM */}
      <Section title="Programma">
        <Field label="Kop" value={c.program.heading} onChange={(v) => patch('program', { heading: v })} />
        <Field label="Intro" value={c.program.intro} onChange={(v) => patch('program', { intro: v })} textarea />

        <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
          <span className="text-xs font-bold text-gray-500">Vooraf-blok</span>
          <Field label="Label" value={c.program.intake.label}
            onChange={(v) => patch('program', { intake: { ...c.program.intake, label: v } })} />
          <Field label="Titel" value={c.program.intake.title}
            onChange={(v) => patch('program', { intake: { ...c.program.intake, title: v } })} />
          <Field label="Tekst" value={c.program.intake.body} textarea
            onChange={(v) => patch('program', { intake: { ...c.program.intake, body: v } })} />
        </div>

        {c.program.days.map((day, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500">Dag {i + 1}</span>
              <button type="button" className="text-xs text-red-600 hover:underline"
                onClick={() => patch('program', { days: c.program.days.filter((_, j) => j !== i) })}>verwijderen</button>
            </div>
            <Field label="Dag-label" value={day.daynum}
              onChange={(v) => patch('program', { days: c.program.days.map((x, j) => j === i ? { ...x, daynum: v } : x) })} />
            <Field label="Titel" value={day.title}
              onChange={(v) => patch('program', { days: c.program.days.map((x, j) => j === i ? { ...x, title: v } : x) })} />
            <StringList label="Ochtend (vast)" items={day.morning}
              onChange={(v) => patch('program', { days: c.program.days.map((x, j) => j === i ? { ...x, morning: v } : x) })} />
            <StringList label="Middag (eigen case)" items={day.afternoon}
              onChange={(v) => patch('program', { days: c.program.days.map((x, j) => j === i ? { ...x, afternoon: v } : x) })} />
          </div>
        ))}
        <button type="button" className="text-sm text-brand-accent font-semibold hover:underline mb-4 block"
          onClick={() => patch('program', { days: [...c.program.days, { daynum: '', title: '', morning: [], afternoon: [] } as SCDay] })}>+ dag toevoegen</button>

        <div className="border border-gray-200 rounded-lg p-3 mb-1 bg-gray-50">
          <span className="text-xs font-bold text-gray-500">Achteraf-blok</span>
          <Field label="Label" value={c.program.after.label}
            onChange={(v) => patch('program', { after: { ...c.program.after, label: v } })} />
          <Field label="Titel" value={c.program.after.title}
            onChange={(v) => patch('program', { after: { ...c.program.after, title: v } })} />
          <Field label="Tekst" value={c.program.after.body} textarea
            onChange={(v) => patch('program', { after: { ...c.program.after, body: v } })} />
        </div>
      </Section>

      {/* SCHEDULE */}
      <Section title="Dagschema">
        <Field label="Kop" value={c.schedule.heading} onChange={(v) => patch('schedule', { heading: v })} />
        <Field label="Intro" value={c.schedule.intro} onChange={(v) => patch('schedule', { intro: v })} textarea />
        {c.schedule.rows.map((row, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
              placeholder="09:00–12:30" value={row.time}
              onChange={(e) => patch('schedule', { rows: c.schedule.rows.map((x, j) => j === i ? { ...x, time: e.target.value } : x) })} />
            <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
              value={row.text}
              onChange={(e) => patch('schedule', { rows: c.schedule.rows.map((x, j) => j === i ? { ...x, text: e.target.value } : x) })} />
            <button type="button" className="px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              onClick={() => patch('schedule', { rows: c.schedule.rows.filter((_, j) => j !== i) })}>✕</button>
          </div>
        ))}
        <button type="button" className="text-sm text-brand-accent font-semibold hover:underline"
          onClick={() => patch('schedule', { rows: [...c.schedule.rows, { time: '', text: '' } as SCRow] })}>+ regel toevoegen</button>
      </Section>

      {/* HOSTS */}
      <Section title="Begeleiders">
        <Field label="Kop" value={c.hosts.heading} onChange={(v) => patch('hosts', { heading: v })} />
        <Field label="Intro" value={c.hosts.intro} onChange={(v) => patch('hosts', { intro: v })} textarea />
        {c.hosts.people.map((p, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500">Persoon {i + 1}</span>
              <button type="button" className="text-xs text-red-600 hover:underline"
                onClick={() => patch('hosts', { people: c.hosts.people.filter((_, j) => j !== i) })}>verwijderen</button>
            </div>
            <Field label="Initialen (avatar)" value={p.initials}
              onChange={(v) => patch('hosts', { people: c.hosts.people.map((x, j) => j === i ? { ...x, initials: v } : x) })} />
            <Field label="Naam" value={p.name}
              onChange={(v) => patch('hosts', { people: c.hosts.people.map((x, j) => j === i ? { ...x, name: v } : x) })} />
            <Field label="Bio" value={p.bio} textarea
              onChange={(v) => patch('hosts', { people: c.hosts.people.map((x, j) => j === i ? { ...x, bio: v } : x) })} />
          </div>
        ))}
        <button type="button" className="text-sm text-brand-accent font-semibold hover:underline"
          onClick={() => patch('hosts', { people: [...c.hosts.people, { initials: '', name: '', bio: '' } as SCHost] })}>+ persoon toevoegen</button>
      </Section>

      {/* PRICING */}
      <Section title="Investering">
        <Field label="Kop" value={c.pricing.heading} onChange={(v) => patch('pricing', { heading: v })} />
        <Field label="Online-vs-live regel" value={c.pricing.onlineVsLive} onChange={(v) => patch('pricing', { onlineVsLive: v })} textarea />
        <Field label="Early-bird label" value={c.pricing.ebLabel} onChange={(v) => patch('pricing', { ebLabel: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Early-bird prijs" value={c.pricing.ebPrice} onChange={(v) => patch('pricing', { ebPrice: v })} />
          <Field label="Reguliere prijs" value={c.pricing.regPrice} onChange={(v) => patch('pricing', { regPrice: v })} />
        </div>
        <Field label="Aanbetaling-regel" value={c.pricing.depositLine} onChange={(v) => patch('pricing', { depositLine: v })} textarea />
        <Field label="CTA-label" value={c.pricing.ctaLabel} onChange={(v) => patch('pricing', { ctaLabel: v })} />
        <Field label="Inbegrepen — kop" value={c.pricing.inclTitle} onChange={(v) => patch('pricing', { inclTitle: v })} />
        <StringList label="Inbegrepen — punten" items={c.pricing.incl} onChange={(v) => patch('pricing', { incl: v })} />
        <Field label="Schaarste-regel" value={c.pricing.scarcity} onChange={(v) => patch('pricing', { scarcity: v })} textarea />
      </Section>

      {/* FAQ */}
      <Section title="FAQ">
        <Field label="Kop" value={c.faq.heading} onChange={(v) => patch('faq', { heading: v })} />
        {c.faq.items.map((f, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500">Vraag {i + 1}</span>
              <button type="button" className="text-xs text-red-600 hover:underline"
                onClick={() => patch('faq', { items: c.faq.items.filter((_, j) => j !== i) })}>verwijderen</button>
            </div>
            <Field label="Vraag" value={f.q}
              onChange={(v) => patch('faq', { items: c.faq.items.map((x, j) => j === i ? { ...x, q: v } : x) })} />
            <Field label="Antwoord" value={f.a} textarea
              onChange={(v) => patch('faq', { items: c.faq.items.map((x, j) => j === i ? { ...x, a: v } : x) })} />
          </div>
        ))}
        <button type="button" className="text-sm text-brand-accent font-semibold hover:underline"
          onClick={() => patch('faq', { items: [...c.faq.items, { q: '', a: '' } as SCFaq] })}>+ vraag toevoegen</button>
      </Section>

      {/* SIGNUP */}
      <Section title="Inschrijf-blok">
        <Field label="Kop" value={c.signup.heading} onChange={(v) => patch('signup', { heading: v })} />
        <Field label="Intro" value={c.signup.intro} onChange={(v) => patch('signup', { intro: v })} textarea />
        <Field label="CTA-label" value={c.signup.ctaLabel} onChange={(v) => patch('signup', { ctaLabel: v })} />
        <Field label="CTA-link (mailto: of URL)" value={c.signup.ctaHref} onChange={(v) => patch('signup', { ctaHref: v })} />
      </Section>

      {/* SAVE BAR */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 flex items-center gap-4">
        <button type="button" onClick={save} disabled={saving}
          className="bg-brand-accent text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50">
          {saving ? 'Opslaan…' : 'Opslaan & live zetten'}
        </button>
        <a href="/summercourse" target="_blank" className="text-sm text-gray-500 underline">Bekijk pagina ↗</a>
        {msg && <span className={`text-sm ${msg.startsWith('Fout') ? 'text-red-600' : 'text-green-600'}`}>{msg}</span>}
      </div>
    </div>
  )
}
