'use client'

import Link from 'next/link'

const BRAND = '#0F7B55'
const BRAND_LIGHT = '#E6F4EF'

const STEPS = [
  { icon: '🧭', step: '01', title: 'Kandidaat doet de scan', body: 'De kandidaat beantwoordt 15 vragen over zijn werkstijl. Duurt ~5 minuten. Resultaat: een Energy Profile in 5 dimensies.' },
  { icon: '🔗', step: '02', title: 'Profiel wordt gedeeld', body: 'De kandidaat klikt "Start Match Engine" op zijn resultatenpagina. Zijn scores worden automatisch meegenomen.' },
  { icon: '🎯', step: '03', title: 'Recruiter vult vacatureprofiel in', body: 'Jij — als recruiter — geeft per dimensie aan wat de ideale score is voor deze rol. Duurt 2 minuten.' },
  { icon: '📊', step: '04', title: 'Match in beeld', body: 'De Match Engine toont per dimensie het verschil en berekent een totale match-score. Concreet gesprek, geen onderbuikgevoel.' },
]

const DIMS = [
  { icon: '⚡', name: 'Energie-stijl', body: 'Solitair vs. sociaal — past de kandidaat bij de dynamiek van het team?' },
  { icon: '💬', name: 'Communicatie', body: 'Doordacht vs. direct — sluit de communicatiestijl aan bij de rol?' },
  { icon: '🎯', name: 'Motivatie', body: 'Vakmanschap vs. impact — wat drijft de kandidaat dagelijks?' },
  { icon: '🤝', name: 'Samenwerking', body: 'Versterken vs. leiden — hoe werkt de kandidaat samen in een team?' },
  { icon: '🛡️', name: 'Weerbaarheid', body: 'Rust vs. spanning — hoe gaat de kandidaat om met druk en verandering?' },
]

export default function MatchEngineLandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#0F172A', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>BW</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>Match Engine</p>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.2, margin: 0 }}>e-people · Bas Westland</p>
            </div>
          </div>
          <Link href="/bas_energy" style={{ background: BRAND, color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Start Energy Scan →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: BRAND, padding: '88px 24px 96px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '5px 16px', borderRadius: 100, marginBottom: 28 }}>e-people · Match Engine</span>
          <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, lineHeight: 1.12, color: '#fff', margin: '0 0 22px' }}>
            Twee profielen.<br />Één gespreksbasis.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 42px' }}>
            Kandidaat + vacature gematcht op werkstijl in minuten. Concreet. Objectief. Direct bespreekbaar.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <Link href="/bas_energy" style={{ background: '#fff', color: BRAND, fontWeight: 800, fontSize: 16, padding: '15px 38px', borderRadius: 100, textDecoration: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>Start als kandidaat →</Link>
            <Link href="/match_engine/start" style={{ background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 15, padding: '15px 28px', borderRadius: 100, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.35)' }}>Ik ben recruiter →</Link>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>15 vragen · 5 dimensies · Resultaat in seconden</p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', padding: '88px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 56 }}>Hoe werkt het?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ borderRadius: 16, padding: '28px 22px', border: '1px solid #E2E8F0', position: 'relative', background: '#fff' }}>
                <div style={{ position: 'absolute', top: -14, left: 22, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: BRAND, background: BRAND_LIGHT, padding: '3px 10px', borderRadius: 100 }}>{s.step}</div>
                <div style={{ fontSize: 30, marginBottom: 14, marginTop: 8 }}>{s.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>{s.title}</p>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dimensions */}
      <section style={{ background: '#F8FAFC', padding: '88px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>5 dimensies. 1 gespreksbasis.</h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: '#64748B', marginBottom: 52 }}>Elke dimensie vergelijkt kandidaat met vacatureprofiel en toont het verschil direct.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
            {DIMS.map((d, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '24px 20px', border: '1px solid #E2E8F0', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: BRAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{d.icon}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 5px' }}>{d.name}</p>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>{d.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: BRAND, padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>Probeer het nu</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>Kandidaat doet de scan → jij vult het vacatureprofiel in → match is klaar.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/bas_energy" style={{ display: 'inline-block', background: '#fff', color: BRAND, fontWeight: 800, fontSize: 15, padding: '14px 36px', borderRadius: 100, textDecoration: 'none' }}>Ik ben kandidaat →</Link>
          <Link href="/match_engine/start" style={{ display: 'inline-block', background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px 36px', borderRadius: 100, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>Ik ben recruiter →</Link>
        </div>
      </section>

      <footer style={{ background: '#0F172A', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>e-people · Match Engine · Bas Westland</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>© 2025 e-people</span>
        </div>
      </footer>
    </div>
  )
}
