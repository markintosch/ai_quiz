'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'

const INK        = '#0F172A'
const WHITE      = '#FFFFFF'
const LIGHT      = '#F8FAFC'
const WARM       = '#D97706'
const WARM_LIGHT = '#FEF3C7'
const ACCENT     = '#1D4ED8'
const BODY       = '#374151'
const MUTED      = '#94A3B8'
const BORDER     = '#E2E8F0'

const CALENDLY_INTAKE = 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
}

const T = {
  nl: {
    navName:    'Mark de Kock',
    navRole:    'Strategisch mentor voor AI & executie',
    navPartner: 'Partner · Kirk & Blackbeard',
    navCta:     'Plan gesprek →',

    heroLabel:  'Wat ik maak',
    heroTitle:  'Ik adviseer niet alleen. Ik maak ook.',
    heroBody:   'De meeste adviseurs praten over AI. Ik gebruik het om dingen te bouwen die werken. Samen met Claude heb ik een platform ontwikkeld dat nu acht diagnostische producten draait — voor sectoren van pharma tot M&A, van klantervaringsmanagement tot cloud readiness. Productieomgeving. Meerdere talen. Één architectuur.',

    platformLabel: 'Het platform',
    platformTitle: 'Één codebase. Acht producten. Zeven klantcontexten.',
    platformBody:  'Wat begon als een AI-gereedheidsdiagnose is uitgegroeid tot een white-label assessmentplatform met eigen subdomeinen per klant, volledig admin-dashboard, GDPR-compliance, score-gebaseerde routering en een live multiplayer quiz-engine voor evenementen. Gebouwd met AI als co-developer op elke laag — van architectuur tot copy tot securityaudit.',
    platformStack: 'Next.js 14 · Supabase · Vercel · Resend · Tailwind · Framer Motion',

    projectsLabel: 'Voorbeelden',
    projects: [
      {
        tag:   'Diagnostisch platform',
        title: 'AI-gereedheidsdiagnose',
        body:  'Zes dimensies. Zesentwintig vragen. Benchmarking per sector en rol. Shadow AI-detectie. Ingezet als publiek instrument én als white-label product met bedrijfsbranding, cohortanalyse en meertalige ondersteuning. Het fundament waarop alles daarna gebouwd is.',
        pills: ['NL · EN · FR', 'White-label', 'Benchmarking', 'Cohortanalyse'],
        accent: ACCENT,
      },
      {
        tag:   'Due diligence tool',
        title: 'M&A-gereedheid',
        body:  'Zeven dimensies. Vier invalshoeken — eigenaar, PE-investeerder, portfoliobedrijf, adviseur. Dezelfde organisatie, vier verschillende lezingen van de data. Het scoringsmodel maakt zichtbaar waar de waardecreatie-aannames realistisch zijn en waar niet.',
        pills: ['4 rollen', 'Scoringslogica', 'Exit readiness'],
        accent: '#6B2D8B',
      },
      {
        tag:   'Go-to-market intelligence',
        title: 'Oncologie GTM',
        body:  'Lanceringsgereedheid voor een diagnostisch product in tien Europese markten. Aparte invalshoeken voor Medical Affairs, Country Heads, Market Access en Commercial — elk met relevante dimensies en een gedeeld dashboard voor kwartaalomzet per markt.',
        pills: ['10 markten', 'Pharma', '4 rollen', 'Sales dashboard'],
        accent: '#047857',
      },
      {
        tag:   'Live engagement',
        title: 'Arena',
        body:  'Een multiplayer quiz-engine voor evenementen en workshops. Deelnemers joinen met een code, beantwoorden getimede vragen, zien een live scorebord bijwerken. Gescoord op juistheid, snelheid en moeilijkheidsgraad. Voor teams die op een andere manier geactiveerd willen worden dan via een standaard sessie.',
        pills: ['Real-time', 'Live scorebord', 'Evenementen'],
        accent: WARM,
      },
      {
        tag:   'Positioneringssite',
        title: 'markdekock.com',
        body:  'Deze site. Van nul naar live in één iteratief traject — positionering, copy, UX, techniek, DNS, deployment. Tweetalig. Directe rootdomein-routing zonder redirect. Elk stuk copy gebouwd vanuit echte observaties, niet vanuit een brief.',
        pills: ['NL · EN', 'Rootdomein-routing', 'Calendly-integratie'],
        accent: INK,
      },
    ],

    closingTitle: 'Wat dit betekent',
    closingBody:  'Ik kan meedenken over strategie en het daarna ook uitvoeren. Niet via een ontwikkelaar die mijn briefing interpreteert — maar direct, snel en met begrip van wat er onder de motorkap zit. Dat verandert wat er mogelijk is in een traject.',

    ctaTitle: 'Klaar om te bouwen?',
    ctaBody:  'Plan een intakegesprek. We kijken samen wat logisch is als eerste stap.',
    ctaCta:   'Plan gratis intake →',
    ctaTrust: 'Gratis · Geen verplichting · 30 minuten',

    footerCopy: 'Strategisch mentor voor AI & executie',
    footerSub:  'markdekock.com',
    footerBack: '← Terug naar markdekock.com',
  },
  en: {
    navName:    'Mark de Kock',
    navRole:    'Strategic mentor for AI & execution',
    navPartner: 'Partner · Kirk & Blackbeard',
    navCta:     'Book a call →',

    heroLabel:  'What I build',
    heroTitle:  'I don\'t just advise. I build too.',
    heroBody:   'Most advisors talk about AI. I use it to build things that work. Together with Claude I\'ve developed a platform that now runs eight diagnostic products — across pharma, M&A, customer experience and cloud readiness. Production environment. Multiple languages. One architecture.',

    platformLabel: 'The platform',
    platformTitle: 'One codebase. Eight products. Seven client contexts.',
    platformBody:  'What started as an AI readiness diagnostic has grown into a white-label assessment platform with per-client subdomains, a full admin dashboard, GDPR compliance, score-based routing and a live multiplayer quiz engine for events. Built with AI as co-developer at every layer — from architecture to copy to security audit.',
    platformStack: 'Next.js 14 · Supabase · Vercel · Resend · Tailwind · Framer Motion',

    projectsLabel: 'Examples',
    projects: [
      {
        tag:   'Diagnostic platform',
        title: 'AI Maturity Assessment',
        body:  'Six dimensions. Twenty-six questions. Benchmarking by sector and role. Shadow AI detection. Deployed as a public tool and as a white-label product with company branding, cohort analysis and multi-language support. The foundation everything else is built on.',
        pills: ['NL · EN · FR', 'White-label', 'Benchmarking', 'Cohort analysis'],
        accent: ACCENT,
      },
      {
        tag:   'Due diligence tool',
        title: 'M&A Readiness',
        body:  'Seven dimensions. Four entry points — owner, PE investor, portfolio company, advisor. The same organisation, four different readings of the data. The scoring model surfaces where value creation assumptions hold and where they don\'t.',
        pills: ['4 roles', 'Scoring logic', 'Exit readiness'],
        accent: '#6B2D8B',
      },
      {
        tag:   'Go-to-market intelligence',
        title: 'Oncology GTM',
        body:  'Launch readiness for a diagnostic product across ten European markets. Separate entry points for Medical Affairs, Country Heads, Market Access and Commercial — each with relevant dimensions and a shared dashboard tracking quarterly revenue per market.',
        pills: ['10 markets', 'Pharma', '4 roles', 'Sales dashboard'],
        accent: '#047857',
      },
      {
        tag:   'Live engagement',
        title: 'Arena',
        body:  'A multiplayer quiz engine for events and workshops. Participants join with a code, answer timed questions, watch a live leaderboard update. Scored on accuracy, speed and difficulty. For teams that want a different kind of activation than a standard session.',
        pills: ['Real-time', 'Live leaderboard', 'Events'],
        accent: WARM,
      },
      {
        tag:   'Positioning site',
        title: 'markdekock.com',
        body:  'This site. From zero to live in one iterative process — positioning, copy, UX, engineering, DNS, deployment. Bilingual. Root domain routing without redirect. Every piece of copy built from real observations, not from a brief.',
        pills: ['NL · EN', 'Root domain routing', 'Calendly integration'],
        accent: INK,
      },
    ],

    closingTitle: 'What this means',
    closingBody:  'I can think through strategy and then execute it. Not via a developer who interprets my brief — directly, quickly and with understanding of what\'s under the hood. That changes what\'s possible in an engagement.',

    ctaTitle: 'Ready to build?',
    ctaBody:  'Book an intake call. We\'ll look together at what makes sense as a first step.',
    ctaCta:   'Book free intake →',
    ctaTrust: 'Free · No commitment · 30 minutes',

    footerCopy: 'Strategic mentor for AI & execution',
    footerSub:  'markdekock.com',
    footerBack: '← Back to markdekock.com',
  },
}

