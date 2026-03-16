'use client'

import { useEffect, useState, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Locale = 'en' | 'nl'

interface HeroContent {
  badge?: string
  heading1?: string
  heading2?: string
  sub?: string
  authors?: string
  ctaMain?: string
  ctaSub?: string
  ctaFullPre?: string
  ctaFull?: string
}

interface HowItWorksContent {
  label?: string
  heading?: string
  steps?: Array<{ n: string; title: string; desc: string }>
}

interface DimensionsContent {
  label?: string
  heading?: string
  items?: Array<{ icon: string; label: string; desc: string }>
}

interface PreviewContent {
  label?: string
  heading?: string
  sub?: string
}

interface PractitionersContent {
  label?: string
  heading?: string
  sub?: string
  mark?: { role?: string; bio?: string }
  frank?: { role?: string; quote?: string; translation?: string }
}

interface FinalCtaContent {
  heading?: string
  sub?: string
  button?: string
  buttonSub?: string
  fullPre?: string
  fullLink?: string
  fullNote?: string
}

interface LandingContent {
  hero?: HeroContent
  trust?: string[]
  howItWorks?: HowItWorksContent
  dimensions?: DimensionsContent
  preview?: PreviewContent
  practitioners?: PractitionersContent
  finalCta?: FinalCtaContent
}

// ── Defaults (mirrors messages/en.json and nl.json landing section) ───────────

const EN_DEFAULTS: LandingContent = {
  hero: {
    badge: 'Free · 5 minutes · Instant results',
    heading1: 'Your competitors are already using AI.',
    heading2: 'Where do you actually stand?',
    sub: 'Our 5-minute diagnostic benchmarks your AI maturity across 6 critical dimensions — and tells you exactly what to prioritise next.',
    authors: 'Developed by Mark de Kock & Frank Meeuwsen — AI transformation specialists with 30+ years of combined digital experience.',
    ctaMain: 'Start the 5-minute AI scan →',
    ctaSub: '7 questions · free · no sign-up required upfront',
    ctaFullPre: 'Want the complete picture?',
    ctaFull: 'Take the full 25-question assessment →',
  },
  trust: [
    'Used by leadership teams across Europe',
    'Average score: 47/100 — where do you rank?',
    'Results in 5 minutes, free',
    'No consultant pitch — just your score',
  ],
  howItWorks: {
    label: 'How it works',
    heading: 'Three steps. Zero jargon.',
    steps: [
      { n: '01', title: 'Answer 7 honest questions', desc: '5 minutes · no jargon · no sign-up required upfront' },
      { n: '02', title: 'See your score instantly', desc: 'A radar chart across all 6 AI maturity dimensions' },
      { n: '03', title: 'Know your next move', desc: 'Prioritised actions — specific to your score, not generic advice' },
    ],
  },
  dimensions: {
    label: 'What you get',
    heading: 'A score across 6 dimensions that actually matter',
    items: [
      { icon: '🧭', label: 'Strategy & Vision', desc: 'Is AI central to how you compete — or still a side project?' },
      { icon: '⚡', label: 'Current Usage', desc: 'Are AI tools genuinely embedded across your organisation?' },
      { icon: '🗄️', label: 'Data Readiness', desc: 'Is your data architecture ready to power real AI outcomes?' },
      { icon: '🧑‍💻', label: 'Talent & Culture', desc: 'Do your people feel equipped and motivated to work with AI?' },
      { icon: '🛡️', label: 'Governance & Risk', desc: 'Do you have the guardrails and policies that responsible AI requires?' },
      { icon: '🔍', label: 'Opportunity Awareness', desc: 'Does your leadership team agree on where AI creates the most value?' },
    ],
  },
  preview: {
    label: "What you'll receive",
    heading: 'Your results look like this',
    sub: 'A radar across all 6 dimensions, an overall score with benchmark context, and specific actions for your weakest areas.',
  },
  practitioners: {
    label: 'Built by practitioners',
    heading: 'No theory. No agency fluff.',
    sub: 'This assessment was built by two people who do this work every day — not a research team or a software house.',
    mark: {
      role: 'AI Transformation Lead · Kirk & Blackbeard',
      bio: 'Works with leadership teams across Europe to design and implement practical AI strategies — from board alignment to team adoption.',
    },
    frank: {
      role: 'AI Trainer & Consultant · 30 years digital experience',
      quote: '"Geen hype, geen bullshit. Gewoon wat werkt in de echte wereld."',
      translation: 'No hype, no buzzwords. Just what works in the real world.',
    },
  },
  finalCta: {
    heading: 'Ready to find out where you stand?',
    sub: 'No sign-up required until you see your results. Free. Takes 5 minutes.',
    button: 'Start the free 5-minute scan →',
    buttonSub: '7 questions · instant score · no card required',
    fullPre: 'Want the full breakdown instead?',
    fullLink: 'Take the full 25-question assessment →',
    fullNote: 'Free · ~15 minutes · deeper scoring across all 6 dimensions',
  },
}

const NL_DEFAULTS: LandingContent = {
  hero: {
    badge: 'Gratis · 5 minuten · Direct resultaat',
    heading1: 'Je concurrenten gebruiken AI al.',
    heading2: 'Waar sta jij écht?',
    sub: 'Onze 5-minuten-diagnose benchmark jouw AI-volwassenheid op 6 cruciale dimensies — en vertelt je precies wat je als eerste moet aanpakken.',
    authors: 'Ontwikkeld door Mark de Kock & Frank Meeuwsen — AI-transformatiespecialisten met meer dan 30 jaar gecombineerde digitale ervaring.',
    ctaMain: 'Start de 5-minuten AI-scan →',
    ctaSub: '7 vragen · gratis · geen registratie vooraf vereist',
    ctaFullPre: 'Wil je het complete beeld?',
    ctaFull: 'Doe de volledige 25-vragen assessment →',
  },
  trust: [
    'Gebruikt door leiderschapsteams in heel Europa',
    'Gemiddelde score: 47/100 — waar sta jij?',
    'Resultaten in 5 minuten, gratis',
    'Geen consultantpitch — gewoon jouw score',
  ],
  howItWorks: {
    label: 'Hoe het werkt',
    heading: 'Drie stappen. Zonder jargon.',
    steps: [
      { n: '01', title: 'Beantwoord 7 eerlijke vragen', desc: '5 minuten · geen jargon · geen registratie vooraf' },
      { n: '02', title: 'Bekijk je score direct', desc: 'Een radargrafiek over alle 6 AI-volwassenheidsdimensies' },
      { n: '03', title: 'Ken je volgende stap', desc: 'Geprioriteerde acties — specifiek voor jouw score, geen generiek advies' },
    ],
  },
  dimensions: {
    label: 'Wat je krijgt',
    heading: 'Een score op 6 dimensies die er écht toe doen',
    items: [
      { icon: '🧭', label: 'Strategie & Visie', desc: 'Is AI centraal in hoe je concurreert — of nog steeds een nevenproject?' },
      { icon: '⚡', label: 'Huidig gebruik', desc: 'Zijn AI-tools echt ingebed in je organisatie?' },
      { icon: '🗄️', label: 'Data-gereedheid', desc: 'Is jouw dataarchitectuur klaar om echte AI-resultaten te ondersteunen?' },
      { icon: '🧑‍💻', label: 'Talent & Cultuur', desc: 'Voelen je mensen zich uitgerust en gemotiveerd om met AI te werken?' },
      { icon: '🛡️', label: 'Governance & Risico', desc: 'Heb je de richtlijnen en het beleid dat verantwoord AI vereist?' },
      { icon: '🔍', label: 'Kansenbewustzijn', desc: 'Is jouw leiderschapsteam het eens over waar AI de meeste waarde creëert?' },
    ],
  },
  preview: {
    label: 'Wat je ontvangt',
    heading: 'Je resultaten zien er zo uit',
    sub: 'Een radar over alle 6 dimensies, een totaalscore met benchmark-context en specifieke acties voor je zwakste gebieden.',
  },
  practitioners: {
    label: 'Gebouwd door practitioners',
    heading: 'Geen theorie. Geen agencypraat.',
    sub: 'Deze assessment is gebouwd door twee mensen die dit werk dagelijks doen — geen onderzoeksteam of softwarebedrijf.',
    mark: {
      role: 'AI Transformation Lead · Kirk & Blackbeard',
      bio: 'Werkt met leiderschapsteams in heel Europa om praktische AI-strategieën te ontwerpen en te implementeren — van board-alignment tot teamadoptie.',
    },
    frank: {
      role: 'AI Trainer & Consultant · 30 jaar digitale ervaring',
      quote: '"Geen hype, geen bullshit. Gewoon wat werkt in de echte wereld."',
      translation: 'No hype, no buzzwords. Just what works in the real world.',
    },
  },
  finalCta: {
    heading: 'Klaar om te ontdekken waar je staat?',
    sub: 'Geen registratie vereist totdat je je resultaten ziet. Gratis. Duurt 5 minuten.',
    button: 'Start de gratis 5-minuten-scan →',
    buttonSub: '7 vragen · direct resultaat · geen kaart vereist',
    fullPre: 'Wil je liever de volledige uitsplitsing?',
    fullLink: 'Doe de volledige 25-vragen assessment →',
    fullNote: 'Gratis · ~15 minuten · diepere scoring op alle 6 dimensies',
  },
}

const DEFAULTS: Record<Locale, LandingContent> = { en: EN_DEFAULTS, nl: NL_DEFAULTS }

// ── UI helpers ────────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30 resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  )
}

