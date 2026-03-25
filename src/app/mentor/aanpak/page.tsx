'use client'

import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const INK        = '#0F172A'
const NAVY       = '#1E3A5F'   // eslint-disable-line @typescript-eslint/no-unused-vars
const WHITE      = '#FFFFFF'
const LIGHT      = '#F8FAFC'
const ACCENT     = '#1D4ED8'
const WARM       = '#D97706'
const WARM_LIGHT = '#FEF3C7'
const BODY       = '#374151'
const MUTED      = '#94A3B8'
const BORDER     = '#E2E8F0'

// ── Calendly URL ──────────────────────────────────────────────────────────────
const CALENDLY_INTAKE = 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.10 } },
}

// ── Content ───────────────────────────────────────────────────────────────────
const T = {
  nl: {
    navName:    'Mark de Kock',
    navRole:    'Strategisch mentor voor AI & executie',
    navPartner: 'Partner · Kirk & Blackbeard',
    navCta:     'Plan gesprek →',

    heroLabel: 'Drie manieren van werken',
    heroTitle: 'Kies wat past bij jouw situatie.',
    heroBody:  'Elk traject begint met een gratis intakegesprek. Geen verplichting. We bekijken samen wat logisch is.',

    tiers: [
      {
        badge:    'Instap',
        name:     'Oriëntatie',
        tagline:  'Weten waar je staat, voordat je een stap zet.',
        duration: '3-4 weken · 2 sessies',
        outcome:  'Je verlaat dit traject met een eerlijk richtingadvies.',
        items: [
          'Intake en situatieanalyse op basis van de AI-scan',
          'Scherp beeld van waar je staat en wat prioriteit heeft',
          'Inzicht in risico\'s en kansen die nu relevant zijn',
          'Advies over of en hoe een vervolgtraject zinvol is',
        ],
        cta:      'Plan gratis intake →',
        trust:    'Gratis intake · Geen verplichting',
        forWhom:  'Voor wie wil verkennen zonder te committeren.',
        elevated: false,
      },
      {
        badge:    'Meest gekozen',
        name:     'Traject',
        tagline:  'Van beeld naar eerste echte voortgang.',
        duration: '3 maanden · Maandelijkse sessies + ad-hoc contact',
        outcome:  'Je verlaat dit traject met iets dat werkt en intern verder kan.',
        items: [
          'Scherp krijgen: situatie, prioriteit en eigenaarschap',
          'Eerste werkende use case of besluitvormingskader',
          'Managementteam betrekken waar zinvol',
          'Taal en structuur die intern beklijven',
          'Calendly-sessies + directe bereikbaarheid tussendoor',
        ],
        cta:      'Plan gratis intake →',
        trust:    'Gratis intake · Max. 5 trajecten tegelijk',
        forWhom:  'Voor wie serieus aan de slag wil met een concreet resultaat.',
        elevated: true,
      },
      {
        badge:    'Uitgebreid',
        name:     'Strategisch partnerschap',
        tagline:  'AI als duurzaam onderdeel van hoe de organisatie werkt.',
        duration: '6-12 maanden · Doorlopend',
        outcome:  'Je verlaat dit traject met een organisatie die AI begrijpt, toepast en verder kan bouwen.',
        items: [
          'Alles uit het Traject',
          'Begeleiding bij boardpresentaties en governance',
          'Team- en managementsessies',
          'Inzet van het Kirk & Blackbeard netwerk waar relevant',
          'Duidelijke checkpunten en flexibele doorloop',
        ],
        cta:      'Plan gratis intake →',
        trust:    'Gratis intake · Aangepast aan jouw situatie',
        forWhom:  'Voor organisaties die verder willen dan een eerste stap.',
        elevated: false,
      },
    ],

    tableTitle: 'Wat zit er in elk traject?',
    tableHeaders: ['', 'Oriëntatie', 'Traject', 'Partnerschap'],
    tableRows: [
      { feature: 'AI-scan + situatieanalyse',         cols: [true,  true,  true]  },
      { feature: '1-op-1 begeleiding',                cols: [true,  true,  true]  },
      { feature: 'Eerste concrete use case',          cols: [false, true,  true]  },
      { feature: 'Managementteam betrekken',          cols: [false, true,  true]  },
      { feature: 'Boardpresentaties en governance',   cols: [false, false, true]  },
      { feature: 'Kirk & Blackbeard netwerk',         cols: [false, false, true]  },
      { feature: 'Doorlopend partnerschap',           cols: [false, false, true]  },
    ],

    faqTitle: 'Veelgestelde vragen',
    faqs: [
      {
        q: 'Waar begin ik als ik niet weet welk traject past?',
        a: 'Met een gratis intakegesprek. We kijken samen naar jouw situatie en wat logisch is als volgende stap. Geen verplichtingen.',
      },
      {
        q: 'Werkt dit ook voor een managementteam in plaats van één persoon?',
        a: 'Ja. Het Traject en het Partnerschap kunnen ook teamgericht worden ingericht. We bespreken tijdens de intake hoe dat het best werkt.',
      },
      {
        q: 'Wat als ik al een AI-strategie heb?',
        a: 'Goed startpunt. We gebruiken wat er al is en kijken waar het concreter, scherpter of beter uitvoerbaar kan worden.',
      },
      {
        q: 'Hoe intensief is het contact?',
        a: 'Dat verschilt per traject. Het Oriëntatie-traject is compact. Het Traject heeft maandelijkse sessies plus tussentijds contact als er iets is. Het Partnerschap is doorlopender van aard.',
      },
      {
        q: 'Hoe snel kan ik starten?',
        a: 'Afhankelijk van beschikbaarheid. Ik begeleid maximaal vijf trajecten tegelijk, dus er kan een korte wachttijd zijn. De intake kan altijd snel worden ingepland.',
      },
    ],

    bottomTitle: 'Niet zeker welk traject past?',
    bottomBody:  'Plan een gratis intakegesprek. Geen voorbereiding nodig. We kijken samen naar jouw situatie.',
    bottomCta:   'Plan gratis intake →',
    bottomTrust: 'Gratis · Geen verplichting · 30 minuten',

    footerCopy: 'Strategisch mentor voor AI & executie',
    footerSub:  'markdekock.com',
  },
  en: {
    navName:    'Mark de Kock',
    navRole:    'Strategic mentor for AI & execution',
    navPartner: 'Partner · Kirk & Blackbeard',
    navCta:     'Book a call →',

    heroLabel: 'Three ways of working',
    heroTitle: 'Choose what fits your situation.',
    heroBody:  'Every engagement starts with a free intake call. No commitment. We look together at what makes sense.',

    tiers: [
      {
        badge:    'Entry',
        name:     'Orientation',
        tagline:  'Know where you stand before you take a step.',
        duration: '3-4 weeks · 2 sessions',
        outcome:  'You leave this engagement with an honest directional recommendation.',
        items: [
          'Intake and situation analysis based on the AI scan',
          'Clear picture of where you stand and what the priorities are',
          'Insight into the risks and opportunities that are relevant now',
          'Advice on whether and how a follow-up engagement makes sense',
        ],
        cta:      'Book free intake →',
        trust:    'Free intake · No commitment',
        forWhom:  'For those who want to explore without committing.',
        elevated: false,
      },
      {
        badge:    'Most chosen',
        name:     'Mentorship',
        tagline:  'From picture to first real progress.',
        duration: '3 months · Monthly sessions + ad-hoc contact',
        outcome:  'You leave this engagement with something that works and can be continued internally.',
        items: [
          'Clarifying situation, priority and ownership',
          'First working use case or decision framework',
          'Involving the management team where relevant',
          'Language and structure that sticks internally',
          'Scheduled sessions + direct availability in between',
        ],
        cta:      'Book free intake →',
        trust:    'Free intake · Max. 5 engagements at a time',
        forWhom:  'For those who want to make serious progress with a concrete result.',
        elevated: true,
      },
      {
        badge:    'Extended',
        name:     'Strategic partnership',
        tagline:  'AI as a sustainable part of how the organisation works.',
        duration: '6-12 months · Ongoing',
        outcome:  'You leave this engagement with an organisation that understands AI, applies it, and can continue building.',
        items: [
          'Everything from the Mentorship engagement',
          'Support with board presentations and governance',
          'Team and management sessions',
          'Access to the Kirk & Blackbeard network where relevant',
          'Clear checkpoints and flexible continuation',
        ],
        cta:      'Book free intake →',
        trust:    'Free intake · Tailored to your situation',
        forWhom:  'For organisations that want to go beyond a first step.',
        elevated: false,
      },
    ],

    tableTitle: 'What is included in each engagement?',
    tableHeaders: ['', 'Orientation', 'Mentorship', 'Partnership'],
    tableRows: [
      { feature: 'AI scan + situation analysis',         cols: [true,  true,  true]  },
      { feature: '1-on-1 guidance',                      cols: [true,  true,  true]  },
      { feature: 'First concrete use case',              cols: [false, true,  true]  },
      { feature: 'Involving the management team',        cols: [false, true,  true]  },
      { feature: 'Board presentations and governance',   cols: [false, false, true]  },
      { feature: 'Kirk & Blackbeard network',            cols: [false, false, true]  },
      { feature: 'Ongoing partnership',                  cols: [false, false, true]  },
    ],

    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        q: 'Where do I start if I don\'t know which engagement fits?',
        a: 'With a free intake call. We look together at your situation and what makes sense as a next step. No obligations.',
      },
      {
        q: 'Does this work for a management team rather than one person?',
        a: 'Yes. The Mentorship and Strategic Partnership can also be set up with a team focus. We discuss during the intake what works best.',
      },
      {
        q: 'What if I already have an AI strategy?',
        a: 'Good starting point. We use what is already there and look at where it can become more concrete, sharper or more actionable.',
      },
      {
        q: 'How intensive is the contact?',
        a: 'That depends on the engagement. The Orientation is compact. The Mentorship has monthly sessions plus ad-hoc contact when needed. The Partnership is more continuous by nature.',
      },
      {
        q: 'How quickly can I start?',
        a: 'Depending on availability. I work with a maximum of five engagements at a time, so there may be a short wait. The intake can always be scheduled quickly.',
      },
    ],

    bottomTitle: 'Not sure which engagement fits?',
    bottomBody:  'Book a free intake call. No preparation needed. We look together at your situation.',
    bottomCta:   'Book free intake →',
    bottomTrust: 'Free · No commitment · 30 minutes',

    footerCopy: 'Strategic mentor for AI & execution',
    footerSub:  'markdekock.com',
  },
}