export default function WerkPage() {
  const [lang, setLang] = useState<'nl' | 'en'>('nl')
  const t = T[lang]

  return (
    <div style={{ minHeight: '100vh', background: WHITE, color: INK, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <nav style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/mentor" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: INK, lineHeight: 1.2 }}>{t.navName}</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.navRole}</p>
              <p style={{ fontSize: 10, color: WARM, fontWeight: 600, lineHeight: 1.2 }}>{t.navPartner}</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: lang === l ? WHITE : 'transparent', color: lang === l ? INK : MUTED, border: 'none', cursor: 'pointer', boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.10)' : 'none', transition: 'all 0.15s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a href={CALENDLY_INTAKE} target="_blank" rel="noopener noreferrer" style={{ background: WARM, color: WHITE, fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t.navCta}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: INK, paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 20 }}>
              {t.heroLabel}
            </motion.p>
            <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: WHITE, lineHeight: 1.1, marginBottom: 20 }}>
              {t.heroTitle}
            </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize: 17, color: MUTED, lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
              {t.heroBody}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Platform */}
      <section style={{ background: LIGHT, padding: '72px 24px' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: 14 }}>
              {t.platformLabel}
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: INK, marginBottom: 20, lineHeight: 1.25 }}>
              {t.platformTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ textAlign: 'center', fontSize: 16, color: BODY, lineHeight: 1.75, maxWidth: 580, margin: '0 auto 24px' }}>
              {t.platformBody}
            </motion.p>
            <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
              <span style={{ display: 'inline-block', fontSize: 12, color: MUTED, fontFamily: 'monospace', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 16px', letterSpacing: '0.03em' }}>
                {t.platformStack}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Projects */}
      <section style={{ background: WHITE, padding: '80px 24px' }}>
        <div className="max-w-5xl mx-auto">
          <motion.p
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: WARM, marginBottom: 48 }}
          >
            {t.projectsLabel}
          </motion.p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {t.projects.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}
                style={{
                  background: LIGHT,
                  borderRadius: 20,
                  padding: '32px 36px',
                  border: `1px solid ${BORDER}`,
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: 32,
                  alignItems: 'start',
                  marginBottom: 16,
                }}
                className="flex-col sm:grid"
              >
                {/* Left */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: WHITE }}>{(i + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED }}>
                      {p.tag}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: INK, lineHeight: 1.2, marginBottom: 16 }}>
                    {p.title}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {p.pills.map((pill, j) => (
                      <span key={j} style={{ fontSize: 11, fontWeight: 600, color: p.accent, background: `${p.accent}12`, border: `1px solid ${p.accent}30`, borderRadius: 100, padding: '3px 10px' }}>
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Right */}
                <div style={{ paddingTop: 4 }}>
                  <p style={{ fontSize: 15, color: BODY, lineHeight: 1.75 }}>{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section style={{ background: LIGHT, padding: '72px 24px' }}>
        <div className="max-w-2xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
            <motion.div variants={fadeUp} style={{ background: WHITE, borderRadius: 20, padding: '40px 44px', border: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: WARM_LIGHT, fontFamily: 'serif' }}>M</span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: INK, marginBottom: 10 }}>{t.closingTitle}</p>
                  <p style={{ fontSize: 15, color: BODY, lineHeight: 1.75 }}>{t.closingBody}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: INK, padding: '100px 24px' }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: WHITE, marginBottom: 16, lineHeight: 1.15 }}>
              {t.ctaTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 17, color: MUTED, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 44px' }}>
              {t.ctaBody}
            </motion.p>
            <motion.div variants={fadeUp}>
              <a href={CALENDLY_INTAKE} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: WARM, color: WHITE, fontWeight: 700, fontSize: 16, padding: '16px 40px', borderRadius: 100, textDecoration: 'none', boxShadow: `0 12px 32px ${WARM}55` }}>
                {t.ctaCta}
              </a>
            </motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: 13, color: '#475569', marginTop: 20 }}>
              {t.ctaTrust}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1E293B', background: '#080E1A', padding: '28px 24px' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div style={{ width: 24, height: 24, borderRadius: 6, background: INK, border: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</div>
            <span style={{ fontSize: 13, color: '#475569' }}>{t.navName} — {t.footerCopy}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="/" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>{t.footerBack}</a>
            <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>{t.footerSub} · {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
