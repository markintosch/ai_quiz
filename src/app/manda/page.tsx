import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI & M&A Readiness Assessment | Hofstede & de Kock',
  description:
    'Is your company AI & M&A ready? Find out in 10 minutes. Leadership meets commercial execution — from boardroom to market.',
}

// ─── Brand tokens ────────────────────────────────────────────────────────────
const HDK = {
  navy:     '#1C2E4A',
  navyDark: '#13203A',
  navyMid:  '#243656',
  gold:     '#C8922A',
  goldLight:'#D9A84A',
  cream:    '#F7F5F0',
  white:    '#FFFFFF',
  muted:    '#5A6A82',
  border:   '#D6CCB8',
}

// ─── Assessment Pillars ───────────────────────────────────────────────────────
const PILLARS = [
  {
    number: '01',
    title: 'Leadership & Change Readiness',
    owner: 'Sandra',
    icon: '⚡',
    color: '#2D5A8B',
    description:
      'Does your leadership team have the clarity, accountability and change capacity to survive a deal? We assess succession depth, decision speed, ownership mindset and board maturity.',
    signals: ['Succession clarity', 'Decision speed', 'Change track record', 'Board governance'],
  },
  {
    number: '02',
    title: 'Commercial Engine Maturity',
    owner: 'Mark',
    icon: '📈',
    color: '#2E7D5A',
    description:
      'How predictable, scalable and defensible is your revenue? We evaluate ICP sharpness, funnel health, CAC/LTV ratios and go-to-market execution quality.',
    signals: ['ICP & positioning clarity', 'Pipeline predictability', 'CAC / LTV health', 'GTM execution'],
  },
  {
    number: '03',
    title: 'AI Adoption & Digital Capability',
    owner: 'Both',
    icon: '🤖',
    color: '#6B3FA0',
    description:
      'How deeply is AI embedded in your operations and strategy — and how does that look through an investor\'s lens? We assess tool adoption, data infrastructure, automation depth and AI literacy.',
    signals: ['AI tool adoption', 'Data infrastructure', 'Automation maturity', 'AI strategy & literacy'],
  },
  {
    number: '04',
    title: 'Operational Scalability',
    owner: 'Sandra',
    icon: '⚙️',
    color: '#A0522D',
    description:
      'Can your operation survive a deal, integration or rapid growth phase? We examine process documentation, key-person risk, systems maturity and integration track record.',
    signals: ['Process documentation', 'Key-person risk', 'Tech stack health', 'Integration readiness'],
  },
  {
    number: '05',
    title: 'Commercial Narrative & Investor Story',
    owner: 'Mark',
    icon: '🎯',
    color: '#B5560A',
    description:
      'Is your story compelling enough to survive the room? We assess positioning sharpness, differentiation defensibility, growth evidence quality and board pack readiness.',
    signals: ['Positioning clarity', 'Differentiation proof', 'Growth story evidence', 'Board pack quality'],
  },
  {
    number: '06',
    title: 'Value Creation Potential',
    owner: 'Both',
    icon: '💎',
    color: '#1A6B6B',
    description:
      'What is the real upside case — and can leadership actually deliver it? We map untapped opportunity, quick-win potential, AI-enabled growth levers and execution capacity.',
    signals: ['Untapped market potential', 'Quick-win backlog', 'AI growth levers', 'Execution capacity'],
  },
]

// ─── Audience cards ───────────────────────────────────────────────────────────
const AUDIENCES = [
  {
    role: 'Company Owner / CEO',
    icon: '🏢',
    trigger: 'Preparing for sale, merger or investment round',
    value: 'Know your gaps before the buyer does. Fix what matters, disclose on your terms. Walk in prepared.',
    cta: 'Assess my company',
  },
  {
    role: 'PE / VC Investor',
    icon: '📊',
    trigger: 'In due diligence or pre-LOI phase',
    value: 'De-risk your value creation plan. Objective AI & leadership readiness data — before you sign.',
    cta: 'Assess a target',
  },
  {
    role: 'Portfolio Company',
    icon: '🚀',
    trigger: 'Post-close, growth stalling or exit approaching',
    value: 'Baseline where you actually stand. Align leadership and commercial execution from day one.',
    cta: 'Assess our operations',
  },
  {
    role: 'M&A Advisor / Dealmaker',
    icon: '🤝',
    trigger: 'Adding depth to your due diligence process',
    value: 'An independent operational and AI readiness layer for your deal analysis. One report, two disciplines.',
    cta: 'Run a deal scan',
  },
]