// ── FAQ item component ────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
          padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: INK, lineHeight: 1.4 }}>{q}</span>
        <span style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
          background: open ? INK : LIGHT, border: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: open ? WHITE : MUTED, lineHeight: 1,
          transition: 'all 0.2s',
        }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: 20 }}>
          <p style={{ fontSize: 15, color: BODY, lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AanpakPage() {
  const [lang, setLang] = useState<'nl' | 'en'>('nl')
  const t = T[lang]

  return (
    <div style={{ minHeight: '100vh', background: WHITE, color: INK, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Nav ── */}
      <nav style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/mentor" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: WHITE, fontFamily: 'serif' }}>M</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: INK, lineHeight: 1.2 }}>{t.navName}</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.navRole}</p>
              <p style={{ fontSize: 10, color: WARM, fontWeight: 600, lineHeight: 1.2 }}>{t.navPartner}</p>
            </div>
          </a>

          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                    background: lang === l ? WHITE : 'transparent',
                    color: lang === l ? INK : MUTED,
                    border: 'none', cursor: 'pointer',
                    boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
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
              {t.navCta}
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: INK, paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.p variants={fadeUp} style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: WARM, marginBottom: 20,
            }}>
              {t.heroLabel}
            </motion.p>
            <motion.h1 variants={fadeUp} style={{
              fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: WHITE,
              lineHeight: 1.1, marginBottom: 20,
            }}>
              {t.heroTitle}
            </motion.h1>
            <motion.p variants={fadeUp} style={{
              fontSize: 18, color: MUTED, lineHeight: 1.7, maxWidth: 520, margin: '0 auto',
            }}>
              {t.heroBody}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Tier cards ── */}
      <section style={{ background: LIGHT, padding: '80px 24px' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            alignItems: 'start',
          }}>
            {t.tiers.map((tier, i) => {
              const isElevated = tier.elevated
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  style={{
                    background: isElevated ? INK : WHITE,
                    border: isElevated ? 'none' : `1px solid ${BORDER}`,
                    borderRadius: 20,
                    padding: isElevated ? '40px 32px' : '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                    boxShadow: isElevated
                      ? '0 24px 64px rgba(15,23,42,0.35)'
                      : '0 2px 12px rgba(15,23,42,0.06)',
                    position: 'relative',
                    transform: isElevated ? 'translateY(-8px)' : 'none',
                  }}
                >
                  {/* Badge */}
                  <div style={{ marginBottom: 20 }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: isElevated ? WARM : ACCENT,
                      background: isElevated ? 'rgba(217,119,6,0.15)' : 'rgba(29,78,216,0.08)',
                      padding: '5px 14px', borderRadius: 100,
                    }}>
                      {tier.badge}
                    </span>
                  </div>

                  {/* Name + tagline */}
                  <h2 style={{
                    fontSize: isElevated ? 26 : 22, fontWeight: 800,
                    color: isElevated ? WHITE : INK,
                    marginBottom: 8, lineHeight: 1.2,
                  }}>
                    {tier.name}
                  </h2>
                  <p style={{
                    fontSize: 14, color: isElevated ? MUTED : BODY,
                    marginBottom: 16, lineHeight: 1.5,
                  }}>
                    {tier.tagline}
                  </p>

                  {/* Duration */}
                  <p style={{
                    fontSize: 12, fontWeight: 600,
                    color: isElevated ? 'rgba(255,255,255,0.45)' : MUTED,
                    marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.07em',
                  }}>
                    {tier.duration}
                  </p>

                  {/* Outcome */}
                  <div style={{
                    background: isElevated ? 'rgba(255,255,255,0.06)' : WARM_LIGHT,
                    borderRadius: 10, padding: '14px 16px', marginBottom: 24,
                  }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700,
                      color: isElevated ? 'rgba(255,255,255,0.85)' : BODY,
                      lineHeight: 1.5,
                    }}>
                      {tier.outcome}
                    </p>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, flex: 1 }}>
                    {tier.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                          background: isElevated ? 'rgba(217,119,6,0.20)' : 'rgba(29,78,216,0.10)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke={isElevated ? WARM : ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p style={{ fontSize: 14, color: isElevated ? 'rgba(255,255,255,0.75)' : BODY, lineHeight: 1.5 }}>
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={CALENDLY_INTAKE}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block', textAlign: 'center', textDecoration: 'none',
                      padding: '14px 24px', borderRadius: 100,
                      fontSize: 15, fontWeight: 700,
                      background: isElevated ? WARM : ACCENT,
                      color: WHITE,
                      boxShadow: isElevated ? `0 8px 24px ${WARM}44` : `0 4px 16px ${ACCENT}33`,
                      marginBottom: 12,
                    }}
                  >
                    {tier.cta}
                  </a>

                  {/* Trust */}
                  <p style={{
                    fontSize: 12, textAlign: 'center',
                    color: isElevated ? 'rgba(255,255,255,0.35)' : MUTED,
                    marginBottom: 16,
                  }}>
                    {tier.trust}
                  </p>

                  {/* For whom */}
                  <p style={{
                    fontSize: 13, fontStyle: 'italic', textAlign: 'center',
                    color: isElevated ? 'rgba(255,255,255,0.45)' : MUTED,
                  }}>
                    {tier.forWhom}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section style={{ background: WHITE, padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: INK,
              textAlign: 'center', marginBottom: 40,
            }}>
              {t.tableTitle}
            </motion.h2>
            <motion.div variants={fadeUp} style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {t.tableHeaders.map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: '12px 16px',
                          textAlign: i === 0 ? 'left' : 'center',
                          fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.08em', color: '#6B7280',
                          borderBottom: `2px solid ${BORDER}`,
                          whiteSpace: 'nowrap',
                          background: i === 2 ? '#F8FAFC' : 'transparent',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.tableRows.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? WHITE : '#FAFAFA' }}>
                      <td style={{
                        padding: '14px 16px', fontSize: 14, color: BODY, fontWeight: 500,
                        borderBottom: `1px solid ${BORDER}`,
                      }}>
                        {row.feature}
                      </td>
                      {row.cols.map((has, j) => (
                        <td
                          key={j}
                          style={{
                            padding: '14px 16px', textAlign: 'center',
                            borderBottom: `1px solid ${BORDER}`,
                            background: j === 1 ? (i % 2 === 0 ? '#F8FAFC' : '#F1F5F9') : 'transparent',
                          }}
                        >
                          {has ? (
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ display: 'inline-block' }}>
                              <circle cx="9" cy="9" r="8" fill={WARM_LIGHT} />
                              <path d="M5.5 9L8 11.5L12.5 6.5" stroke={WARM} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span style={{ color: '#CBD5E1', fontSize: 16, fontWeight: 300 }}>—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: LIGHT, padding: '80px 24px' }}>
        <div className="max-w-2xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: INK,
              textAlign: 'center', marginBottom: 40,
            }}>
              {t.faqTitle}
            </motion.h2>
            <motion.div variants={fadeUp} style={{ borderTop: `1px solid ${BORDER}` }}>
              {t.faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ background: INK, padding: '100px 24px' }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: WHITE,
              marginBottom: 16, lineHeight: 1.15,
            }}>
              {t.bottomTitle}
            </motion.h2>
            <motion.p variants={fadeUp} style={{
              fontSize: 17, color: MUTED, lineHeight: 1.7,
              maxWidth: 420, margin: '0 auto 44px',
            }}>
              {t.bottomBody}
            </motion.p>
            <motion.div variants={fadeUp}>
              <a
                href={CALENDLY_INTAKE}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: WARM, color: WHITE, fontWeight: 700, fontSize: 16,
                  padding: '16px 40px', borderRadius: 100, textDecoration: 'none',
                  boxShadow: `0 12px 32px ${WARM}55`,
                }}
              >
                {t.bottomCta}
              </a>
            </motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: 13, color: '#475569', marginTop: 20 }}>
              {t.bottomTrust}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #1E293B', background: '#080E1A', padding: '28px 24px' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div style={{
              width: 24, height: 24, borderRadius: 6, background: INK,
              border: '1px solid #1E293B', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, fontWeight: 900, color: WHITE, fontFamily: 'serif',
            }}>
              M
            </div>
            <span style={{ fontSize: 13, color: '#475569' }}>{t.navName} — {t.footerCopy}</span>
          </div>
          <p style={{ fontSize: 12, color: '#334155' }}>{t.footerSub} · {new Date().getFullYear()}</p>
        </div>
      </footer>

    </div>
  )
}