function SaveBar({ saving, saved, dirty, onSave }: { saving: boolean; saved: boolean; dirty: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onSave}
        disabled={saving || !dirty}
        className="px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg disabled:opacity-50 hover:bg-brand-dark transition-colors"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
      {saved && !dirty && (
        <span className="text-sm text-green-600 font-medium">✓ Saved</span>
      )}
      {dirty && (
        <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
      )}
    </div>
  )
}

// ── Deep clone / set helpers ──────────────────────────────────────────────────

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

function set<T extends object>(obj: T, path: string[], value: unknown): T {
  const out = clone(obj)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = out
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur[path[i]]
  }
  cur[path[path.length - 1]] = value
  return out
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ContentPage() {
  const [locale, setLocale] = useState<Locale>('en')
  const [content, setContent] = useState<LandingContent>(clone(DEFAULTS.en))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContent = useCallback(async (loc: Locale) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/content?locale=${loc}`)
      if (!res.ok) throw new Error('Failed to load content')
      const json = await res.json() as { content: LandingContent }
      // Merge DB overrides on top of defaults so all fields are always populated
      const merged = deepMergeClient(clone(DEFAULTS[loc]) as Record<string, unknown>, (json.content ?? {}) as Record<string, unknown>)
      setContent(merged)
    } catch (e) {
      setError((e as Error).message)
      setContent(clone(DEFAULTS[loc]))
    } finally {
      setLoading(false)
      setDirty(false)
      setSaved(false)
    }
  }, [])

  useEffect(() => {
    void loadContent(locale)
  }, [locale, loadContent])

  function update(path: string[], value: unknown) {
    setContent(prev => set(prev, path, value))
    setDirty(true)
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, content }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setDirty(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function handleLocaleChange(loc: Locale) {
    if (dirty && !confirm('You have unsaved changes. Switch locale and lose them?')) return
    setLocale(loc)
  }

  const h = content.hero ?? {}
  const trustItems = content.trust ?? []
  const hiw = content.howItWorks ?? {}
  const dim = content.dimensions ?? {}
  const prev = content.preview ?? {}
  const prac = content.practitioners ?? {}
  const cta = content.finalCta ?? {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Content</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit the public-facing copy for the landing page. Changes go live on next page load.
          </p>
        </div>
        <SaveBar saving={saving} saved={saved} dirty={dirty} onSave={handleSave} />
      </div>

      {/* Locale tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['en', 'nl'] as const).map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
              locale === loc
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {loc === 'en' ? '🇬🇧 English' : '🇳🇱 Dutch'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-gray-400">Loading…</div>
      ) : (
        <div className="space-y-6">

          {/* Hero */}
          <Section title="Hero — top of page">
            <Field label="Badge (above headline)" value={h.badge ?? ''} onChange={v => update(['hero', 'badge'], v)} />
            <Field label="Headline line 1" value={h.heading1 ?? ''} onChange={v => update(['hero', 'heading1'], v)} />
            <Field label="Headline line 2" value={h.heading2 ?? ''} onChange={v => update(['hero', 'heading2'], v)} />
            <Field label="Subheading" value={h.sub ?? ''} onChange={v => update(['hero', 'sub'], v)} multiline />
            <Field label="Authors line" value={h.authors ?? ''} onChange={v => update(['hero', 'authors'], v)} multiline />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary CTA button" value={h.ctaMain ?? ''} onChange={v => update(['hero', 'ctaMain'], v)} />
              <Field label="CTA sub-label" value={h.ctaSub ?? ''} onChange={v => update(['hero', 'ctaSub'], v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full assessment pre-text" value={h.ctaFullPre ?? ''} onChange={v => update(['hero', 'ctaFullPre'], v)} />
              <Field label="Full assessment link text" value={h.ctaFull ?? ''} onChange={v => update(['hero', 'ctaFull'], v)} />
            </div>
          </Section>

          {/* Trust bar */}
          <Section title="Trust bar — 4 short statements">
            {trustItems.map((item, i) => (
              <Field
                key={i}
                label={`Statement ${i + 1}`}
                value={item}
                onChange={v => {
                  const next = [...trustItems]
                  next[i] = v
                  update(['trust'], next)
                }}
              />
            ))}
          </Section>

          {/* How it works */}
          <Section title="How it works">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Section label" value={hiw.label ?? ''} onChange={v => update(['howItWorks', 'label'], v)} />
              <Field label="Section heading" value={hiw.heading ?? ''} onChange={v => update(['howItWorks', 'heading'], v)} />
            </div>
            {(hiw.steps ?? []).map((step, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <Field label={`Step ${step.n} title`} value={step.title} onChange={v => {
                  const steps = clone(hiw.steps ?? [])
                  steps[i] = { ...steps[i], title: v }
                  update(['howItWorks', 'steps'], steps)
                }} />
                <Field label={`Step ${step.n} description`} value={step.desc} onChange={v => {
                  const steps = clone(hiw.steps ?? [])
                  steps[i] = { ...steps[i], desc: v }
                  update(['howItWorks', 'steps'], steps)
                }} />
              </div>
            ))}
          </Section>

          {/* 6 Dimensions */}
          <Section title="6 Dimensions">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Section label" value={dim.label ?? ''} onChange={v => update(['dimensions', 'label'], v)} />
              <Field label="Section heading" value={dim.heading ?? ''} onChange={v => update(['dimensions', 'heading'], v)} />
            </div>
            {(dim.items ?? []).map((item, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <Field label={`${item.icon} ${item.label} — label`} value={item.label} onChange={v => {
                  const items = clone(dim.items ?? [])
                  items[i] = { ...items[i], label: v }
                  update(['dimensions', 'items'], items)
                }} />
                <Field label="Description" value={item.desc} onChange={v => {
                  const items = clone(dim.items ?? [])
                  items[i] = { ...items[i], desc: v }
                  update(['dimensions', 'items'], items)
                }} />
              </div>
            ))}
          </Section>

          {/* Results preview */}
          <Section title="Results preview section">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Section label" value={prev.label ?? ''} onChange={v => update(['preview', 'label'], v)} />
              <Field label="Section heading" value={prev.heading ?? ''} onChange={v => update(['preview', 'heading'], v)} />
            </div>
            <Field label="Description" value={prev.sub ?? ''} onChange={v => update(['preview', 'sub'], v)} multiline />
          </Section>

          {/* Practitioners */}
          <Section title="Practitioners — about the authors">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Section label" value={prac.label ?? ''} onChange={v => update(['practitioners', 'label'], v)} />
              <Field label="Section heading" value={prac.heading ?? ''} onChange={v => update(['practitioners', 'heading'], v)} />
            </div>
            <Field label="Section sub" value={prac.sub ?? ''} onChange={v => update(['practitioners', 'sub'], v)} multiline />
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mark de Kock</p>
              <Field label="Role / title" value={prac.mark?.role ?? ''} onChange={v => update(['practitioners', 'mark', 'role'], v)} />
              <Field label="Bio" value={prac.mark?.bio ?? ''} onChange={v => update(['practitioners', 'mark', 'bio'], v)} multiline />
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Frank Meeuwsen</p>
              <Field label="Role / title" value={prac.frank?.role ?? ''} onChange={v => update(['practitioners', 'frank', 'role'], v)} />
              <Field label="Quote (shown in original language)" value={prac.frank?.quote ?? ''} onChange={v => update(['practitioners', 'frank', 'quote'], v)} />
              <Field label="Translation (shown below quote)" value={prac.frank?.translation ?? ''} onChange={v => update(['practitioners', 'frank', 'translation'], v)} />
            </div>
          </Section>

          {/* Final CTA */}
          <Section title="Final call-to-action">
            <Field label="Heading" value={cta.heading ?? ''} onChange={v => update(['finalCta', 'heading'], v)} />
            <Field label="Sub-text" value={cta.sub ?? ''} onChange={v => update(['finalCta', 'sub'], v)} multiline />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary button text" value={cta.button ?? ''} onChange={v => update(['finalCta', 'button'], v)} />
              <Field label="Button sub-label" value={cta.buttonSub ?? ''} onChange={v => update(['finalCta', 'buttonSub'], v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full assessment pre-text" value={cta.fullPre ?? ''} onChange={v => update(['finalCta', 'fullPre'], v)} />
              <Field label="Full assessment link text" value={cta.fullLink ?? ''} onChange={v => update(['finalCta', 'fullLink'], v)} />
            </div>
            <Field label="Full assessment note" value={cta.fullNote ?? ''} onChange={v => update(['finalCta', 'fullNote'], v)} />
          </Section>

          {/* Sticky bottom save */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <SaveBar saving={saving} saved={saved} dirty={dirty} onSave={handleSave} />
          </div>

        </div>
      )}
    </div>
  )
}

// Client-side deep merge (same logic as server layout)
function deepMergeClient(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): LandingContent {
  const out: Record<string, unknown> = { ...a }
  for (const key of Object.keys(b)) {
    if (
      b[key] !== null &&
      typeof b[key] === 'object' &&
      !Array.isArray(b[key]) &&
      typeof a[key] === 'object' &&
      !Array.isArray(a[key])
    ) {
      out[key] = deepMergeClient(
        a[key] as Record<string, unknown>,
        b[key] as Record<string, unknown>
      )
    } else {
      out[key] = b[key]
    }
  }
  return out as LandingContent
}
