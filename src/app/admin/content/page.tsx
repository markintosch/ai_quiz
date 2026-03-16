'use client'

import { useEffect, useState, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Locale = 'en' | 'nl' | 'fr'

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

interface CompanyContent {
  badge?: string
  heading1?: string
  heading2?: string
  headingFallback?: string
  defaultWelcome?: string
  meta?: string
  cta?: string
  ctaFallback?: string
  confidentiality?: string
  valueLine?: string
  whatWeMeasure?: string
  poweredBy?: string
  gdpr?: string
  privacyLink?: string
  quizHeader?: string
  dimensions?: string[]
}

interface AllContent {
  landing: LandingContent
  company: CompanyContent
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const EN_LANDING: LandingContent = {
  hero: {
    badge: 'Free · 5 minutes · Instant results',
    heading1: 'Your competitors are already using AI.',
    heading2: 'Where do you actually stand?',
    sub: 'Our 5-minute diagnostic benchmarks your AI maturity across 6 critical dimensions — and tells you exactly what to prioritise next.',
    authors: 'Developed by Mark de Kock & Frank Meeuwsen — AI transformation specialists with 30+ years of combined digital experience.',
    ctaMain: 'Start the 5-minute AI scan →',
    ctaSub: '7 questions · free · no sign-up required upfront',
    ctaFullPre: 'Want the complete picture?',
    ctaFull: 'Take the full 26-question assessment →',
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
    fullLink: 'Take the full 26-question assessment →',
    fullNote: 'Free · ~15 minutes · deeper scoring across all 6 dimensions',
  },
}

const NL_LANDING: LandingContent = {
  hero: {
    badge: 'Gratis · 5 minuten · Direct resultaat',
    heading1: 'Je concurrenten gebruiken AI al.',
    heading2: 'Waar sta jij eigenlijk?',
    sub: 'Onze 5-minuten-diagnose meet je AI-volwassenheid op 6 kritieke dimensies — en vertelt je precies wat je als eerste moet aanpakken.',
    authors: 'Ontwikkeld door Mark de Kock & Frank Meeuwsen — AI-transformatiespecialisten met ruim 30 jaar gecombineerde digitale ervaring.',
    ctaMain: 'Start de gratis 5-minuten-scan →',
    ctaSub: '7 vragen · gratis · geen registratie vooraf vereist',
    ctaFullPre: 'Wil je het complete beeld?',
    ctaFull: 'Doe de uitgebreide assessment met 26 vragen →',
  },
  trust: [
    'Gebruikt door leiderschapsteams door heel Europa',
    'Gemiddelde score: 47/100 — hoe scoor jij?',
    'Resultaat in 5 minuten, gratis',
    'Geen verkooppraatje — gewoon jouw score',
  ],
  howItWorks: {
    label: 'Hoe het werkt',
    heading: 'Drie stappen. Geen jargon.',
    steps: [
      { n: '01', title: 'Beantwoord 7 eerlijke vragen', desc: '5 minuten · geen jargon · geen registratie vooraf vereist' },
      { n: '02', title: 'Zie je score direct', desc: 'Een radarkaart over alle 6 AI-volwassenheidsdimensies' },
      { n: '03', title: 'Weet wat je volgende stap is', desc: 'Geprioriteerde acties — specifiek voor jouw score, geen generiek advies' },
    ],
  },
  dimensions: {
    label: 'Wat je krijgt',
    heading: 'Een score op 6 dimensies die er echt toe doen',
    items: [
      { icon: '🧭', label: 'Strategie & Visie', desc: 'Staat AI centraal in hoe je concurreert — of is het nog een bijproject?' },
      { icon: '⚡', label: 'Huidig gebruik', desc: 'Zijn AI-tools echt ingebed in je hele organisatie?' },
      { icon: '🗄️', label: 'Data-gereedheid', desc: 'Is je dataarchitectuur klaar voor echte AI-resultaten?' },
      { icon: '🧑‍💻', label: 'Talent & Cultuur', desc: 'Voelen je mensen zich toegerust en gemotiveerd om met AI te werken?' },
      { icon: '🛡️', label: 'Governance & Risico', desc: 'Heb je de richtlijnen en het beleid dat verantwoord AI vereist?' },
      { icon: '🔍', label: 'Kansenbewustzijn', desc: 'Is jouw leiderschapsteam het eens over waar AI de meeste waarde creëert?' },
    ],
  },
  preview: {
    label: 'Wat je ontvangt',
    heading: 'Jouw resultaten zien er zo uit',
    sub: 'Een radar over alle 6 dimensies, een totaalscore met benchmarkcontext en concrete acties voor je zwakste gebieden.',
  },
  practitioners: {
    label: 'Gebouwd door beoefenaars',
    heading: 'Geen theorie. Geen bureau-gebabbel.',
    sub: 'Deze assessment is gebouwd door twee mensen die dit werk elke dag doen — geen onderzoeksteam of softwarehuis.',
    mark: {
      role: 'AI Transformation Lead · Kirk & Blackbeard',
      bio: 'Werkt met leiderschapsteams door heel Europa aan het ontwerpen en implementeren van praktische AI-strategieën — van bestuurlijke afstemming tot teamadoptie.',
    },
    frank: {
      role: 'AI-trainer & Consultant · 30 jaar digitale ervaring',
      quote: '"Geen hype, geen bullshit. Gewoon wat werkt in de echte wereld."',
      translation: 'Geen hype, geen moeilijke woorden. Gewoon wat werkt in de praktijk.',
    },
  },
  finalCta: {
    heading: 'Klaar om te ontdekken waar je staat?',
    sub: 'Geen registratie vereist totdat je je resultaten ziet. Gratis. Duurt 5 minuten.',
    button: 'Start de gratis 5-minuten-scan →',
    buttonSub: '7 vragen · direct resultaat · geen creditcard vereist',
    fullPre: 'Wil je liever de volledige analyse?',
    fullLink: 'Doe de uitgebreide assessment met 26 vragen →',
    fullNote: 'Gratis · ~15 minuten · diepgaandere scoring op alle 6 dimensies',
  },
}

const FR_LANDING: LandingContent = {
  hero: {
    badge: 'Gratuit · 5 minutes · Résultats immédiats',
    heading1: 'Vos concurrents utilisent déjà l\'IA.',
    heading2: 'Où en êtes-vous vraiment ?',
    sub: 'Notre diagnostic de 5 minutes évalue votre maturité IA sur 6 dimensions critiques — et vous indique exactement quoi prioriser.',
    authors: 'Développé par Mark de Kock & Frank Meeuwsen — spécialistes de la transformation IA avec plus de 30 ans d\'expérience digitale combinée.',
    ctaMain: 'Démarrer le scan IA de 5 minutes →',
    ctaSub: '7 questions · gratuit · sans inscription préalable',
    ctaFullPre: 'Vous voulez le tableau complet ?',
    ctaFull: 'Faire l\'évaluation complète de 26 questions →',
  },
  trust: [
    'Utilisé par des équipes dirigeantes à travers l\'Europe',
    'Score moyen : 47/100 — où vous situez-vous ?',
    'Résultats en 5 minutes, gratuit',
    'Pas de pitch consultant — juste votre score',
  ],
  howItWorks: {
    label: 'Comment ça marche',
    heading: 'Trois étapes. Zéro jargon.',
    steps: [
      { n: '01', title: 'Répondez à 7 questions honnêtes', desc: '5 minutes · pas de jargon · sans inscription préalable' },
      { n: '02', title: 'Visualisez votre score immédiatement', desc: 'Un graphique radar sur les 6 dimensions de maturité IA' },
      { n: '03', title: 'Connaissez votre prochaine étape', desc: 'Actions priorisées — adaptées à votre score, pas des conseils génériques' },
    ],
  },
  dimensions: {
    label: 'Ce que vous obtenez',
    heading: 'Un score sur 6 dimensions qui comptent vraiment',
    items: [
      { icon: '🧭', label: 'Stratégie & Vision', desc: 'L\'IA est-elle au cœur de votre compétitivité — ou encore un projet secondaire ?' },
      { icon: '⚡', label: 'Utilisation actuelle', desc: 'Les outils IA sont-ils réellement intégrés dans votre organisation ?' },
      { icon: '🗄️', label: 'Maturité des données', desc: 'Votre architecture data est-elle prête à soutenir de vrais résultats IA ?' },
      { icon: '🧑‍💻', label: 'Talent & Culture', desc: 'Vos équipes se sentent-elles prêtes et motivées à travailler avec l\'IA ?' },
      { icon: '🛡️', label: 'Gouvernance & Risques', desc: 'Disposez-vous des garde-fous et politiques qu\'exige une IA responsable ?' },
      { icon: '🔍', label: 'Conscience des opportunités', desc: 'Votre équipe dirigeante est-elle alignée sur où l\'IA crée le plus de valeur ?' },
    ],
  },
  preview: {
    label: 'Ce que vous recevrez',
    heading: 'Vos résultats ressembleront à ceci',
    sub: 'Un radar sur les 6 dimensions, un score global avec contexte benchmark, et des actions concrètes pour vos points faibles.',
  },
  practitioners: {
    label: 'Conçu par des praticiens',
    heading: 'Pas de théorie. Pas de jargon d\'agence.',
    sub: 'Cette évaluation a été construite par deux personnes qui font ce travail au quotidien — pas une équipe de recherche ou une entreprise logicielle.',
    mark: {
      role: 'AI Transformation Lead · Kirk & Blackbeard',
      bio: 'Accompagne des équipes dirigeantes à travers l\'Europe pour concevoir et mettre en œuvre des stratégies IA concrètes — de l\'alignement du conseil à l\'adoption par les équipes.',
    },
    frank: {
      role: 'Formateur & Consultant IA · 30 ans d\'expérience digitale',
      quote: '"Geen hype, geen bullshit. Gewoon wat werkt in de echte wereld."',
      translation: 'Pas de hype, pas de buzzwords. Juste ce qui fonctionne dans le monde réel.',
    },
  },
  finalCta: {
    heading: 'Prêt à découvrir où vous en êtes ?',
    sub: 'Aucune inscription requise avant de voir vos résultats. Gratuit. 5 minutes.',
    button: 'Démarrer le scan gratuit de 5 minutes →',
    buttonSub: '7 questions · score immédiat · sans carte requise',
    fullPre: 'Vous préférez l\'analyse complète ?',
    fullLink: 'Faire l\'évaluation complète de 26 questions →',
    fullNote: 'Gratuit · ~15 minutes · scoring approfondi sur les 6 dimensions',
  },
}

const EN_COMPANY: CompanyContent = {
  badge: 'AI Maturity Assessment',
  heading1: 'See where',
  heading2: 'stands on AI — and what to prioritise next',
  headingFallback: 'See where your organisation stands on AI — and what to prioritise next',
  defaultWelcome: 'This 15-minute assessment reveals how AI is understood, used and prioritised across {name} — and surfaces the gaps and opportunities that matter most. Results feed directly into a team workshop, giving leadership a shared fact base for decision-making.',
  meta: '{count} questions · 15 minutes · Confidential responses · Team workshop included',
  cta: 'Start the {name} Assessment →',
  ctaFallback: 'Start Assessment →',
  confidentiality: 'Individual responses remain confidential. Outcomes are discussed at team level.',
  valueLine: 'This assessment creates a shared fact base for leadership discussion, prioritisation and next-step planning.',
  whatWeMeasure: 'What we assess',
  poweredBy: 'Powered by Brand PWRD Media',
  gdpr: 'Your data is handled in accordance with GDPR.',
  privacyLink: 'Privacy Policy',
  quizHeader: 'AI Maturity Assessment',
  dimensions: [
    'Strategy & Vision',
    'Current Usage',
    'Data Readiness',
    'Talent & Culture',
    'Governance & Risk',
    'Opportunity Awareness',
  ],
}

const NL_COMPANY: CompanyContent = {
  badge: 'AI-volwassenheidsassessment',
  heading1: 'Zie waar',
  heading2: 'staat op het gebied van AI — en wat als eerste moet worden aangepakt',
  headingFallback: 'Zie waar jouw organisatie staat op het gebied van AI — en wat als eerste moet worden aangepakt',
  defaultWelcome: 'Deze 15-minuten-assessment brengt in kaart hoe AI wordt begrepen, gebruikt en geprioriteerd binnen {name} — en maakt de belangrijkste gaps en kansen zichtbaar. De resultaten vormen de basis voor een teamworkshop, zodat het leiderschap beschikt over een gezamenlijk vertrekpunt voor besluitvorming.',
  meta: '{count} vragen · 15 minuten · Vertrouwelijke antwoorden · Teamworkshop inbegrepen',
  cta: 'Start de {name} Assessment →',
  ctaFallback: 'Start Assessment →',
  confidentiality: 'Individuele antwoorden blijven vertrouwelijk. Uitkomsten worden op teamniveau besproken.',
  valueLine: 'Deze assessment creëert een gezamenlijke feitenbasis voor leiderschapsdiscussie, prioritering en planvorming.',
  whatWeMeasure: 'Wat we beoordelen',
  poweredBy: 'Mogelijk gemaakt door Brand PWRD Media',
  gdpr: 'Je gegevens worden verwerkt conform de AVG.',
  privacyLink: 'Privacybeleid',
  quizHeader: 'AI-volwassenheidsassessment',
  dimensions: [
    'Strategie & Visie',
    'Huidig gebruik',
    'Data-gereedheid',
    'Talent & Cultuur',
    'Governance & Risico',
    'Kansenbewustzijn',
  ],
}

const FR_COMPANY: CompanyContent = {
  badge: 'Évaluation de Maturité IA',
  heading1: 'Où en est',
  heading2: 'sur l\'IA — et quoi prioriser ensuite',
  headingFallback: 'Où en est votre organisation sur l\'IA — et quoi prioriser ensuite',
  defaultWelcome: 'Cette évaluation de 15 minutes révèle comment l\'IA est comprise, utilisée et priorisée au sein de {name} — et met en évidence les lacunes et opportunités les plus importantes. Les résultats alimentent directement un atelier d\'équipe, offrant à la direction une base factuelle commune pour la prise de décision.',
  meta: '{count} questions · 15 minutes · Réponses confidentielles · Atelier d\'équipe inclus',
  cta: 'Démarrer l\'évaluation {name} →',
  ctaFallback: 'Démarrer l\'évaluation →',
  confidentiality: 'Les réponses individuelles restent confidentielles. Les résultats sont discutés au niveau de l\'équipe.',
  valueLine: 'Cette évaluation crée une base factuelle commune pour la discussion du leadership, la priorisation et la planification des prochaines étapes.',
  whatWeMeasure: 'Ce que nous évaluons',
  poweredBy: 'Propulsé par Brand PWRD Media',
  gdpr: 'Vos données sont traitées conformément au RGPD.',
  privacyLink: 'Politique de confidentialité',
  quizHeader: 'Évaluation de Maturité IA',
  dimensions: [
    'Stratégie & Vision',
    'Utilisation actuelle',
    'Maturité des données',
    'Talent & Culture',
    'Gouvernance & Risques',
    'Conscience des opportunités',
  ],
}

const LANDING_DEFAULTS: Record<Locale, LandingContent> = {
  en: EN_LANDING,
  nl: NL_LANDING,
  fr: FR_LANDING,
}

const COMPANY_DEFAULTS: Record<Locale, CompanyContent> = {
  en: EN_COMPANY,
  nl: NL_COMPANY,
  fr: FR_COMPANY,
}

function makeDefaults(loc: Locale): AllContent {
  return { landing: clone(LANDING_DEFAULTS[loc]), company: clone(COMPANY_DEFAULTS[loc]) }
}

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

function SectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-gray-700 border-b border-gray-200 pb-2">{title}</h2>
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

// Client-side deep merge
function deepMergeClient(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): Record<string, unknown> {
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
  return out
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ContentPage() {
  const [locale, setLocale] = useState<Locale>('en')
  const [content, setContent] = useState<AllContent>(makeDefaults('en'))
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
      const json = await res.json() as { content: Record<string, unknown> }
      const raw = json.content ?? {}

      // Detect legacy flat landing blob (no 'landing' or 'company' key at root)
      const isNested = 'landing' in raw || 'company' in raw
      const defaults = makeDefaults(loc)

      const mergedLanding = deepMergeClient(
        defaults.landing as Record<string, unknown>,
        isNested ? ((raw.landing as Record<string, unknown>) ?? {}) : raw
      ) as LandingContent

      const mergedCompany = deepMergeClient(
        defaults.company as Record<string, unknown>,
        isNested ? ((raw.company as Record<string, unknown>) ?? {}) : {}
      ) as CompanyContent

      setContent({ landing: mergedLanding, company: mergedCompany })
    } catch (e) {
      setError((e as Error).message)
      setContent(makeDefaults(loc))
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

  const h = content.landing.hero ?? {}
  const trustItems = content.landing.trust ?? []
  const hiw = content.landing.howItWorks ?? {}
  const dim = content.landing.dimensions ?? {}
  const prev = content.landing.preview ?? {}
  const prac = content.landing.practitioners ?? {}
  const cta = content.landing.finalCta ?? {}
  const comp = content.company ?? {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit landing page and company quiz page copy. Changes go live on next page load.
          </p>
        </div>
        <SaveBar saving={saving} saved={saved} dirty={dirty} onSave={handleSave} />
      </div>

      {/* Locale tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['en', 'nl', 'fr'] as const).map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
              locale === loc
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {loc === 'en' ? '🇬🇧 English' : loc === 'nl' ? '🇳🇱 Dutch' : '🇫🇷 French'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-gray-400">Loading…</div>
      ) : (
        <div className="space-y-10">

          {/* ── Landing page sections ── */}
          <SectionGroup title="Landing Page">

            {/* Hero */}
            <Section title="Hero — top of page">
              <Field label="Badge (above headline)" value={h.badge ?? ''} onChange={v => update(['landing', 'hero', 'badge'], v)} />
              <Field label="Headline line 1" value={h.heading1 ?? ''} onChange={v => update(['landing', 'hero', 'heading1'], v)} />
              <Field label="Headline line 2" value={h.heading2 ?? ''} onChange={v => update(['landing', 'hero', 'heading2'], v)} />
              <Field label="Subheading" value={h.sub ?? ''} onChange={v => update(['landing', 'hero', 'sub'], v)} multiline />
              <Field label="Authors line" value={h.authors ?? ''} onChange={v => update(['landing', 'hero', 'authors'], v)} multiline />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Primary CTA button" value={h.ctaMain ?? ''} onChange={v => update(['landing', 'hero', 'ctaMain'], v)} />
                <Field label="CTA sub-label" value={h.ctaSub ?? ''} onChange={v => update(['landing', 'hero', 'ctaSub'], v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full assessment pre-text" value={h.ctaFullPre ?? ''} onChange={v => update(['landing', 'hero', 'ctaFullPre'], v)} />
                <Field label="Full assessment link text" value={h.ctaFull ?? ''} onChange={v => update(['landing', 'hero', 'ctaFull'], v)} />
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
                    update(['landing', 'trust'], next)
                  }}
                />
              ))}
            </Section>

            {/* How it works */}
            <Section title="How it works">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Section label" value={hiw.label ?? ''} onChange={v => update(['landing', 'howItWorks', 'label'], v)} />
                <Field label="Section heading" value={hiw.heading ?? ''} onChange={v => update(['landing', 'howItWorks', 'heading'], v)} />
              </div>
              {(hiw.steps ?? []).map((step, i) => (
                <div key={i} className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <Field label={`Step ${step.n} title`} value={step.title} onChange={v => {
                    const steps = clone(hiw.steps ?? [])
                    steps[i] = { ...steps[i], title: v }
                    update(['landing', 'howItWorks', 'steps'], steps)
                  }} />
                  <Field label={`Step ${step.n} description`} value={step.desc} onChange={v => {
                    const steps = clone(hiw.steps ?? [])
                    steps[i] = { ...steps[i], desc: v }
                    update(['landing', 'howItWorks', 'steps'], steps)
                  }} />
                </div>
              ))}
            </Section>

            {/* 6 Dimensions */}
            <Section title="6 Dimensions">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Section label" value={dim.label ?? ''} onChange={v => update(['landing', 'dimensions', 'label'], v)} />
                <Field label="Section heading" value={dim.heading ?? ''} onChange={v => update(['landing', 'dimensions', 'heading'], v)} />
              </div>
              {(dim.items ?? []).map((item, i) => (
                <div key={i} className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <Field label={`${item.icon} ${item.label} — label`} value={item.label} onChange={v => {
                    const items = clone(dim.items ?? [])
                    items[i] = { ...items[i], label: v }
                    update(['landing', 'dimensions', 'items'], items)
                  }} />
                  <Field label="Description" value={item.desc} onChange={v => {
                    const items = clone(dim.items ?? [])
                    items[i] = { ...items[i], desc: v }
                    update(['landing', 'dimensions', 'items'], items)
                  }} />
                </div>
              ))}
            </Section>

            {/* Results preview */}
            <Section title="Results preview section">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Section label" value={prev.label ?? ''} onChange={v => update(['landing', 'preview', 'label'], v)} />
                <Field label="Section heading" value={prev.heading ?? ''} onChange={v => update(['landing', 'preview', 'heading'], v)} />
              </div>
              <Field label="Description" value={prev.sub ?? ''} onChange={v => update(['landing', 'preview', 'sub'], v)} multiline />
            </Section>

            {/* Practitioners */}
            <Section title="Practitioners — about the authors">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Section label" value={prac.label ?? ''} onChange={v => update(['landing', 'practitioners', 'label'], v)} />
                <Field label="Section heading" value={prac.heading ?? ''} onChange={v => update(['landing', 'practitioners', 'heading'], v)} />
              </div>
              <Field label="Section sub" value={prac.sub ?? ''} onChange={v => update(['landing', 'practitioners', 'sub'], v)} multiline />
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mark de Kock</p>
                <Field label="Role / title" value={prac.mark?.role ?? ''} onChange={v => update(['landing', 'practitioners', 'mark', 'role'], v)} />
                <Field label="Bio" value={prac.mark?.bio ?? ''} onChange={v => update(['landing', 'practitioners', 'mark', 'bio'], v)} multiline />
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Frank Meeuwsen</p>
                <Field label="Role / title" value={prac.frank?.role ?? ''} onChange={v => update(['landing', 'practitioners', 'frank', 'role'], v)} />
                <Field label="Quote (shown in original language)" value={prac.frank?.quote ?? ''} onChange={v => update(['landing', 'practitioners', 'frank', 'quote'], v)} />
                <Field label="Translation (shown below quote)" value={prac.frank?.translation ?? ''} onChange={v => update(['landing', 'practitioners', 'frank', 'translation'], v)} />
              </div>
            </Section>

            {/* Final CTA */}
            <Section title="Final call-to-action">
              <Field label="Heading" value={cta.heading ?? ''} onChange={v => update(['landing', 'finalCta', 'heading'], v)} />
              <Field label="Sub-text" value={cta.sub ?? ''} onChange={v => update(['landing', 'finalCta', 'sub'], v)} multiline />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Primary button text" value={cta.button ?? ''} onChange={v => update(['landing', 'finalCta', 'button'], v)} />
                <Field label="Button sub-label" value={cta.buttonSub ?? ''} onChange={v => update(['landing', 'finalCta', 'buttonSub'], v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full assessment pre-text" value={cta.fullPre ?? ''} onChange={v => update(['landing', 'finalCta', 'fullPre'], v)} />
                <Field label="Full assessment link text" value={cta.fullLink ?? ''} onChange={v => update(['landing', 'finalCta', 'fullLink'], v)} />
              </div>
              <Field label="Full assessment note" value={cta.fullNote ?? ''} onChange={v => update(['landing', 'finalCta', 'fullNote'], v)} />
            </Section>

          </SectionGroup>

          {/* ── Company page sections ── */}
          <SectionGroup title="Company Quiz Page">

            <Section title="Intro page — before quiz starts">
              <p className="text-xs text-gray-500 -mt-2">
                Shown on <code className="bg-gray-100 px-1 rounded">/quiz/[company-slug]</code>. Use <code className="bg-gray-100 px-1 rounded">{'{name}'}</code> for company name, <code className="bg-gray-100 px-1 rounded">{'{count}'}</code> for question count.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Badge text" value={comp.badge ?? ''} onChange={v => update(['company', 'badge'], v)} />
                <Field label="Quiz header (slim bar during quiz)" value={comp.quizHeader ?? ''} onChange={v => update(['company', 'quizHeader'], v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Headline: before {name}" value={comp.heading1 ?? ''} onChange={v => update(['company', 'heading1'], v)} placeholder="e.g. See where" />
                <Field label="Headline: after {name}" value={comp.heading2 ?? ''} onChange={v => update(['company', 'heading2'], v)} placeholder="e.g. stands on AI — and what to prioritise next" />
              </div>
              <Field
                label="Headline fallback (no company name)"
                value={comp.headingFallback ?? ''}
                onChange={v => update(['company', 'headingFallback'], v)}
                placeholder="e.g. See where your organisation stands on AI…"
              />
              <Field
                label="Intro paragraph (use {name} for company name)"
                value={comp.defaultWelcome ?? ''}
                onChange={v => update(['company', 'defaultWelcome'], v)}
                multiline
                placeholder="e.g. This assessment reveals how AI is understood across {name}…"
              />
              <Field
                label="Proof/meta line (use {count} for question count)"
                value={comp.meta ?? ''}
                onChange={v => update(['company', 'meta'], v)}
                placeholder="e.g. {count} questions · 15 minutes · Confidential"
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="CTA button (use {name} for company name)"
                  value={comp.cta ?? ''}
                  onChange={v => update(['company', 'cta'], v)}
                  placeholder="e.g. Start the {name} Assessment →"
                />
                <Field
                  label="CTA fallback (no company name)"
                  value={comp.ctaFallback ?? ''}
                  onChange={v => update(['company', 'ctaFallback'], v)}
                  placeholder="e.g. Start Assessment →"
                />
              </div>
              <Field
                label="Confidentiality note (below CTA)"
                value={comp.confidentiality ?? ''}
                onChange={v => update(['company', 'confidentiality'], v)}
                placeholder="e.g. Individual responses remain confidential…"
              />
              <Field
                label="Value line (optional, below confidentiality)"
                value={comp.valueLine ?? ''}
                onChange={v => update(['company', 'valueLine'], v)}
                multiline
                placeholder="e.g. This assessment creates a shared fact base…"
              />
            </Section>

            <Section title="Footer & branding">
              <Field label="'What we assess' label" value={comp.whatWeMeasure ?? ''} onChange={v => update(['company', 'whatWeMeasure'], v)} />
              <Field label="'Powered by' text" value={comp.poweredBy ?? ''} onChange={v => update(['company', 'poweredBy'], v)} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="GDPR notice text" value={comp.gdpr ?? ''} onChange={v => update(['company', 'gdpr'], v)} />
                <Field label="Privacy link text" value={comp.privacyLink ?? ''} onChange={v => update(['company', 'privacyLink'], v)} />
              </div>
            </Section>

            <Section title="Dimension labels (shown on intro page)">
              <p className="text-xs text-gray-500 -mt-2">These 6 labels are shown as cards on the company intro page.</p>
              {(comp.dimensions ?? []).map((label, i) => {
                const icons = ['🧭', '⚡', '🗄️', '🧑‍💻', '🛡️', '🔍']
                return (
                  <Field
                    key={i}
                    label={`${icons[i] ?? ''} Dimension ${i + 1}`}
                    value={label}
                    onChange={v => {
                      const next = [...(comp.dimensions ?? [])]
                      next[i] = v
                      update(['company', 'dimensions'], next)
                    }}
                  />
                )
              })}
            </Section>

          </SectionGroup>

          {/* Sticky bottom save */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <SaveBar saving={saving} saved={saved} dirty={dirty} onSave={handleSave} />
          </div>

        </div>
      )}
    </div>
  )
}
