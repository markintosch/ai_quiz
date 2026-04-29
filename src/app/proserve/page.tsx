// FILE: src/app/proserve/page.tsx
// PREVIEW pitch landing for Proserve.
// Lives at any host (cloud.brandpwrdmedia.nl/proserve recommended).
// Brand: Proserve navy + coral accent. NL only — Proserve audience is NL.

import Link from 'next/link'

// ── Proserve brand tokens (estimated from logo; update when exact hex confirmed)
const NAVY        = '#1E2A57'
const NAVY_DARK   = '#141C3D'
const NAVY_LIGHT  = '#2F4084'
const CORAL       = '#F46D5C'
const CORAL_LIGHT = '#FCE3DE'
const INK         = '#0F172A'
const BODY        = '#3B4565'
const MUTED       = '#94A3B8'
const BORDER      = '#E2E8F0'
const LIGHT_BG    = '#F7F8FB'
const FONT        = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export default function ProservePitchPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT }}>

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ProserveLogo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>
              voorstel · Mark de Kock
            </span>
            <a
              href="#contact"
              style={{
                background: CORAL, color: '#fff', fontSize: 13, fontWeight: 700,
                padding: '9px 18px', borderRadius: 6, textDecoration: 'none',
              }}
            >
              Plan een gesprek →
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 50%, ${NAVY_LIGHT} 100%)`,
        color: '#fff', padding: '88px 24px 96px',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: CORAL, background: 'rgba(244,109,92,0.14)',
            padding: '6px 14px', borderRadius: 100, marginBottom: 28,
            border: `1px solid rgba(244,109,92,0.35)`,
          }}>
            Voorstel · voor Proserve
          </span>

          <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.025em', color: '#fff' }}>
            Twee tools om <span style={{ color: CORAL }}>cloud-talent aan te trekken</span> en kwaliteit te benchmarken.
          </h1>

          <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, marginBottom: 14, maxWidth: 720 }}>
            Cloud-talent is schaars. De beste mensen kiezen werkgevers die laten zien hoe zij denken over cloud, kwaliteit en innovatie. Niet via een banenpagina, maar via interactie.
          </p>
          <p style={{ fontSize: 19, color: '#fff', lineHeight: 1.55, marginBottom: 36, maxWidth: 720, fontWeight: 600 }}>
            Hieronder twee bewezen tools, klaar om in Proserve-stijl te draaien — en in te zetten richting prospects, partners én sollicitanten.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#assessment" style={{
              background: CORAL, color: '#fff', fontWeight: 700, fontSize: 16,
              padding: '14px 30px', borderRadius: 8, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(244,109,92,0.35)',
            }}>
              1 · Cloud Assessment
            </a>
            <a href="#arena" style={{
              background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 16,
              padding: '14px 30px', borderRadius: 8, textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.4)',
            }}>
              2 · Cloud Arena Game
            </a>
          </div>
        </div>
      </section>

      {/* ── Why this works for Proserve ── */}
      <section style={{ background: LIGHT_BG, padding: '72px 24px', borderTop: `4px solid ${CORAL}` }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: CORAL, marginBottom: 14 }}>
            Waarom dit werkt voor Proserve
          </h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 20, letterSpacing: '-0.015em', lineHeight: 1.25 }}>
            500+ klanten en een 9.1/10 CSAT zijn bewijs van kwaliteit. Maar hoe vertel je dat verhaal aan iemand die je nog niet kent?
          </p>
          <p style={{ fontSize: 17, color: BODY, lineHeight: 1.7, maxWidth: 760 }}>
            Een PDF leest niemand. Een vacaturetekst onthoudt niemand. Maar een 8-minuten cloud-assessment waar de bezoeker zélf zijn maturity ziet, met Proserve&apos;s expertise als context — dát blijft hangen. En een arena-game die kandidaten uitnodigt hun cloud-skills te showcasen, levert je een lijst aan warme leads voor recruitment.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 36 }}>
            <Stat label="Bewezen kader" value="6 dimensies" caption="Strategie · Adoption · Architecture · DevOps · Security · FinOps" />
            <Stat label="Tijd per gebruiker" value="8 min" caption="Drempelloos. Geen account nodig. Persoonlijk dashboard direct na invullen." />
            <Stat label="Use cases" value="3" caption="Lead gen voor sales · employer branding · talent funnel" />
            <Stat label="Live op" value="2 weken" caption="Volledig Proserve-branded. Inclusief CMS voor copy-aanpassingen." />
          </div>
        </div>
      </section>

      {/* ── Tool 1: Cloud Assessment ── */}
      <section id="assessment" style={{ background: '#fff', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: CORAL, letterSpacing: '-0.02em' }}>01</span>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: NAVY }}>
              Cloud Readiness Assessment
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: NAVY, lineHeight: 1.1, marginBottom: 18, letterSpacing: '-0.02em', maxWidth: 720 }}>
            Laat prospects en sollicitanten in 8 minuten ontdekken waar ze staan.
          </h2>

          <p style={{ fontSize: 17, color: BODY, lineHeight: 1.7, marginBottom: 36, maxWidth: 720 }}>
            Een diagnostische assessment van 30 vragen over cloud-volwassenheid. De bezoeker krijgt direct een persoonlijk dashboard met score, maturity-niveau, en de 3 belangrijkste vervolgstappen. Proserve verschijnt als de partner die helpt om die stappen te zetten.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 36 }}>
            <FeatureCard icon="🧭" title="Cloud Strategy"      body="Hoe cloud is afgestemd op businessdoelen en leiderschap." />
            <FeatureCard icon="☁️" title="Cloud Adoption"      body="Breedte en volwassenheid van de huidige cloud-workloads." />
            <FeatureCard icon="🏗️" title="Infra & Architecture" body="IaC, containers, schaalbaarheid en architectuur-veerkracht." />
            <FeatureCard icon="⚙️" title="DevOps & Automation"  body="CI/CD-volwassenheid, deploy-frequentie, operationele automatisering." />
            <FeatureCard icon="🛡️" title="Security & Compliance" body="IAM, data-bescherming, policy-handhaving, incident-paraatheid." />
            <FeatureCard icon="📊" title="FinOps & Cost"        body="Kosteninzicht, forecast-nauwkeurigheid, spend-accountability." />
          </div>

          <ResultsPreview />

          <div style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              href="/proserve/assessment-demo"
              style={{
                background: NAVY, color: '#fff', fontWeight: 700, fontSize: 15,
                padding: '14px 28px', borderRadius: 8, textDecoration: 'none',
              }}
            >
              Bekijk de demo →
            </Link>
            <span style={{ fontSize: 13, color: MUTED }}>
              Live demo opent in nieuw tabblad. Volledig Proserve-branded zodra je groen licht geeft.
            </span>
          </div>
        </div>
      </section>

      {/* ── Tool 2: Cloud Arena Game ── */}
      <section id="arena" style={{
        background: `linear-gradient(180deg, ${NAVY_DARK} 0%, ${NAVY} 100%)`,
        color: '#fff', padding: '88px 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: CORAL, letterSpacing: '-0.02em' }}>02</span>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
              Cloud Arena · het talent-spel
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-0.02em', maxWidth: 760 }}>
            Een live cloud-quiz waarmee Proserve talent uitdaagt — en herkent.
          </h2>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, marginBottom: 36, maxWidth: 720 }}>
            10 vragen, 30 seconden per vraag, een live leaderboard. Spelers gebruiken een join-code op hun eigen scherm, jullie team kan meekijken op een groot scherm. Een ideale tool voor recruitmentevents, conferenties (AWS Summit, KubeCon, Serverless Days) of campusbezoeken.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 36 }}>
            <FeatureCard dark icon="⚡" title="Live & ad-hoc"       body="Genereer een join-code in 10 seconden. Spelers scannen QR of typen 6-letter code." />
            <FeatureCard dark icon="🏆" title="Leaderboard"          body="Snelheid telt mee. Wie als eerste antwoordt en correct is, scoort het hoogst." />
            <FeatureCard dark icon="🎯" title="Recruitment-funnel"   body="Top-scorers krijgen een follow-up via e-mail. Proserve heeft een warme lead." />
            <FeatureCard dark icon="🔁" title="Herhaalbaar"          body="Verschillende vraag-banks per evenement. Recruiters kunnen sessies zelf starten." />
          </div>

          <ArenaPreview />

          <div style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              href="/proserve/arena-demo"
              style={{
                background: CORAL, color: '#fff', fontWeight: 700, fontSize: 15,
                padding: '14px 28px', borderRadius: 8, textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(244,109,92,0.35)',
              }}
            >
              Speel een proefronde →
            </Link>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              Demo opent in nieuw tabblad. Geef je een join-code aan een collega om mee te spelen.
            </span>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: LIGHT_BG, padding: '88px 24px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: CORAL, marginBottom: 14 }}>
            Hoe het werkt
          </h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 28, letterSpacing: '-0.015em' }}>
            Van akkoord naar live in twee weken.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <Step n="1" title="Kickoff (30 min)"
                  body="We bepalen welke use case je eerst wil testen: lead gen, talent-funnel of beide. Welk vraag-bank past bij jullie stack?" />
            <Step n="2" title="Branding & content (week 1)"
                  body="Volledig in Proserve-stijl: logo, kleuren, tone of voice, calendly-koppeling, content-aanpassingen via een eenvoudige CMS." />
            <Step n="3" title="Test & launch (week 2)"
                  body="Interne test door 5 collega's. Verfijnen. Vrijgave op proserve.nl/cloud-check (of subdomein naar keuze)." />
            <Step n="4" title="Doorlopend"
                  body="Maandelijkse data-review. Welke leads, welke segmenten, welke vragen werken. Iteratie op basis van wat je leert." />
          </div>
        </div>
      </section>

      {/* ── Pricing / commercial ── */}
      <section style={{ background: '#fff', padding: '88px 24px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: CORAL, marginBottom: 14 }}>
            Wat het kost
          </h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 28, letterSpacing: '-0.015em' }}>
            Eenmalige bouw + lichte maandelijkse hosting & onderhoud.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <PriceCard
              tag="Bundel"
              title="Beide tools — Cloud Assessment + Arena"
              price="Op aanvraag"
              body="Bouw, hosting eerste 12 maanden, kwartaal-review, branding-aanpassingen, dataset-eigendom Proserve."
              highlight
            />
            <PriceCard
              tag="Los"
              title="Cloud Assessment alleen"
              price="Op aanvraag"
              body="Voor wie eerst de assessment wil testen als lead-gen tool, met optie om de Arena later toe te voegen."
            />
          </div>

          <p style={{ fontSize: 13, color: MUTED, marginTop: 18 }}>
            Concrete prijsindicatie volgt op basis van scope-gesprek. Vergelijkbare projecten landen tussen €X en €Y eenmalig + ~€Z/mnd.
          </p>
        </div>
      </section>

      {/* ── Contact / CTA ── */}
      <section id="contact" style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
        color: '#fff', padding: '88px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: CORAL, marginBottom: 14 }}>
            Volgende stap
          </h2>
          <p style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 18, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            30 minuten. Live demo. Geen verkooppraat.
          </p>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, marginBottom: 32 }}>
            Ik laat je beide tools in actie zien, je kunt eigen vragen droppen tijdens de demo, en we bespreken of dit past bij jullie talent-funnel ambities.
          </p>

          <a
            href="https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: CORAL, color: '#fff', fontWeight: 800, fontSize: 17,
              padding: '16px 40px', borderRadius: 8, textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(244,109,92,0.4)',
              display: 'inline-block',
            }}
          >
            Plan een demo →
          </a>

          <p style={{ marginTop: 22, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            of stuur een mail naar{' '}
            <a href="mailto:mark@brandpwrdmedia.com" style={{ color: CORAL, textDecoration: 'underline' }}>
              mark@brandpwrdmedia.com
            </a>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#000', padding: '36px 24px', color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span>Voorstel · Mark de Kock voor Proserve · {new Date().getFullYear()}</span>
          <span>
            Hosted by Mark de Kock · <a href="https://markdekock.com" style={{ color: 'rgba(255,255,255,0.7)' }}>markdekock.com</a>
          </span>
        </div>
      </footer>
    </div>
  )
}

// ── Components ──────────────────────────────────────────────────────────────
function ProserveLogo() {
  return (
    <a href="/proserve" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/proserve/Proserve_logo.png"
        alt="Proserve · by teamblue"
        height={40}
        width={122}
        style={{ height: 40, width: 'auto', display: 'block' }}
      />
    </a>
  )
}

function Stat({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 20px' }}>
      <p style={{ fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 900, color: NAVY, letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: BODY, lineHeight: 1.55 }}>
        {caption}
      </p>
    </div>
  )
}

function FeatureCard({ icon, title, body, dark = false }: { icon: string; title: string; body: string; dark?: boolean }) {
  return (
    <div style={{
      background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : BORDER}`,
      borderRadius: 12, padding: '20px 22px',
    }}>
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 800, color: dark ? '#fff' : NAVY, marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.7)' : BODY, lineHeight: 1.55 }}>{body}</p>
    </div>
  )
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 22px' }}>
      <span style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', background: CORAL_LIGHT, color: CORAL, textAlign: 'center', lineHeight: '32px', fontWeight: 900, fontSize: 14, marginBottom: 10 }}>
        {n}
      </span>
      <p style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: BODY, lineHeight: 1.55 }}>{body}</p>
    </div>
  )
}

