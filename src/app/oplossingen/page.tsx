// FILE: src/app/oplossingen/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// /oplossingen — long-read voor Brand PWRD Media's productized aanbod.
// Eén doorlopende scroll: hero → probleem → 6 producten (2 tiers) →
// 3 cases (incl Crew als case #3) → Crew als systeem-overlay → CTA.
//
// Past in mentor-site palet (INK, WARM, ACCENT) zodat de pagina visueel
// onderdeel is van markdekock.com.

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildPersonSchema,
  serializeJsonLd,
} from '@/lib/seo/structured-data'

const BASE = 'https://markdekock.com'
const CALENDLY_INTAKE = 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

// ── Brand tokens (zelfde palet als mentor page) ─────────────────────────────
const INK     = '#0F172A'
const NAVY    = '#1E3A5F'
const WHITE   = '#FFFFFF'
const LIGHT   = '#F8FAFC'
const ACCENT  = '#1D4ED8'
const WARM    = '#D97706'
const WARM_LIGHT = '#FEF3C7'
const BODY    = '#374151'
const MUTED   = '#94A3B8'
const BORDER  = '#E2E8F0'
const FONT    = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const metadata: Metadata = {
  title:       'AI-agents voor marketing & sales | Mark de Kock',
  description: 'Werkende systemen die leren en je marketing- en salesteam verder versnellen. 6 productized agent-oplossingen, gebouwd op The Crew.',
  metadataBase: new URL(BASE),
  alternates:  { canonical: `${BASE}/oplossingen` },
  openGraph: {
    title:       'AI-agents voor marketing & sales',
    description: 'Werkende systemen die leren en je team verder versnellen.',
    url:         `${BASE}/oplossingen`,
    siteName:    'Mark de Kock',
    type:        'website',
    locale:      'nl_NL',
  },
}

// ── Product data (6 producten, 2 tiers) ──────────────────────────────────────
type Product = {
  num:        string
  name:       string
  tagline:    string
  body:       string
  result:     string
  agents:     string  // "Powered by ..." tag — verbinding met The Crew
}

const OPERATIONAL: Product[] = [
  {
    num: '01',
    name: 'Performance Ops',
    tagline: 'Je team rapporteert. Onze agents optimaliseren.',
    body: "Je performance marketeer besteedt 60% van de week aan rapportages die 's maandags al verouderd zijn. Performance Ops draait dagelijks: campagne-analyse, anomaliedetectie, budget-herverdeling, trend-narratief. Je team opent 's ochtends één briefing met de essentie — naast de dashboards die ze al hebben voor de dieptecontroles.",
    result: 'Dagelijkse performance briefing, wekelijkse optimalisatie-aanbevelingen, maandelijkse trend-analyse — zonder handmatig werk.',
    agents: 'Lookout · Helmsman · Chronicle',
  },
  {
    num: '02',
    name: 'Content Engine',
    tagline: 'Van strategie naar 30 dagen content in één sessie.',
    body: 'De meeste contentkalenders zijn dood bij week twee. Niet omdat de ideeën op zijn, maar omdat niemand de vertaling maakt van strategie naar kanaal-specifieke content. Content Engine doet die vertaling: positionering → thema\'s → copy per kanaal → performance feedback → bijsturen.',
    result: 'Contentkalender, copy-varianten per platform, en een terugkoppeling-lus die leert wat werkt.',
    agents: 'Quill · Slogger · Lookout',
  },
  {
    num: '03',
    name: 'CRM Autopilot',
    tagline: 'Van lead naar klant zonder dat iemand iets vergeet.',
    body: 'Elke organisatie heeft leads die weglekken. Niet door slechte sales, maar door gaten in het systeem. CRM Autopilot bouwt het volledige pad: lead-scoring, geautomatiseerde opvolgstromen, overdrachtmomenten naar sales, en heractivatie voor leads die stil zijn gevallen.',
    result: 'Een compleet acquisitiesysteem — van onbekende bezoeker tot terugkerende klant.',
    agents: 'Navigator · Quill · Helmsman',
  },
  {
    num: '04',
    name: 'Campaign Architect',
    tagline: 'Van brief naar campagne. Niet in weken. In uren.',
    body: 'Een campagne opzetten kost normaal weken aan afstemming tussen strategie, media en creatief. Campaign Architect comprimeert dat: funnel design, kanaalverdeling, KPI-targets, en creative briefings — geïntegreerd en consistent.',
    result: 'Volledige campagne-opzet inclusief funnel, mediamix en content briefings.',
    agents: 'Helmsman · Quill · Navigator',
  },
]