// ─── Service phases ───────────────────────────────────────────────────────────
const PHASES = [
  {
    phase: 'Pre-Deal',
    tag: '4–6 weeks',
    price: '€10.000–€15.000',
    title: 'Due Diligence Tandem',
    description:
      'Full operational + commercial due diligence. One report, one go/no-go judgement. Know what you\'re buying — and what it can become.',
    items: ['Quick Scan op Operatie', 'Rapid Growth Scan', 'Integrated DD report'],
  },
  {
    phase: 'First 100 Days',
    tag: '100 days',
    price: '€55.000–€75.000',
    title: 'Post-Close Accelerator',
    description:
      'Stabilise the organisation and accelerate commercial momentum — in parallel. No sequential waiting. Direct impact on both fronts.',
    items: ['Turnaround Sprint', 'GTM Deep Dive', 'Governance + commercial momentum'],
  },
  {
    phase: 'Value Creation',
    tag: '6–12 months',
    price: '€12.000–€30.000/mo',
    title: 'Full Value Creation Partnership',
    description:
      'Fractional COO + Fractional CMO as an integrated team. Operational leadership and commercial acceleration, hand in hand.',
    items: ['Weekly sync', 'Joint board updates', 'One value creation narrative'],
  },
  {
    phase: 'Exit Readiness',
    tag: '6–18 months',
    price: '€25.000–€35.000/mo + success fee',
    title: 'Exit Readiness Program',
    description:
      'The house and the curb appeal. Organisation transferable, commercial story investor-ready. DD-proof on both fronts.',
    items: ['Build to Grow', 'Build to Scale', 'Commercial narrative + DD prep'],
  },
]

