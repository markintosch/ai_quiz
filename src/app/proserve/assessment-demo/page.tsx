// FILE: src/app/proserve/assessment-demo/page.tsx
// Proserve-themed walkthrough of the Cloud Readiness Assessment. Mock content;
// the actual engine is cloud_readiness, re-skinned for Proserve once they sign.

import {
  NAVY, NAVY_DARK, BLUE, BLUE_SOFT, INK, BODY, MUTED, BORDER, LIGHT_BG, FONT,
  ProserveNav, ProserveFooter, ProserveDemoCta,
} from '../_chrome'

export const metadata = {
  title: 'Cloud Readiness Assessment · demo voor Proserve',
  robots: { index: false, follow: false },
}

export default function AssessmentDemoPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT }}>
      <ProserveNav trail="Cloud Assessment demo" />

      {/* ── Hero ── */}
      <section style={{ background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 100%)`, color: '#fff', padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Cloud Readiness Assessment · 8 minuten
          </p>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 20, letterSpacing: '-0.025em', color: '#fff' }}>
            Een diagnose-tool waarmee Proserve <span style={{ color: BLUE }}>autoriteit toont</span> en leads kwalificeert.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, marginBottom: 0, maxWidth: 720 }}>
            30 vragen · 6 dimensies · 5 maturity-niveaus. Bezoeker krijgt direct een persoonlijk dashboard met score, niveau en de drie belangrijkste vervolgstappen — Proserve verschijnt als de partner die helpt om die stappen te zetten.
          </p>
        </div>
      </section>

      {/* ── How a session flows ── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Hoe het verloopt voor de bezoeker
          </h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 36, letterSpacing: '-0.015em', maxWidth: 720, lineHeight: 1.2 }}>
            Drie stappen, geen drempel.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <FlowCard n="1" title="Intake (30 sec)" body="E-mail, rol, bedrijfsgrootte. Geen account, geen wachtwoord. Drempelloos in onder een minuut." />
            <FlowCard n="2" title="30 vragen (~7 min)" body="Verdeeld over 6 dimensies. Multiple choice. Voortgangsbalk in Proserve-stijl. Mobielvriendelijk." />
            <FlowCard n="3" title="Persoonlijk dashboard" body="Score, maturity-niveau, breakdown per dimensie, drie vervolgstappen. Direct deelbaar via een unieke link." />
          </div>
        </div>
      </section>

      {/* ── Mock results page ── */}
      <section style={{ background: LIGHT_BG, padding: '72px 24px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Wat de bezoeker krijgt · voorbeeld
          </h2>
          <p style={{ fontSize: 22, fontWeight: 800, color: NAVY, marginBottom: 24, letterSpacing: '-0.015em' }}>
            Score, dimensies, en gerichte aanbevelingen.
          </p>

          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '32px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18, marginBottom: 28, paddingBottom: 22, borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 6 }}>
                  Maturity-niveau
                </p>
                <p style={{ fontSize: 32, fontWeight: 900, color: NAVY, letterSpacing: '-0.02em' }}>Defined</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 6 }}>
                  Totaalscore
                </p>
                <p style={{ fontSize: 48, fontWeight: 900, color: BLUE, letterSpacing: '-0.025em', lineHeight: 1 }}>
                  64<span style={{ fontSize: 20, color: MUTED, fontWeight: 700 }}>/100</span>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { lbl: 'Cloud Strategy',          icon: '🧭', pct: 72 },
                { lbl: 'Cloud Adoption',          icon: '☁️', pct: 64 },
                { lbl: 'Infrastructure & Arch',   icon: '🏗️', pct: 58 },
                { lbl: 'DevOps & Automation',     icon: '⚙️', pct: 70 },
                { lbl: 'Security & Compliance',   icon: '🛡️', pct: 52 },
                { lbl: 'FinOps & Cost',           icon: '📊', pct: 48 },
              ].map(d => (
                <div key={d.lbl}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, color: NAVY, fontWeight: 700 }}>
                      <span style={{ marginRight: 8 }}>{d.icon}</span>{d.lbl}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: BLUE }}>{d.pct}/100</span>
                  </div>
                  <div style={{ height: 8, background: BLUE_SOFT, borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: 8, width: `${d.pct}%`, background: BLUE, borderRadius: 100 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, padding: '20px 22px', background: BLUE_SOFT, borderRadius: 12, border: `1px solid ${BLUE}33` }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: BLUE, marginBottom: 8 }}>
                Aanbeveling — door Proserve
              </p>
              <p style={{ fontSize: 14, color: INK, lineHeight: 1.6, margin: 0 }}>
                Je grootste hefbomen zitten in <strong>FinOps</strong> en <strong>Security</strong>. Proserve helpt &gt;500 klanten bij vergelijkbare uitdagingen — wij sturen je drie casestudies van bedrijven met een vergelijkbaar profiel.
              </p>
            </div>
          </div>

          <p style={{ marginTop: 18, fontSize: 12, color: MUTED, textAlign: 'center' }}>
            Een werkende versie van de assessment staat op cloud.brandpwrdmedia.nl (TrueFullstaq-branded). Bij Proserve wordt deze volledig in jullie huisstijl gebouwd.
          </p>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Hoe Proserve het inzet
          </h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 28, letterSpacing: '-0.015em' }}>
            Drie scenario&apos;s waar het direct waarde levert.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <UseCard
              icon="🎯"
              title="Lead-magneet voor sales"
              body="Op proserve.nl/cloud-check. Bezoekers vullen in, jullie zien wie ze zijn, hun maturity-niveau en exact welke vervolgstappen ze nodig hebben. Sales hoeft niet meer koud te bellen."
            />
            <UseCard
              icon="🤝"
              title="Pre-sales voor managed services"
              body="Stuur de assessment naar prospects vóór het gesprek. Tijdens het call hebben jullie data om het gesprek meteen op het juiste niveau te beginnen."
            />
            <UseCard
              icon="🎓"
              title="Talent-funnel"
              body="Sollicitanten doen 'm voorafgaand aan een gesprek. Recruiters zien direct het denkkader. Geen verspilde eerste rondes meer."
            />
          </div>
        </div>
      </section>

      <ProserveDemoCta note="Ik laat je de live assessment-flow zien (TrueFullstaq-branded), en hoe het er voor Proserve uit zou gaan zien. 30 minuten." />
      <ProserveFooter />
    </div>
  )
}

function FlowCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ background: LIGHT_BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '22px 22px' }}>
      <span style={{
        display: 'inline-block', width: 32, height: 32, borderRadius: '50%',
        background: BLUE_SOFT, color: BLUE, textAlign: 'center', lineHeight: '32px',
        fontWeight: 900, fontSize: 14, marginBottom: 12,
      }}>{n}</span>
      <p style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: BODY, lineHeight: 1.55 }}>{body}</p>
    </div>
  )
}

function UseCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ background: LIGHT_BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '24px 26px' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 17, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6 }}>{body}</p>
    </div>
  )
}