function PriceCard({ tag, title, price, body, highlight = false }: { tag: string; title: string; price: string; body: string; highlight?: boolean }) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DARK} 100%)` : '#fff',
      color: highlight ? '#fff' : INK,
      border: `1px solid ${highlight ? NAVY : BORDER}`,
      borderRadius: 14, padding: '26px 24px',
      position: 'relative',
    }}>
      <span style={{
        display: 'inline-block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: highlight ? CORAL : NAVY,
        background: highlight ? 'rgba(244,109,92,0.14)' : LIGHT_BG,
        padding: '4px 10px', borderRadius: 100, marginBottom: 14,
      }}>
        {tag}
      </span>
      <p style={{ fontSize: 20, fontWeight: 800, color: highlight ? '#fff' : NAVY, marginBottom: 12, lineHeight: 1.25 }}>
        {title}
      </p>
      <p style={{ fontSize: 32, fontWeight: 900, color: highlight ? CORAL : NAVY, letterSpacing: '-0.02em', marginBottom: 14 }}>
        {price}
      </p>
      <p style={{ fontSize: 14, color: highlight ? 'rgba(255,255,255,0.78)' : BODY, lineHeight: 1.55 }}>
        {body}
      </p>
    </div>
  )
}

function ResultsPreview() {
  return (
    <div style={{ background: LIGHT_BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '24px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: NAVY, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Voorbeeld · resultaat-pagina
        </span>
        <span style={{ fontSize: 11, color: MUTED }}>Maturity: <strong style={{ color: NAVY }}>Defined</strong> · Score 64/100</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { lbl: 'Cloud Strategy',         pct: 72 },
          { lbl: 'Cloud Adoption',         pct: 64 },
          { lbl: 'Infrastructure & Arch',  pct: 58 },
          { lbl: 'DevOps & Automation',    pct: 70 },
          { lbl: 'Security & Compliance',  pct: 52 },
          { lbl: 'FinOps & Cost',          pct: 48 },
        ].map(d => (
          <div key={d.lbl}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: BODY, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: NAVY }}>{d.lbl}</span>
              <span style={{ fontWeight: 800, color: CORAL }}>{d.pct}/100</span>
            </div>
            <div style={{ height: 7, background: '#fff', borderRadius: 100, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
              <div style={{ height: 7, width: `${d.pct}%`, background: CORAL, borderRadius: 100 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ArenaPreview() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 14, padding: '24px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: CORAL, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Voorbeeld · live leaderboard
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Join code: <strong style={{ color: '#fff', letterSpacing: '0.16em' }}>CLOUD4</strong> · 12 spelers</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { rank: 1, name: 'Mike R.',     score: 1180, accuracy: '10/10' },
          { rank: 2, name: 'Sara V.',     score: 1140, accuracy: '10/10' },
          { rank: 3, name: 'Joost B.',    score: 1090, accuracy: '9/10' },
          { rank: 4, name: 'Esra K.',     score: 1010, accuracy: '9/10' },
          { rank: 5, name: 'Daniël T.',   score:  950, accuracy: '9/10' },
        ].map(p => (
          <div key={p.rank} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: p.rank === 1 ? 'rgba(244,109,92,0.14)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${p.rank === 1 ? 'rgba(244,109,92,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 8, padding: '10px 14px',
          }}>
            <span style={{ width: 28, textAlign: 'center', fontSize: 14, fontWeight: 900, color: p.rank === 1 ? CORAL : 'rgba(255,255,255,0.55)' }}>
              {p.rank}
            </span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.name}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{p.accuracy}</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: CORAL, minWidth: 60, textAlign: 'right' }}>
              {p.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