export default function MandaLandingPage() {
  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: HDK.cream, color: HDK.navy }}>

      {/* ── NAV ── */}
      <nav style={{ background: HDK.navy, borderBottom: `3px solid ${HDK.gold}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ color: HDK.white, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>HOFSTEDE & DE KOCK</span>
            <span style={{ color: HDK.gold, fontSize: '0.75rem', fontStyle: 'italic', fontWeight: 400 }}>Leadership That Delivers Growth</span>
          </div>
          <a
            href="#assessment"
            style={{
              background: HDK.gold,
              color: HDK.navyDark,
              padding: '0.5rem 1.25rem',
              borderRadius: 6,
              fontSize: '0.875rem',
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            Start Assessment →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${HDK.navyDark} 0%, ${HDK.navyMid} 60%, #2D4A6E 100%)`,
          padding: '5rem 2rem 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(#C8922A 1px, transparent 1px), linear-gradient(90deg, #C8922A 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(200,146,42,0.15)',
            border: `1px solid ${HDK.gold}`,
            color: HDK.gold,
            padding: '0.35rem 1rem',
            borderRadius: 20,
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}>
            AI & M&A Readiness Assessment — Beta
          </div>

          <h1 style={{
            color: HDK.white,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em',
          }}>
            Does your company survive<br />
            <span style={{ color: HDK.gold }}>a buyer's lens?</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '1rem', maxWidth: 680, margin: '0 auto 1rem' }}>
            Portfolio companies don&apos;t fail because of bad strategy.<br />
            They fail because <strong style={{ color: HDK.white }}>strategy never reaches the market.</strong>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
            Ten minutes. Six dimensions. One clear picture of your AI & M&A readiness — before the buyer, investor or board gets there first.
          </p>

          {/* Role pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            {['Company Owner', 'PE / VC Investor', 'Portfolio Company', 'M&A Advisor'].map(role => (
              <span key={role} style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'rgba(255,255,255,0.85)',
                padding: '0.35rem 0.9rem',
                borderRadius: 20,
                fontSize: '0.82rem',
                fontWeight: 500,
              }}>
                {role}
              </span>
            ))}
          </div>

          <a
            id="assessment"
            href="/en/a/public"
            style={{
              display: 'inline-block',
              background: HDK.gold,
              color: HDK.navyDark,
              padding: '1rem 2.5rem',
              borderRadius: 8,
              fontSize: '1.05rem',
              fontWeight: 800,
              textDecoration: 'none',
              letterSpacing: '0.01em',
              boxShadow: '0 4px 24px rgba(200,146,42,0.4)',
            }}
          >
            Start your free readiness scan →
          </a>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            10 minutes · No login required · Instant results
          </p>
        </div>
      </section>

      {/* ── PROBLEM BAR ── */}
      <section style={{ background: HDK.gold, padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: HDK.navyDark, fontWeight: 700, fontSize: '1.05rem', margin: 0, letterSpacing: '-0.01em' }}>
            Leadership gets aligned. Governance gets installed. And then — <em>nothing moves.</em> The commercial engine stalls while everyone waits for someone to translate decisions into revenue.
          </p>
        </div>
      </section>

      {/* ── WHO IS THIS FOR ── */}
      <section style={{ padding: '5rem 2rem', background: HDK.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Who is this for</p>
            <h2 style={{ color: HDK.navy, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              One assessment. Four entry points.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {AUDIENCES.map(a => (
              <div key={a.role} style={{
                background: HDK.cream,
                border: `1px solid ${HDK.border}`,
                borderRadius: 12,
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ fontSize: '2rem' }}>{a.icon}</div>
                <div>
                  <h3 style={{ color: HDK.navy, fontWeight: 800, fontSize: '1rem', margin: '0 0 0.25rem', letterSpacing: '-0.01em' }}>{a.role}</h3>
                  <p style={{ color: HDK.gold, fontSize: '0.78rem', fontWeight: 600, margin: 0, fontStyle: 'italic' }}>When: {a.trigger}</p>
                </div>
                <p style={{ color: HDK.muted, fontSize: '0.9rem', lineHeight: 1.55, margin: 0, flex: 1 }}>{a.value}</p>
                <a
                  href="/en/a/public"
                  style={{
                    display: 'inline-block',
                    borderTop: `1px solid ${HDK.border}`,
                    paddingTop: '0.75rem',
                    color: HDK.navy,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                  }}
                >
                  {a.cta} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6 PILLARS ── */}
      <section style={{ padding: '5rem 2rem', background: HDK.cream }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>What gets assessed</p>
            <h2 style={{ color: HDK.navy, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
              Six dimensions. Two disciplines. One verdict.
            </h2>
            <p style={{ color: HDK.muted, fontSize: '1rem', maxWidth: 580, margin: '0 auto' }}>
              Each pillar maps to either Sandra&apos;s leadership lens or Mark&apos;s commercial lens — or both. Together they give you the full picture buyers, investors and boards actually look for.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {PILLARS.map(p => (
              <div key={p.number} style={{
                background: HDK.white,
                borderRadius: 12,
                border: `1px solid ${HDK.border}`,
                borderLeft: `4px solid ${p.color}`,
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>{p.icon}</span>
                    <div>
                      <div style={{ color: HDK.muted, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pillar {p.number}</div>
                      <h3 style={{ color: HDK.navy, fontWeight: 800, fontSize: '0.95rem', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{p.title}</h3>
                    </div>
                  </div>
                  <span style={{
                    background: p.owner === 'Both' ? HDK.gold : p.owner === 'Sandra' ? '#2D5A8B' : '#2E7D5A',
                    color: HDK.white,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 10,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    letterSpacing: '0.04em',
                  }}>
                    {p.owner === 'Both' ? '⊕ Both' : p.owner === 'Sandra' ? 'Sandra' : 'Mark'}
                  </span>
                </div>
                <p style={{ color: HDK.muted, fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>{p.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  {p.signals.map(s => (
                    <span key={s} style={{
                      background: `${p.color}18`,
                      color: p.color,
                      border: `1px solid ${p.color}30`,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 8,
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '5rem 2rem', background: HDK.navy }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>How it works</p>
            <h2 style={{ color: HDK.white, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              From question to conversation in three steps
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', position: 'relative' }}>
            {[
              { step: '01', title: 'Take the assessment', desc: '26 questions across 6 dimensions. Honest answers only — this is your mirror, not a pitch deck.' },
              { step: '02', title: 'Get your readiness report', desc: 'Instant scores per pillar. Shadow AI detection. A clear view of where you\'re strong and where deals get difficult.' },
              { step: '03', title: 'Talk to Sandra & Mark', desc: 'Book a free 30-minute debrief. We\'ll tell you where you stand, what it means for your M&A situation, and whether we can help.' },
            ].map((s, i) => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56,
                  borderRadius: '50%',
                  border: `2px solid ${HDK.gold}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: HDK.gold,
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}>{s.step}</div>
                <h3 style={{ color: HDK.white, fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <a
              href="/en/a/public"
              style={{
                display: 'inline-block',
                background: HDK.gold,
                color: HDK.navyDark,
                padding: '0.9rem 2.25rem',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              Start your free assessment →
            </a>
          </div>
        </div>
      </section>

      {/* ── THE PARTNERSHIP ── */}
      <section style={{ padding: '5rem 2rem', background: HDK.white }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>The partnership</p>
            <h2 style={{ color: HDK.navy, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
              One partnership. Two disciplines. No gap.
            </h2>
            <p style={{ color: HDK.muted, fontSize: '1rem', maxWidth: 600, margin: '0 auto' }}>
              We close the space where strategy gets defined but execution stalls. Boardroom to market.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
            {/* Sandra */}
            <div style={{ background: HDK.cream, border: `1px solid ${HDK.border}`, borderTop: `4px solid #2D5A8B`, borderRadius: 12, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#2D5A8B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: HDK.white, fontWeight: 900, fontSize: '1.25rem', flexShrink: 0,
                }}>S</div>
                <div>
                  <h3 style={{ color: HDK.navy, fontWeight: 800, fontSize: '1.1rem', margin: '0 0 0.2rem' }}>Sandra Hofstede</h3>
                  <p style={{ color: '#2D5A8B', fontSize: '0.82rem', fontWeight: 600, margin: 0, fontStyle: 'italic' }}>Strategic Leadership & Integration</p>
                </div>
              </div>
              <p style={{ color: HDK.muted, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
                Governance, M&A integration, turnaround. When organisations stall or scale, Sandra steps in as the leader who creates ownership and restores momentum.
              </p>
              <p style={{ color: HDK.muted, fontSize: '0.85rem', margin: '0 0 1rem' }}>20+ years leading complex transformations across professionalizing, merging and scaling organisations.</p>
              <div style={{ borderTop: `1px solid ${HDK.border}`, paddingTop: '1rem' }}>
                <p style={{ color: '#2D5A8B', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.25rem' }}>Currently</p>
                <p style={{ color: HDK.muted, fontSize: '0.82rem', margin: 0, fontStyle: 'italic' }}>Managing Director at Hibou/Contenture — leading the merger and integration of two companies into one unified brand and team.</p>
              </div>
              <a href="https://linkedin.com/in/sandrahofstede" target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: '1rem', color: '#2D5A8B', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                linkedin.com/in/sandrahofstede →
              </a>
            </div>

            {/* Mark */}
            <div style={{ background: HDK.cream, border: `1px solid ${HDK.border}`, borderTop: `4px solid #2E7D5A`, borderRadius: 12, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#2E7D5A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: HDK.white, fontWeight: 900, fontSize: '1.25rem', flexShrink: 0,
                }}>M</div>
                <div>
                  <h3 style={{ color: HDK.navy, fontWeight: 800, fontSize: '1.1rem', margin: '0 0 0.2rem' }}>Mark de Kock</h3>
                  <p style={{ color: '#2E7D5A', fontSize: '0.82rem', fontWeight: 600, margin: 0, fontStyle: 'italic' }}>Commercial Acceleration & Growth</p>
                </div>
              </div>
              <p style={{ color: HDK.muted, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
                Revenue growth, go-to-market, brand positioning. Mark translates strategy into market results. 20+ years scaling B2B/B2C tech and consumer brands.
              </p>
              <p style={{ color: HDK.muted, fontSize: '0.85rem', margin: '0 0 1rem' }}>From €300K to €1.5M at Digidentity, managing large budgets delivering €5M net margin at Omnicom.</p>
              <div style={{ borderTop: `1px solid ${HDK.border}`, paddingTop: '1rem' }}>
                <p style={{ color: '#2E7D5A', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.25rem' }}>Currently</p>
                <p style={{ color: HDK.muted, fontSize: '0.82rem', margin: 0, fontStyle: 'italic' }}>Fractional CMO through Kirk & Blackbeard, serving B2B/B2C companies (Tech / Fast movers / Health).</p>
              </div>
              <a href="https://linkedin.com/in/markderksen" target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: '1rem', color: '#2E7D5A', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                linkedin.com/in/markderksen →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ padding: '5rem 2rem', background: HDK.cream }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Services</p>
            <h2 style={{ color: HDK.navy, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem' }}>
              From first conversation to successful exit
            </h2>
            <p style={{ color: HDK.muted, fontSize: '0.9rem' }}>Combined trajectories — the real power is in the integration.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {PHASES.map((ph, i) => (
              <div key={ph.phase} style={{
                background: HDK.white,
                border: `1px solid ${HDK.border}`,
                borderRadius: 12,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ background: HDK.navy, padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ color: HDK.gold, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{ph.phase}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{ph.tag}</span>
                  </div>
                  <h3 style={{ color: HDK.white, fontWeight: 800, fontSize: '0.95rem', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{ph.title}</h3>
                  <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', margin: '0.35rem 0 0', fontStyle: 'italic' }}>{ph.price}</p>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ color: HDK.muted, fontSize: '0.85rem', lineHeight: 1.55, margin: 0 }}>{ph.description}</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: 'auto' }}>
                    {ph.items.map(item => (
                      <li key={item} style={{ color: HDK.navy, fontSize: '0.8rem', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span style={{ color: HDK.gold, flexShrink: 0 }}>✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: HDK.muted, fontSize: '0.8rem', fontStyle: 'italic' }}>
              All prices excl. VAT. Indicative and context-dependent. Portfolio pricing available for multi-company pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHEN TO CALL ── */}
      <section style={{ padding: '4rem 2rem', background: HDK.navyMid }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>When to call us</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {[
              'Groei stagneert', 'CAC stijgt', 'Verhaal onduidelijk', 'Team loopt vast',
              'Structuur ontbreekt', 'Deal in voorbereiding', 'Post-close chaos', 'Exit nadert',
            ].map(trigger => (
              <span key={trigger} style={{
                background: 'rgba(200,146,42,0.15)',
                border: `1px solid ${HDK.gold}`,
                color: HDK.white,
                padding: '0.45rem 1rem',
                borderRadius: 20,
                fontSize: '0.85rem',
                fontWeight: 500,
              }}>
                {trigger}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        padding: '5rem 2rem',
        background: `linear-gradient(135deg, ${HDK.navyDark} 0%, ${HDK.navyMid} 100%)`,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ color: HDK.white, fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Find out where you stand.<br />
            <span style={{ color: HDK.gold }}>Before someone else does.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Ten minutes. Six pillars. A clear readiness score across AI adoption, leadership, commercial engine, scalability, investor narrative and value creation potential.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/en/a/public"
              style={{
                display: 'inline-block',
                background: HDK.gold,
                color: HDK.navyDark,
                padding: '1rem 2.5rem',
                borderRadius: 8,
                fontSize: '1.05rem',
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '0.01em',
                boxShadow: '0 4px 24px rgba(200,146,42,0.35)',
              }}
            >
              Start free assessment →
            </a>
            <a
              href="mailto:mark@kirkandblackbeard.com"
              style={{
                display: 'inline-block',
                background: 'transparent',
                border: `2px solid rgba(255,255,255,0.3)`,
                color: HDK.white,
                padding: '1rem 2.25rem',
                borderRadius: 8,
                fontSize: '1.05rem',
                fontWeight: 700,
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              Talk to us first
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: HDK.navyDark, borderTop: `3px solid ${HDK.gold}`, padding: '2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <p style={{ color: HDK.white, fontWeight: 800, fontSize: '0.95rem', margin: '0 0 0.2rem', letterSpacing: '-0.01em' }}>HOFSTEDE & DE KOCK</p>
            <p style={{ color: HDK.gold, fontSize: '0.78rem', margin: 0, fontStyle: 'italic' }}>Leadership That Delivers Growth</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <a href="https://linkedin.com/in/sandrahofstede" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', textDecoration: 'none' }}>Sandra Hofstede</a>
            <a href="https://linkedin.com/in/markderksen" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', textDecoration: 'none' }}>Mark de Kock · Kirk & Blackbeard</a>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: 0 }}>
            Assessment powered by Brand PWRD Media
          </p>
        </div>
      </footer>
    </div>
  )
}
