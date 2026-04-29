// FILE: src/app/proserve/arena-demo/page.tsx
// Proserve-themed walkthrough of the Cloud Arena game. Mock content;
// the actual engine lives at /arena/[code] and gets re-skinned for
// Proserve once they sign.

import {
  NAVY, NAVY_DARK, BLUE, BLUE_SOFT, INK, BODY, MUTED, BORDER, LIGHT_BG, FONT,
  ProserveNav, ProserveFooter, ProserveDemoCta,
} from '../_chrome'

export const metadata = {
  title: 'Cloud Arena · demo voor Proserve',
  robots: { index: false, follow: false },
}

export default function ArenaDemoPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT }}>
      <ProserveNav trail="Cloud Arena demo" />

      {/* ── Hero ── */}
      <section style={{ background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 100%)`, color: '#fff', padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Cloud Arena · het talent-spel
          </p>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 20, letterSpacing: '-0.025em', color: '#fff' }}>
            Een live cloud-quiz waarmee Proserve <span style={{ color: BLUE }}>talent uitdaagt</span> — en herkent.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, marginBottom: 0, maxWidth: 720 }}>
            10 vragen · 30 seconden per vraag · live leaderboard. Spelers joinen via QR of 6-letter code op hun eigen scherm. Jullie team kan meekijken op een groot scherm. Ideaal voor recruitment-events, conferenties (AWS Summit, KubeCon, Serverless Days) of campusbezoeken.
          </p>
        </div>
      </section>

      {/* ── How it flows ── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Hoe een sessie eruitziet
          </h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 36, letterSpacing: '-0.015em', maxWidth: 720, lineHeight: 1.2 }}>
            Vier stappen, van join-code tot recruitment-lead.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <FlowCard n="1" title="Genereer code" body="Recruiter klikt 'New session'. Proserve-themed lobby met 6-letter join code en QR." />
            <FlowCard n="2" title="Spelers joinen" body="Bezoekers scannen of typen de code. Voornaam invullen, klaar. Geen account, geen friction." />
            <FlowCard n="3" title="Live spel" body="10 cloud-vragen. 30 seconden per vraag. Snelheid telt mee. Leaderboard updatet realtime." />
            <FlowCard n="4" title="Follow-up" body="Top-scorers zien een 'work at Proserve'-call to action. Email-capture optioneel; warme leads voor recruitment." />
          </div>
        </div>
      </section>

      {/* ── Mockup leaderboard ── */}
      <section style={{ background: `linear-gradient(180deg, ${NAVY_DARK} 0%, ${NAVY} 100%)`, color: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Live leaderboard · voorbeeld
          </p>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 24, letterSpacing: '-0.015em' }}>
            Wat de spelers en jullie team zien tijdens een sessie.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 16, padding: '28px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Join code
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: BLUE, letterSpacing: '0.18em' }}>CLOUD4</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Vraag
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>7 / 10</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { rank: 1, name: 'Mike R.',     score: 1180, accuracy: '7/7' },
                { rank: 2, name: 'Sara V.',     score: 1140, accuracy: '7/7' },
                { rank: 3, name: 'Joost B.',    score: 1090, accuracy: '6/7' },
                { rank: 4, name: 'Esra K.',     score: 1010, accuracy: '6/7' },
                { rank: 5, name: 'Daniël T.',   score:  950, accuracy: '6/7' },
              ].map(p => (
                <div key={p.rank} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: p.rank === 1 ? 'rgba(31,142,255,0.14)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${p.rank === 1 ? 'rgba(31,142,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10, padding: '12px 16px',
                }}>
                  <span style={{ width: 28, textAlign: 'center', fontSize: 14, fontWeight: 900, color: p.rank === 1 ? BLUE : 'rgba(255,255,255,0.55)' }}>
                    {p.rank}
                  </span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#fff' }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{p.accuracy}</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: BLUE, minWidth: 60, textAlign: 'right' }}>
                    {p.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ marginTop: 18, fontSize: 12, color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
            Een werkende versie van het spel staat op cloud.brandpwrdmedia.nl/arena (TrueFullstaq-branded). Bij Proserve wordt deze volledig in jullie huisstijl gebouwd.
          </p>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section style={{ background: LIGHT_BG, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: BLUE, marginBottom: 12 }}>
            Waar het ingezet kan worden
          </h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: NAVY, marginBottom: 28, letterSpacing: '-0.015em' }}>
            Drie scenario&apos;s waar het direct waarde levert.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <UseCard
              icon="🎪"
              title="Op events"
              body="Beman je stand bij AWS Summit of KubeCon. Bezoekers spelen voor een prijs. Jullie verzamelen warme contacten en zien direct wie écht cloud-savvy is."
            />
            <UseCard
              icon="🎓"
              title="Op campussen"
              body="Cloud-bachelors uitdagen tijdens carrière-events. Top-scorers krijgen een persoonlijke uitnodiging voor een gesprek met Proserve recruitment."
            />
            <UseCard
              icon="🎯"
              title="In de funnel"
              body="Spel als optionele assessment-laag in vacatures. Sollicitanten die scoren krijgen voorrang. Filter werkt voor Proserve én voor de kandidaat."
            />
          </div>
        </div>
      </section>

      <ProserveDemoCta note="Ik draai een live sessie met je: jij ontvangt een join-code, ik leg uit hoe recruiters het zelf kunnen draaien. 30 minuten." />
      <ProserveFooter />
    </div>
  )
}

function FlowCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '22px 22px' }}>
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
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '24px 26px' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 17, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6 }}>{body}</p>
      {/* Suppress unused */}
      <span style={{ display: 'none' }}>{MUTED}</span>
    </div>
  )
}