const STRATEGIC: Product[] = [
  {
    num: '05',
    name: 'Market Intelligence',
    tagline: 'Weet wat er in je markt verandert. Voordat je concurrent het vertelt.',
    body: 'De meeste teams doen concurrentie-analyse als ze een pitch moeten winnen. Market Intelligence draait continu: concurrenten volgen, positionerings-witte-vlekken, prijsverschuivingen, en markttrends die relevant zijn voor jouw categorie.',
    result: 'Maandelijks intelligence-rapport, directe meldingen bij significante verschuivingen, en een positionerings-analyse die je strategie voedt.',
    agents: 'Spy · Lookout · Sage',
  },
  {
    num: '06',
    name: 'Strategic Scan',
    tagline: "Een second opinion die 's nachts werkt.",
    body: 'Voor je een kwartaalplan presenteert, een nieuwe markt betreedt, of een herpositionering voorstelt — laat het systeem meekijken. Positie-analyse, ICP-validatie, kanaal-assessment, en een onderbouwd tegengeluid op je eigen aannames.',
    result: 'Strategische analyse met onderbouwing, contra-perspectief, en concrete aanbevelingen.',
    agents: 'Sage · Spy · Navigator',
  },
]

// ── Cases ────────────────────────────────────────────────────────────────────
type Case = {
  sector:   string
  scope:    string
  quote:    string
  product:  string
  approach: string[]
  result:   string
  source:   string
  isCrew?:  boolean
}

