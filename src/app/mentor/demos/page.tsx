'use client'

// ─────────────────────────────────────────────────────────────────────────────
// INTRO COPY — edit freely, both NL and EN versions
// ─────────────────────────────────────────────────────────────────────────────
const INTRO = {
  nl: {
    label:  'Gedeeld met jou',
    title:  'Ik adviseer niet alleen. Ik maak ook.',
    body:   `Vanaf dag één zag ik de impact die AI heeft en nog gaat krijgen. Afwachten leek me geen goed plan. Dus ben ik er headfirst ingedoken — met name (maar niet alleen) via Claude. Die kennis zet ik in voor opdrachtgevers. Ik bouw de brug tussen bedrijfsdoelen, strategie en tastbare, inzetbare AI.\n\nDe afgelopen weken heb ik een reeks applicaties gebouwd — voor sectoren van pharma tot fitness, van cloud security tot M&A. Ze draaien allemaal op dezelfde architectuur. Ik deel ze om te laten zien dat er snel tastbare middelen te ontwikkelen zijn. De meeste hiervan zijn eenvoudig van opzet maar heel effectief in te zetten. Je kunt bepalen of en hoe zoiets past bij jouw uitdaging.`,
    sub:    'Zit er iets bij dat past bij jouw vraagstuk? Heb je een ander idee? Plan een gesprek.',
  },
  en: {
    label:  'Shared with you',
    title:  'I don\'t just advise. I build too.',
    body:   `From day one I could see the impact AI has — and is going to have. Waiting it out didn't seem like a good plan. So I went in headfirst — mainly (but not only) through Claude. I apply that knowledge for clients. Building the bridge between business goals, strategy and tangible, deployable AI.\n\nOver the past few weeks I built a range of applications — across pharma, fitness, cloud security, M&A and more. They all run on the same architecture. I'm sharing them to show that tangible tools can be built quickly. Most of these are simple in concept but highly effective in practice. You can decide whether and how something like this fits your challenge.`,
    sub:    'See something that fits your question? Have a different idea? Let\'s talk.',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS — edit titles, descriptions, audience, links freely
// demo: null = "Demo op aanvraag / Available on request"
// ─────────────────────────────────────────────────────────────────────────────
const BASE = 'https://aiquiz.brandpwrdmedia.nl'

const PROJECTS = [
  {
    num:       '01',
    accent:    '#1D4ED8',
    tag:       { nl: 'AI-gereedheid', en: 'AI readiness' },
    audience:  { nl: 'Directie & MT, alle sectoren', en: 'Leadership & MT, all sectors' },
    method:    'Assessment',
    methodColor: '#1D4ED8',
    title:     { nl: 'AI Maturity Assessment', en: 'AI Maturity Assessment' },
    body: {
      nl: 'Zes dimensies. Zesentwintig vragen. Benchmarking per sector en rol. Shadow AI-detectie. Ingezet als publiek instrument én als white-label product met bedrijfsbranding, cohortanalyse en meertalige ondersteuning.',
      en: 'Six dimensions. Twenty-six questions. Benchmarking by sector and role. Shadow AI detection. Deployed as a public tool and as a white-label product with branding, cohort analysis and multi-language support.',
    },
    pills: { nl: ['NL · EN · FR', 'White-label', 'Benchmarking', 'Cohortanalyse'], en: ['NL · EN · FR', 'White-label', 'Benchmarking', 'Cohort analysis'] },
    demo: `${BASE}/en`,
  },
  {
    num:       '02',
    accent:    '#00C58E',
    tag:       { nl: 'Cloud security', en: 'Cloud security' },
    audience:  { nl: 'Security- & cloudteams, CISO', en: 'Security & cloud teams, CISO' },
    method:    'Assessment',
    methodColor: '#1D4ED8',
    title:     { nl: 'Cloud Security Assessment', en: 'Cloud Security Assessment' },
    body: {
      nl: 'Gebaseerd op de Sysdig 555 Benchmark. Vijf dimensies: detectie, respons, zichtbaarheid, compliance en cultuur. Levert een score per dimensie, een tier-label en een actieaanbeveling. Aangeboden aan TrueFullstaq en Sound Consulting.',
      en: 'Based on the Sysdig 555 Benchmark. Five dimensions: detection, response, visibility, compliance and culture. Delivers a score per dimension, a tier label and an action recommendation. Offered to TrueFullstaq and Sound Consulting.',
    },
    pills: { nl: ['Cloud', 'Security', 'Sysdig 555'], en: ['Cloud', 'Security', 'Sysdig 555'] },
    demo: `${BASE}/sysdig_scan`,
  },
  {
    num:       '03',
    accent:    '#E10600',
    tag:       { nl: 'F1 kennisrace · Events', en: 'F1 knowledge race · Events' },
    audience:  { nl: 'F1-fans, corporate events, hospitality', en: 'F1 fans, corporate events, hospitality' },
    method:    'Hot Lap',
    methodColor: '#E10600',
    title:     { nl: 'Vrooooom — F1 Kennisrace', en: 'Vrooooom — F1 Knowledge Race' },
    body: {
      nl: 'F1-kennisplatform in twee modi: solo Hot Lap (getimed, elke fout kost seconden) én multiplayer (deelnemers live tegen elkaar). Tien vragen per ronde, wekelijks vernieuwd rondom het seizoen. Gebouwd als terugkerend sponsorplatform — founding sponsor-gesprekken lopen.',
      en: 'F1 knowledge platform in two modes: solo Hot Lap (timed, every wrong answer costs seconds) and multiplayer (participants live against each other). Ten questions per round, refreshed weekly around the season. Built as a recurring sponsor platform — founding sponsor conversations in progress.',
    },
    pills: { nl: ['F1', 'Solo + Multiplayer', 'Leaderboard', 'Sponsoring'], en: ['F1', 'Solo + Multiplayer', 'Leaderboard', 'Sponsorship'] },
    demo: `${BASE}/vrooooom`,
  },
  {
    num:       '04',
    accent:    '#00C58E',
    tag:       { nl: 'Live event · Cloud security', en: 'Live event · Cloud security' },
    audience:  { nl: 'TrueFullstaq — security & cloudteams', en: 'TrueFullstaq — security & cloud teams' },
    method:    'Arena',
    methodColor: '#D97706',
    title:     { nl: 'TrueFullstaq Arena', en: 'TrueFullstaq Arena' },
    body: {
      nl: 'Een live multiplayer kennisbattle rondom de Sysdig 555 Benchmark — specifiek gebouwd voor TrueFullstaq-evenementen. Deelnemers joinen met een QR-code, beantwoorden getimede vragen over cloud security, en zien een live scorebord bijwerken. De host stuurt het tempo. Compleet andere opzet dan de Vrooooom Hot Lap.',
      en: 'A live multiplayer knowledge battle built around the Sysdig 555 Benchmark — built specifically for TrueFullstaq events. Participants join by QR code, answer timed cloud security questions, and watch a live leaderboard update. The host controls the pace. A completely different format from the Vrooooom Hot Lap.',
    },
    pills: { nl: ['Real-time', 'QR join', 'Cloud security', 'Host-gestuurd'], en: ['Real-time', 'QR join', 'Cloud security', 'Host-controlled'] },
    demo: `${BASE}/sysdig_555`,
  },
  {
    num:       '05',
    accent:    '#6B2D8B',
    tag:       { nl: 'Due diligence', en: 'Due diligence' },
    audience:  { nl: 'PE-investeerders, eigenaren, M&A-adviseurs', en: 'PE investors, owners, M&A advisors' },
    method:    'Assessment',
    methodColor: '#1D4ED8',
    title:     { nl: 'M&A + AI Gereedheid', en: 'M&A + AI Readiness' },
    body: {
      nl: 'Zeven dimensies. Vier invalshoeken — eigenaar, PE-investeerder, portfoliobedrijf, adviseur. Dezelfde organisatie, vier verschillende lezingen. Maakt zichtbaar waar waardecreatie-aannames houden en waar niet.',
      en: 'Seven dimensions. Four entry points — owner, PE investor, portfolio company, advisor. Same organisation, four different readings. Surfaces where value creation assumptions hold and where they don\'t.',
    },
    pills: { nl: ['4 rollen', 'Exit readiness', 'Scoringslogica'], en: ['4 roles', 'Exit readiness', 'Scoring logic'] },
    demo: `${BASE}/manda`,
  },
  {
    num:       '06',
    accent:    '#047857',
    tag:       { nl: 'Go-to-market · Pharma', en: 'Go-to-market · Pharma' },
    audience:  { nl: 'Medical Affairs, Country Heads, Market Access', en: 'Medical Affairs, Country Heads, Market Access' },
    method:    'Assessment',
    methodColor: '#1D4ED8',
    title:     { nl: 'Oncologie GTM Tool', en: 'Oncology GTM Tool' },
    body: {
      nl: 'Lanceringsgereedheid voor een diagnostisch product in tien Europese markten. Aparte invalshoeken per afdeling. Gedeeld dashboard met kwartaalomzet per markt. MVP om meerdere stakeholders in een corporate organisatie op één beeld te brengen.',
      en: 'Launch readiness for a diagnostic product across ten European markets. Separate entry points per department. Shared dashboard tracking quarterly revenue per market. MVP to align multiple stakeholders in a corporate organisation.',
    },
    pills: { nl: ['10 markten', 'Pharma', '4 rollen', 'Dashboard'], en: ['10 markets', 'Pharma', '4 roles', 'Dashboard'] },
    demo: `${BASE}/oncology`,
  },
  {
    num:       '07',
    accent:    '#BE185D',
    tag:       { nl: 'Klinische dimensies · Pharma', en: 'Clinical dimensions · Pharma' },
    audience:  { nl: 'Sales & Medical teams', en: 'Sales & Medical teams' },
    method:    'Assessment',
    methodColor: '#1D4ED8',
    title:     { nl: 'AbbVie — Klinische Dimensies', en: 'AbbVie — Clinical Dimensions' },
    body: {
      nl: 'Gemaakt ter inspiratie voor een farmaciebedrijf dat de markt anders wil benaderen. Uitdagend vanwege privacy- en compliance-eisen in de medische wereld. Ligt nu bij het sales team in NL ter overweging.',
      en: 'Built as inspiration for a pharma company looking to approach the market differently. Challenging due to privacy and compliance requirements in the medical sector. Currently with the NL sales team for consideration.',
    },
    pills: { nl: ['Pharma', 'Compliance-aware', 'Sales tool'], en: ['Pharma', 'Compliance-aware', 'Sales tool'] },
    demo: `${BASE}/abbvie`,
  },
  {
    num:       '08',
    accent:    '#0891B2',
    tag:       { nl: 'Klantbeleving · CX', en: 'Customer experience · CX' },
    audience:  { nl: 'CX-dienstverleners, marketing & sales', en: 'CX service providers, marketing & sales' },
    method:    'Assessment',
    methodColor: '#1D4ED8',
    title:     { nl: 'CX Assessment', en: 'CX Assessment' },
    body: {
      nl: 'Lead-gen en salestooling voor een partij in de CX-markt. Toont waar een organisatie staat op klantbeleving, genereert een score en koppelt die aan concrete diensten. Wordt waarschijnlijk ingezet in een campagne.',
      en: 'Lead-gen and sales tooling for a CX services company. Shows where an organisation stands on customer experience, generates a score and links it to concrete services. Likely to be deployed in a campaign.',
    },
    pills: { nl: ['Lead-gen', 'Campagne-ready', 'Score-routing'], en: ['Lead-gen', 'Campaign-ready', 'Score routing'] },
    demo: `${BASE}/cx`,
  },
  {
    num:       '09',
    accent:    '#7C3AED',
    tag:       { nl: 'Media · Community', en: 'Media · Community' },
    audience:  { nl: 'Podcast-fans, media-redacties', en: 'Podcast listeners, editorial teams' },
    method:    'Pulse',
    methodColor: '#7C3AED',
    title:     { nl: 'De Machine — Pulse', en: 'De Machine — Pulse' },
    body: {
      nl: 'Een uitvraagtool voor de fans en luisteraars van De Machine (3voor12-podcast). Vraagt waar zij staan ten opzichte van AI in muziek en cultuur. Ligt nu bij de redactie ter overweging voor gebruik in een aflevering of campagne.',
      en: 'A pulse survey tool for listeners of De Machine (3voor12 podcast). Captures where they stand on AI in music and culture. Currently with the editorial team for potential use in an episode or campaign.',
    },
    pills: { nl: ['Media', 'Community', 'Real-time inzichten'], en: ['Media', 'Community', 'Real-time insights'] },
    demo: `${BASE}/pulse`,
  },
  {
    num:       '10',
    accent:    '#0D9488',
    tag:       { nl: 'Zorg · Ledenorganisatie', en: 'Healthcare · Member organisation' },
    audience:  { nl: 'Zorgprofessionals, ledenorganisaties', en: 'Care professionals, member organisations' },
    method:    'Assessment',
    methodColor: '#1D4ED8',
    title:     { nl: 'UtrechtZorg — AI Gereedheid Zorg', en: 'UtrechtZorg — Care AI Readiness' },
    body: {
      nl: 'Assessment voor alle leden van UtrechtZorg om een eigen beeld te krijgen van hun AI-gereedheid ten opzichte van peers en markt. Koppelt resultaten aan bestaande diensten van UZ. Voorzitter heeft de test gedaan — interesse is concreet.',
      en: 'Assessment for all UtrechtZorg members to get their own picture of AI readiness versus peers and market. Links results to existing UZ services. The chair has completed the test — concrete interest confirmed.',
    },
    pills: { nl: ['Zorg', 'Benchmarking', 'Dienst-koppeling'], en: ['Care', 'Benchmarking', 'Service linking'] },
    demo: null,
  },
  {
    num:       '11',
    accent:    '#EA580C',
    tag:       { nl: 'Fitness · Wellness', en: 'Fitness · Wellness' },
    audience:  { nl: 'Sportschoolleden, PT-klanten', en: 'Gym members, PT clients' },
    method:    'Assessment',
    methodColor: '#1D4ED8',
    title:     { nl: 'Healthclub45 — Fitness Assessment', en: 'Healthclub45 — Fitness Assessment' },
    body: {
      nl: 'Assessment om via de website nieuwe mensen te inspireren om in te schrijven én bestaande klanten te activeren richting een personal trainer. Ligt nu bij de eigenaar ter overweging.',
      en: 'Assessment to inspire new people to sign up via the website and activate existing members towards a personal trainer. Currently with the owner for consideration.',
    },
    pills: { nl: ['Fitness', 'Lead-gen', 'PT-activatie'], en: ['Fitness', 'Lead-gen', 'PT activation'] },
    demo: null,
  },
]

// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'

const INK    = '#0F172A'
const WHITE  = '#FFFFFF'
const LIGHT  = '#F8FAFC'
const WARM   = '#D97706'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'

const CALENDLY = 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
}

export default function DemosPage() {
  const [lang, setLang] = useState<'nl' | 'en'>('nl')
  const t = INTRO[lang]

  return (
    <div style={{ minHeight: '100vh', background: WHITE, color: INK, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Private banner */}
      <div style={{ background: '#FEF9C3', borderBottom: '1px solid #FDE68A', padding: '10px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#92400E', margin: 0, fontWeight: 600 }}>
          🔒 Deze pagina is persoonlijk gedeeld — niet publiek vindbaar &nbsp;·&nbsp;{' '}
          <span style={{ fontWeight: 400 }}>This page is privately shared — not publicly indexed</span>
        </p>
      </div>

      {/* Nav */}
      <nav style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/mentor" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: INK, lineHeight: 1.2, margin: 0 }}>Mark de Kock</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2, margin: 0 }}>Brand PWRD Media</p>
            </div>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: lang === l ? WHITE : 'transparent', color: lang === l ? INK : MUTED, border: 'none', cursor: 'pointer', boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.10)' : 'none', transition: 'all 0.15s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ background: WARM, color: WHITE, fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {lang === 'nl' ? 'Plan gesprek →' : 'Book a call →'}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: INK, paddingTop: 72, paddingBottom: 72 }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 20 }}>
              {t.label}
            </motion.p>
            <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, color: WHITE, lineHeight: 1.12, marginBottom: 24 }}>
              {t.title}
            </motion.h1>
            {t.body.split('\n\n').map((para, i) => (
              <motion.p key={i} variants={fadeUp} style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, maxWidth: 560, margin: '0 auto 16px' }}>
                {para}
              </motion.p>
            ))}
            <motion.p variants={fadeUp} style={{ fontSize: 14, color: WARM, fontWeight: 600, marginTop: 8 }}>
              {t.sub}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Projects */}
      <section style={{ background: LIGHT, padding: '72px 24px' }}>
        <div className="max-w-3xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PROJECTS.map((p) => (
            <motion.div
              key={p.num}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}
              style={{
                background: WHITE,
                borderRadius: 16,
                border: `1px solid ${BORDER}`,
                borderLeft: `4px solid ${p.accent}`,
                padding: '28px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: p.accent, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{p.num}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.tag[lang]}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: `${p.methodColor}12`, color: p.methodColor, border: `1px solid ${p.methodColor}30` }}>
                    {p.method}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#F1F5F9', color: MUTED }}>
                    {p.audience[lang]}
                  </span>
                </div>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 800, color: INK, margin: 0, lineHeight: 1.25 }}>
                {p.title[lang]}
              </h2>

              <p style={{ fontSize: 14, color: BODY, lineHeight: 1.7, margin: 0 }}>
                {p.body[lang]}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.pills[lang].map((pill, j) => (
                    <span key={j} style={{ fontSize: 11, fontWeight: 600, color: p.accent, background: `${p.accent}10`, border: `1px solid ${p.accent}25`, borderRadius: 100, padding: '3px 10px' }}>
                      {pill}
                    </span>
                  ))}
                </div>
                {p.demo ? (
                  <a href={p.demo} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, textDecoration: 'none', background: p.accent, color: WHITE, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {lang === 'nl' ? 'Open demo →' : 'Open demo →'}
                  </a>
                ) : (
                  <span style={{ fontSize: 12, color: MUTED, fontStyle: 'italic', flexShrink: 0 }}>
                    {lang === 'nl' ? 'Demo op aanvraag' : 'Demo available on request'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: INK, padding: '88px 24px' }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 900, color: WHITE, marginBottom: 16, lineHeight: 1.15 }}>
              {lang === 'nl' ? 'Zit er iets bij dat past bij jouw uitdaging?' : 'See something that fits your challenge?'}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, color: MUTED, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 44px' }}>
              {lang === 'nl'
                ? 'Plan een vrijblijvend gesprek. We kijken samen wat logisch is als eerste stap.'
                : 'Book a no-obligation call. We\'ll look together at what makes sense as a first step.'}
            </motion.p>
            <motion.div variants={fadeUp}>
              <a href={CALENDLY} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: WARM, color: WHITE, fontWeight: 700, fontSize: 16, padding: '16px 40px', borderRadius: 100, textDecoration: 'none', boxShadow: `0 12px 32px ${WARM}55` }}>
                {lang === 'nl' ? 'Plan gratis intake →' : 'Book free intake →'}
              </a>
            </motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: 13, color: '#475569', marginTop: 20 }}>
              {lang === 'nl' ? 'Gratis · Geen verplichting · 30 minuten' : 'Free · No commitment · 30 minutes'}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1E293B', background: '#080E1A', padding: '24px' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span style={{ fontSize: 13, color: '#475569' }}>Mark de Kock — Brand PWRD Media</span>
          <a href="/mentor" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>
            {lang === 'nl' ? '← Terug naar markdekock.com' : '← Back to markdekock.com'}
          </a>
        </div>
      </footer>

    </div>
  )
}
