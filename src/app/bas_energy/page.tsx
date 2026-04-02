'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProfileContent } from '@/products/energy_profile/data'

type Lang = 'nl' | 'en'

const BRAND = '#0F7B55'
const BRAND_LIGHT = '#E6F4EF'

const T = {
  nl: {
    navName: 'Bas Westland', navRole: 'Trainer · Recruiter · e-people', startCta: 'Start scan →',
    badge: 'e-people · Kandidaatprofiel', heroTitle: 'Wie ben jij als je op je best bent?',
    heroSub: '15 vragen. 5 dimensies. Eén eerlijk profiel van hoe jij werkt.',
    heroPrimary: 'Start de scan →', heroSecondary: 'Hoe werkt het?',
    trustLine: '15 vragen · ~5 minuten · Gratis · Anoniem',
    howTitle: 'Wat meten we?', benefitsTitle: 'Wat krijg jij?',
    benefits: [
      { icon: '📊', title: 'Inzicht in jouw werkstijl', body: 'Ontdek hoe jij van nature werkt — waar jij energie uithaalt, hoe jij communiceert en wat jou drijft.' },
      { icon: '🎯', title: 'Input voor de match', body: 'Gebruik jouw profiel als basis voor de Match Engine. Zo zie je direct hoe jij past bij een vacature.' },
      { icon: '💬', title: 'Een betere intake', body: 'Gebruik jouw profiel als gespreksonderwerp met Bas. Zo gaan we meteen de diepte in.' },
    ],
    ctaTitle: 'Klaar om te beginnen?', ctaBtn: 'Start de scan →',
    footerLeft: 'e-people · Bas Westland', footerRight: '© 2025 e-people',
  },
  en: {
    navName: 'Bas Westland', navRole: 'Trainer · Recruiter · e-people', startCta: 'Start scan →',
    badge: 'e-people · Candidate Profile', heroTitle: 'Who are you at your best?',
    heroSub: '15 questions. 5 dimensions. One honest profile of how you work.',
    heroPrimary: 'Start the scan →', heroSecondary: 'How it works',
    trustLine: '15 questions · ~5 minutes · Free · Anonymous',
    howTitle: 'What do we measure?', benefitsTitle: 'What do you get?',
    benefits: [
      { icon: '📊', title: 'Insight into your work style', body: 'Discover how you naturally work — where you get your energy from, how you communicate and what drives you.' },
      { icon: '🎯', title: 'Input for the match', body: 'Use your profile as the basis for the Match Engine. See directly how you fit a vacancy.' },
      { icon: '💬', title: 'A better intake conversation', body: 'Use your profile as a conversation starter with Bas. We can dive deep right away.' },
    ],
    ctaTitle: 'Ready to start?', ctaBtn: 'Start the scan →',
    footerLeft: 'e-people · Bas Westland', footerRight: '© 2025 e-people',
  },
}

function BasEnergyLandingInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en'].includes(rawLang) ? rawLang : 'nl') as Lang
  const switchLang = (l: Lang) => router.replace(`/bas_energy?lang=${l}`)
  const t = T[lang]
  const { DIMENSIONS } = getProfileContent(lang)
  const assessHref = `/bas_energy/assess?lang=${lang}`

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#0F172A', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <nav style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>BW</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', lineHeight: 1.2, margin: 0 }}>{t.navName}</p>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.2, margin: 0 }}>{t.navRole}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', background: '#F7FAFC', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en'] as Lang[]).map(l => (
                <button key={l} onClick={() => switchLang(l)} style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: lang === l ? '#fff' : 'transparent', color: lang === l ? '#0F172A' : '#64748B', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <Link href={assessHref} style={{ background: BRAND, color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 100, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t.startCta}
            </Link>
          </div>
        </div>
      </nav>

      <section style={{ background: BRAND, padding: '88px 24px 96px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '5px 16px', borderRadius: 100, marginBottom: 28 }}>{t.badge}</span>
          <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 900, lineHeight: 1.15, color: '#fff', margin: '0 0 20px' }}>{t.heroTitle}</h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>{t.heroSub}</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <Link href={assessHref} style={{ background: '#fff', color: BRAND, fontWeight: 800, fontSize: 16, padding: '15px 38px', borderRadius: 100, textDecoration: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>{t.heroPrimary}</Link>
            <a href="#hoe-het-werkt" style={{ background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 15, padding: '15px 28px', borderRadius: 100, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.35)' }}>{t.heroSecondary}</a>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{t.trustLine}</p>
        </div>
      </section>

      <section id="hoe-het-werkt" style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 48 }}>{t.howTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
            {DIMENSIONS.map((dim, i) => (
              <div key={dim.id} style={{ borderRadius: 16, padding: '24px 20px', background: i % 2 === 1 ? BRAND_LIGHT : '#F8FAFC', border: `1px solid ${i % 2 === 1 ? 'rgba(15,123,85,0.2)' : '#E2E8F0'}` }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{dim.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>{dim.name}</p>
                <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: '0 0 14px' }}>{dim.description}</p>
                <div style={{ fontSize: 11, color: '#64748B', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>{dim.lowLabel}</span>
                  <span style={{ textAlign: 'right', maxWidth: '45%' }}>{dim.highLabel}</span>
                </div>
                <div style={{ height: 4, borderRadius: 100, background: BRAND, opacity: 0.35 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#F8FAFC', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 48 }}>{t.benefitsTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {t.benefits.map(b => (
              <div key={b.title} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{b.icon}</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>{b.title}</p>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.65, margin: 0 }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: BRAND, padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 900, color: '#fff', margin: '0 0 28px' }}>{t.ctaTitle}</h2>
        <Link href={assessHref} style={{ display: 'inline-block', background: '#fff', color: BRAND, fontWeight: 800, fontSize: 16, padding: '16px 40px', borderRadius: 100, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>{t.ctaBtn}</Link>
      </section>

      <footer style={{ background: '#0F172A', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{t.footerLeft}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.footerRight}</span>
        </div>
      </footer>
    </div>
  )
}

export default function BasEnergyLandingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${BRAND}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <BasEnergyLandingInner />
    </Suspense>
  )
}