const CASES: Case[] = [
  {
    sector:  'Hospitality & Catering',
    scope:   'MKB · Regio Randstad',
    quote:   'Sterke culinaire reputatie. Nul systeem om daar klanten mee te winnen. Sales draaide op toeval en bestaand netwerk.',
    product: 'CRM Autopilot + Content Engine',
    approach: [
      '5-fasen CRM-traject van onbekend naar preferred supplier',
      'Margecalculator als lead magnet met geautomatiseerde opvolging',
      '4-mail nurture flow + kwartaal-roundtable programma',
      'LinkedIn thought leadership strategie op persoonlijk profiel',
    ],
    result: 'Compleet acquisitiesysteem zonder koude acquisitie. 3 conversietools, geautomatiseerde lead-opvolging, en een kwartaalformat dat 10–15 warme relaties per editie oplevert.',
    source: 'Directeur, hospitality-bedrijf',
  },
  {
    sector:  'Automotive / Mobiliteit',
    scope:   'Scale-up · Nationaal',
    quote:   'Sterk merk, duidelijke missie, vier buyer personas. Maar de content sprak alleen de early adopter aan — niet de 65% die op prijs en zekerheid beslist.',
    product: 'Strategic Scan + Content Engine',
    approach: [
      'Analyse van merk-documenten, tone of voice en persona\'s',
      'Identificatie van onbenutte doelgroep (vrouwelijke co-beslissers)',
      'Messaging framework per persona-segment',
      '3-maanden contentkalender met kanaalverdeling',
    ],
    result: 'Verschuiving van tech-first naar benefit-first messaging. Nieuwe doelgroep-laag ontsloten zonder merkidentiteit te veranderen.',
    source: 'Marketing lead, mobiliteits-scale-up',
  },
  {
    sector:  'D2C E-commerce / Mode',
    scope:   'Scale-up · €5–15M omzet',
    quote:   'Het paid budget liep van Meta naar Google naar TikTok zonder dat iemand precies kon zeggen welke creatives werkten. We rapporteerden meer dan we optimaliseerden.',
    product: 'Performance Ops + Campaign Architect',
    approach: [
      'Dagelijkse anomaliedetectie op campagne-niveau (CPM-spikes, ROAS-drops)',
      'Automatische budget-herverdeling op basis van rolling 7-dagen ROAS',
      'Creative-performance loop: dagelijkse winners genereren een nieuwe variant-briefing',
      'Wekelijkse strategische review met hierarchisch zicht in plaats van losse kanaal-rapporten',
    ],
    result: 'Rapportage-tijd voor het marketingteam halveerde (van ~60 naar ~30 uur per maand). Nieuwe creatives leven binnen dagen ipv weken. Paid-budget meetbaar efficiënter en — net zo belangrijk — beter te verdedigen richting de board.',
    source: 'Marketing director, D2C scale-up',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────
// ── JSON-LD structured data (computed once at module load) ─────────────────
// Helps both classic search engines (rich snippets via ItemList) and LLMs
// (Claude/ChatGPT/Perplexity ground their answers on schema.org).
const ALL_PRODUCTS = [...OPERATIONAL, ...STRATEGIC]
const STRUCTURED_DATA = serializeJsonLd([
  buildBreadcrumbSchema([
    { name: 'Home',         url: BASE },
    { name: 'Oplossingen',  url: `${BASE}/oplossingen` },
  ]),
  buildOrganizationSchema({
    name: 'Brand PWRD Media',
    url:  BASE,
  }),
  buildPersonSchema({
    name:        'Mark de Kock',
    url:         BASE,
    jobTitle:    'Founder · AI strategie & executie',
    description: 'Founder van Brand PWRD Media. Bouwt AI-agent-systemen voor marketing- en salesteams.',
    orgName:     'Brand PWRD Media',
    orgUrl:      BASE,
    country:     'NL',
    knowsAbout:  ['AI agents', 'Marketing automation', 'Sales operations', 'AI implementation', 'Generative AI', 'Brand strategy'],
    linkedin:    'https://www.linkedin.com/in/markdekock/',
  }),
  // ItemList of the 6 products — gives Google rich-snippet eligibility
  // and gives LLMs a clean, citable list to reference in answers.
  {
    '@context': 'https://schema.org',
    '@type':    'ItemList',
    name:        'AI-agent oplossingen voor marketing & sales',
    description: 'Zes productized AI-agent oplossingen, gebouwd op The Crew framework.',
    numberOfItems: ALL_PRODUCTS.length,
    itemListElement: ALL_PRODUCTS.map((p, i) => ({
      '@type':   'ListItem',
      position:  i + 1,
      item: {
        '@type':       'Service',
        name:          p.name,
        description:   p.tagline + ' ' + p.body,
        serviceType:   'AI marketing & sales automation',
        provider: {
          '@type': 'Organization',
          name:    'Brand PWRD Media',
          url:     BASE,
        },
        areaServed:    'Netherlands',
        url:           `${BASE}/oplossingen#${p.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
    })),
  },
])

export default function OplossingenPage() {
  return (
    <div style={{ background: WHITE, color: INK, fontFamily: FONT, minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA }} />

      {/* ── Slim nav (consistent met mentor) ───────────────────────────── */}
      <nav style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/mentor" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: INK, lineHeight: 1.2 }}>Mark de Kock</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>AI strategie & executie</p>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Link
              href="/oplossingen"
              style={{
                fontSize: 13, fontWeight: 700, color: INK, textDecoration: 'none',
                borderBottom: `2px solid ${WARM}`, paddingBottom: 2,
              }}
            >
              Oplossingen
            </Link>
            <Link href="/werk" style={{ fontSize: 13, fontWeight: 600, color: BODY, textDecoration: 'none' }}>Projecten</Link>
            <a
              href={CALENDLY_INTAKE}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: WARM, color: WHITE, fontSize: 13, fontWeight: 700,
                padding: '8px 20px', borderRadius: 100, textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Plan gesprek →
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ background: INK, color: WHITE, padding: '88px 24px 64px' }}>
        <div className="max-w-3xl mx-auto">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: WARM, marginBottom: 20 }}>
            Brand PWRD Media · Oplossingen
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 24, color: WHITE }}>
            AI-agents voor marketing- en salesteams.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, maxWidth: 560 }}>
            Werkende systemen die leren en je team verder versnellen.
          </p>
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────────────────────────── */}
      <section style={{ background: WHITE, padding: '64px 24px 56px' }}>
        <div className="max-w-3xl mx-auto">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: WARM, marginBottom: 14 }}>
            Het probleem
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 24, letterSpacing: '-0.015em', color: INK }}>
            Je team is niet te klein. Het systeem ontbreekt.
          </h2>
          <div style={{ fontSize: 16, lineHeight: 1.75, color: BODY, maxWidth: 620 }}>
            <p style={{ marginBottom: 16 }}>
              De meeste marketingteams die ik spreek hebben genoeg mensen en genoeg tools. Wat ze niet hebben is een systeem dat intelligence, executie en performance met elkaar verbindt.
            </p>
            <p style={{ marginBottom: 16 }}>
              Het resultaat: strategen die data missen. Marketeers die hetzelfde rapport drie keer maken. Campagnes die live gaan zonder dat iemand het effect van vorige maand heeft bekeken.
            </p>
            <p>
              De oplossing is niet méér tooling. Het is een laag die samenwerkt met je team — agents die de routinearbeid doen zodat je mensen het werk doen waarvoor je ze hebt aangenomen.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS — Tier 1: Operationeel ────────────────────────────── */}
      <section style={{ background: LIGHT, padding: '56px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-5xl mx-auto">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
            Tier 1 · Voor je dagelijkse operatie
          </p>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, marginBottom: 36, color: INK, letterSpacing: '-0.015em' }}>
            Vier systemen die elke werkweek meedraaien.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {OPERATIONAL.map(p => <ProductCard key={p.num} p={p} accent={ACCENT} />)}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS — Tier 2: Strategisch ─────────────────────────────── */}
      <section style={{ background: WHITE, padding: '56px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-5xl mx-auto">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: WARM, marginBottom: 10 }}>
            Tier 2 · Voor strategische momenten
          </p>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, marginBottom: 36, color: INK, letterSpacing: '-0.015em' }}>
            Twee systemen voor de keuzes die tellen.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {STRATEGIC.map(p => <ProductCard key={p.num} p={p} accent={WARM} />)}
          </div>
        </div>
      </section>

      {/* ── CASES ──────────────────────────────────────────────────────── */}
      <section style={{ background: LIGHT, padding: '64px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-3xl mx-auto" style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>
            In de praktijk
          </p>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, marginBottom: 8, color: INK, letterSpacing: '-0.015em' }}>
            Geen merknamen. Wel de situatie die je herkent.
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-5">
          {CASES.map((c, i) => <CaseCard key={i} c={c} />)}
        </div>
      </section>

      {/* ── THE CREW — system overlay (volle-breedte donker statement) ─── */}
      <section style={{ background: INK, color: WHITE, padding: '104px 24px' }}>
        <div className="max-w-3xl mx-auto">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: WARM, marginBottom: 16 }}>
            Het systeem · Brand PWRD Media zelf
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 28, color: WHITE, letterSpacing: '-0.025em' }}>
            Wat we voor klanten bouwen, draaien we eerst zelf.
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 18, maxWidth: 620, fontStyle: 'italic' }}>
            &ldquo;De zes producten op deze pagina draaien op één geïntegreerd systeem. Wat we voor klanten inrichten, gebruiken we elk dag op ons eigen bureau.&rdquo;
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 40 }}>
            — Brand PWRD Media · doorlopend in productie
          </p>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: 32, maxWidth: 620 }}>
            Tien gespecialiseerde AI-agents in drie fasen. Intelligence verzamelt en analyseert; Execution vertaalt naar werk; Performance meet en voedt de volgende ronde.
          </p>

          {/* Mini flow diagram */}
          <div className="grid md:grid-cols-3 gap-4" style={{ alignItems: 'stretch', marginBottom: 36 }}>
            {[
              { phase: '01 · Intelligence', body: 'Markt, concurrenten, performance, positie. Continue input voor strategische en operationele keuzes.', agents: 'Spy · Lookout · Sage', tone: ACCENT },
              { phase: '02 · Execution',    body: 'Van strategie naar campagnes, content, mediaplannen en CRM-flows. Geen handmatige overdracht.', agents: 'Helmsman · Quill · Slogger · Navigator', tone: WARM },
              { phase: '03 · Performance',  body: 'Meet wat werkt en wat niet. Voedt direct terug naar Intelligence voor de volgende cyclus.', agents: 'Chronicle · Lookout', tone: '#10B981' },
            ].map(f => (
              <div key={f.phase} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '20px 22px',
              }}>
                <div style={{ width: 36, height: 3, background: f.tone, borderRadius: 2, marginBottom: 12 }} />
                <p style={{ fontSize: 12, fontWeight: 800, color: WHITE, letterSpacing: '0.05em', marginBottom: 8 }}>
                  {f.phase}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, marginBottom: 10 }}>
                  {f.body}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                  {f.agents}
                </p>
              </div>
            ))}
          </div>

          {/* Result statement (uit de oude Crew-case) */}
          <div style={{
            background: 'rgba(217, 119, 6, 0.08)',
            borderLeft: `3px solid ${WARM}`,
            padding: '20px 24px',
            borderRadius: '0 12px 12px 0',
            marginBottom: 28,
          }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: WARM, marginBottom: 8 }}>
              Resultaat
            </p>
            <p style={{ fontSize: 16, color: WHITE, lineHeight: 1.6, fontWeight: 600 }}>
              Eén operationeel systeem dat dagelijks marketing-werk doet voor een handvol klanten parallel — zonder team-uitbreiding.
            </p>
          </div>

          <a
            href="/thecrew/nl"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              color: WARM, fontSize: 14, fontWeight: 700,
              borderBottom: `2px solid ${WARM}66`,
              paddingBottom: 2,
              textDecoration: 'none',
            }}
          >
            Bekijk de volledige architectuur →
          </a>
        </div>
      </section>

      {/* ── Extra: voor je team — praktijkcursus AI ─────────────────────── */}
      <section style={{ background: LIGHT, padding: '64px 24px', borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-3xl mx-auto">
          <div style={{
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, margin: 0 }}>
              Extra · Voor je team
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: INK, lineHeight: 1.3, margin: 0, letterSpacing: '-0.01em' }}>
              De systemen werken beter als je team weet wat AI is.
            </h3>
            <p style={{ fontSize: 15, color: BODY, lineHeight: 1.65, margin: 0 }}>
              Samen met Frank Meeuwsen ontwikkelden we cursusclaudecode.nl — een praktijkcursus voor professionals die AI willen gebruiken, niet bespreken. Past goed naast deze oplossingen, of als startpunt voor je team voordat we systemen bouwen.
            </p>
            <a
              href="https://cursusclaudecode.nl/mdk?utm_source=markdekock_oplossingen&utm_medium=cta_block&utm_campaign=mdk_affiliate"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                alignSelf: 'flex-start',
                marginTop: 4,
                color: ACCENT,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                borderBottom: `2px solid ${ACCENT}55`,
                paddingBottom: 2,
              }}
            >
              Bekijk de cursus ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section style={{ background: WHITE, padding: '96px 24px' }}>
        <div className="max-w-2xl mx-auto" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 900, marginBottom: 18, color: INK, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Nieuwsgierig welk systeem bij jouw team past?
          </h2>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.7, marginBottom: 32 }}>
            Plan een vrijblijvend gesprek. We kijken samen waar de grootste winst zit — en of een agent-systeem de juiste oplossing is.
          </p>
          <a
            href={CALENDLY_INTAKE}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: WARM, color: WHITE, fontWeight: 700, fontSize: 16,
              padding: '15px 36px', borderRadius: 100, textDecoration: 'none',
              boxShadow: `0 12px 32px ${WARM}55`,
            }}
          >
            Plan een gesprek →
          </a>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 16 }}>
            30 minuten · Geen verplichting · We kijken of er een match is
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ background: '#000', color: 'rgba(255,255,255,0.7)', padding: '32px 24px', fontSize: 12 }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <span>© {new Date().getFullYear()} Mark de Kock · Brand PWRD Media</span>
          <span style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/mentor"      style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Adviestrajecten</Link>
            <Link href="/oplossingen" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Oplossingen</Link>
            <Link href="/werk"        style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Projecten</Link>
            <a href="/thecrew/nl" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>The Crew</a>
            <a
              href="https://cursusclaudecode.nl/mdk?utm_source=markdekock_oplossingen&utm_medium=footer&utm_campaign=mdk_affiliate"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
            >
              Praktijkcursus AI ↗
            </a>
          </span>
        </div>
      </footer>

      {/* unused-token suppression */}
      <span style={{ display: 'none' }}>{NAVY}{WARM_LIGHT}</span>
    </div>
  )
}

// ── Subcomponents ───────────────────────────────────────────────────────────

function ProductCard({ p, accent }: { p: Product; accent: string }) {
  return (
    <article style={{
      background: WHITE,
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: '24px 24px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: '0.05em' }}>{p.num}</span>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: '-0.01em' }}>{p.name}</h3>
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: accent, lineHeight: 1.3 }}>
        {p.tagline}
      </p>
      <p style={{ fontSize: 14, color: BODY, lineHeight: 1.65 }}>
        {p.body}
      </p>
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12, marginTop: 'auto' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 4 }}>
          → {p.result}
        </p>
        <p style={{ fontSize: 11, color: MUTED, fontStyle: 'italic', marginTop: 8 }}>
          Powered by: {p.agents}
        </p>
      </div>
    </article>
  )
}

function CaseCard({ c }: { c: Case }) {
  const headerBg = c.isCrew ? INK : WHITE
  const headerText = c.isCrew ? WHITE : INK
  const sectorTone = c.isCrew ? WARM : ACCENT
  return (
    <article style={{
      background: WHITE,
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <div style={{ background: headerBg, color: headerText, padding: '20px 24px', borderBottom: c.isCrew ? 'none' : `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: sectorTone, marginBottom: 4 }}>
          {c.sector} · <span style={{ color: c.isCrew ? 'rgba(255,255,255,0.6)' : MUTED, letterSpacing: '0.05em' }}>{c.scope}</span>
        </p>
        <p style={{ fontSize: 16, fontWeight: 600, color: c.isCrew ? 'rgba(255,255,255,0.9)' : INK, lineHeight: 1.5, fontStyle: 'italic' }}>
          &ldquo;{c.quote}&rdquo;
        </p>
      </div>
      <div style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: ACCENT, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
          Product · {c.product}
        </p>
        <ul style={{ paddingLeft: 20, marginBottom: 16, listStyle: 'disc' }}>
          {c.approach.map((a, i) => (
            <li key={i} style={{ fontSize: 13.5, color: BODY, lineHeight: 1.6, marginBottom: 4 }}>{a}</li>
          ))}
        </ul>
        <p style={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.55, marginBottom: 12 }}>
          → {c.result}
        </p>
        <p style={{ fontSize: 11, color: MUTED, textAlign: 'right', fontStyle: 'italic' }}>
          — {c.source}
        </p>
      </div>
    </article>
  )
}
