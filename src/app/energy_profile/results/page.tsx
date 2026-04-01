'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  getProfileContent,
  getDimensionProfile,
  profileColour,
  type DimensionId,
} from '@/products/energy_profile/data'

// Colours: coral=#2C2447 navy=#2C2447 amber=#696284 (all inlined)
type Lang = 'nl' | 'en'

const T = {
  nl: {
    backLink: '← Terug', subTitle: 'Energy Profile · Hire.nl',
    heroTitle: 'Jouw Energy Profile', scoreLabel: 'Gemiddelde score',
    dimsTitle: 'Jouw 5 dimensies', insightTitle: 'Wat dit over jou zegt',
    insightCards: (highDim: string, lowDim: string) => ([
      { title: `Jouw kracht: ${highDim}`, body: 'Dit is jouw sterkste dimensie. Hier ben jij op je best en haal jij de meeste energie uit. Leg dit bewust in gesprekken.' },
      { title: `Jouw balanszone: ${lowDim}`, body: 'Hier ligt jouw intern geankerde stijl. Dat is geen zwakte — het betekent dat je rust en diepgang waardeert in dit domein.' },
      { title: 'Hoe jij samenwerkt', body: 'Jouw profiel laat zien hoe jij energie, communicatie en samenwerking ervaart. Gebruik dit als gespreksstart met Laura.' },
    ]),
    emailTitle: 'Ontvang jouw profiel per e-mail', emailBody: 'We sturen je een overzicht van jouw vijf dimensies — handig om te bewaren en te delen.',
    emailName: 'Jouw naam', emailPlaceholder: 'jouw@email.nl', emailBtn: 'Verstuur →',
    emailSending: 'Versturen…', emailSent: 'Profiel verzonden! Check je inbox.',
    emailError: 'Er ging iets mis. Probeer het opnieuw.', emailInvalid: 'Voer een geldig e-mailadres in.',
    shareTitle: 'Deel jouw profiel', shareBody: 'Stuur de link naar een collega of sla hem op voor later.',
    shareCopy: 'Kopieer link', shareCopied: 'Gekopieerd!', shareEmail: 'Stuur per e-mail',
    ctaTitle: 'Klaar voor het gesprek?', ctaBody: 'Bespreek jouw Energy Profile met Laura. Ze helpt je begrijpen wat dit betekent voor jouw volgende stap.',
    ctaBtn: 'Neem contact op met Laura →', noResults: 'Geen resultaten gevonden.', startScan: 'Start de scan →',
  },
  en: {
    backLink: '← Back', subTitle: 'Energy Profile · Hire.nl',
    heroTitle: 'Your Energy Profile', scoreLabel: 'Average score',
    dimsTitle: 'Your 5 dimensions', insightTitle: 'What this says about you',
    insightCards: (highDim: string, lowDim: string) => ([
      { title: `Your strength: ${highDim}`, body: 'This is your strongest dimension. You are at your best here and draw the most energy from it. Bring this up in conversations.' },
      { title: `Your balance zone: ${lowDim}`, body: 'This is where your internally anchored style lives. That is not a weakness — it means you value calm and depth in this area.' },
      { title: 'How you collaborate', body: 'Your profile shows how you experience energy, communication and collaboration. Use this as a conversation starter with Laura.' },
    ]),
    emailTitle: 'Get your profile by email', emailBody: 'We will send you an overview of your five dimensions — useful to keep and share.',
    emailName: 'Your name', emailPlaceholder: 'your@email.com', emailBtn: 'Send →',
    emailSending: 'Sending…', emailSent: 'Profile sent! Check your inbox.',
    emailError: 'Something went wrong. Please try again.', emailInvalid: 'Please enter a valid email address.',
    shareTitle: 'Share your profile', shareBody: 'Send the link to a colleague or save it for later.',
    shareCopy: 'Copy link', shareCopied: 'Copied!', shareEmail: 'Send by email',
    ctaTitle: 'Ready for the conversation?', ctaBody: 'Discuss your Energy Profile with Laura. She will help you understand what this means for your next step.',
    ctaBtn: 'Contact Laura →', noResults: 'No results found.', startScan: 'Start the scan →',
  },
}

function EmailCard({ lang, avgScore, profileLabel, dimScores, dimensions, t }: {
  lang: Lang; avgScore: number; profileLabel: string;
  dimScores: Record<string, number>; dimensions: { id: string; name: string; icon: string }[];
  t: typeof T['nl']
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const handleSend = async () => {
    if (!email.includes('@')) { setErrMsg(t.emailInvalid); return }
    setErrMsg(''); setStatus('sending')
    try {
      const res = await fetch('/api/energy_profile/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, lang, avgScore, profileLabel, dimScores, dimensions }) })
      if (!res.ok) throw new Error()
      setStatus('sent')
    } catch { setStatus('error') }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '28px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📩</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#2C2447', margin: '0 0 4px' }}>{t.emailTitle}</p>
          <p style={{ fontSize: 13, color: '#696284', lineHeight: 1.6, margin: '0 0 16px' }}>{t.emailBody}</p>
          {status === 'sent' ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8, background: '#FFF3EE', color: '#2C2447', fontSize: 13, fontWeight: 700 }}>✓ {t.emailSent}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input type="text" placeholder={t.emailName} value={name} onChange={e => setName(e.target.value)} style={{ flex: '1 1 140px', padding: '9px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, color: '#2C2447', outline: 'none', background: '#F7FAFC' }} />
                <input type="email" placeholder={t.emailPlaceholder} value={email} onChange={e => { setEmail(e.target.value); setErrMsg('') }} style={{ flex: '2 1 180px', padding: '9px 14px', borderRadius: 8, border: `1.5px solid ${errMsg ? '#DC2626' : '#E2E8F0'}`, fontSize: 13, color: '#2C2447', outline: 'none', background: '#F7FAFC' }} />
                <button onClick={handleSend} disabled={status === 'sending'} style={{ padding: '9px 20px', borderRadius: 8, background: status === 'sending' ? '#E2E8F0' : '#2C2447', color: status === 'sending' ? '#696284' : '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: status === 'sending' ? 'not-allowed' : 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  {status === 'sending' ? t.emailSending : t.emailBtn}
                </button>
              </div>
              {errMsg && <p style={{ fontSize: 12, color: '#DC2626', margin: 0 }}>{errMsg}</p>}
              {status === 'error' && <p style={{ fontSize: 12, color: '#DC2626', margin: 0 }}>{t.emailError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ShareCard({ lang, t }: { lang: Lang; t: typeof T['nl'] }) {
  const [copied, setCopied] = useState(false)
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://aiquiz.brandpwrdmedia.nl/energy_profile?lang=${lang}`
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/energy_profile?lang=${lang}` : `https://aiquiz.brandpwrdmedia.nl/energy_profile?lang=${lang}`
  const subject = encodeURIComponent(lang === 'nl' ? 'Mijn Energy Profile — Hire.nl' : 'My Energy Profile — Hire.nl')
  const body = encodeURIComponent(lang === 'nl' ? `Hoi, ik deed het Energy Profile van Hire.nl en vond het een interessante spiegel. Misschien ook iets voor jou?\n\n${shareUrl}` : `Hi, I completed the Energy Profile from Hire.nl — it was a useful reflection. Might be relevant for you too.\n\n${shareUrl}`)
  const copy = () => { navigator.clipboard.writeText(pageUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '28px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔗</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#2C2447', margin: '0 0 4px' }}>{t.shareTitle}</p>
          <p style={{ fontSize: 13, color: '#696284', lineHeight: 1.6, margin: '0 0 16px' }}>{t.shareBody}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={`mailto:?subject=${subject}&body=${body}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: 'transparent', color: '#2C2447', fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1.5px solid #E2E8F0' }}>✉️ {t.shareEmail}</a>
            <button onClick={copy} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: 'transparent', border: `1.5px solid ${copied ? '#2C2447' : '#E2E8F0'}`, color: copied ? '#2C2447' : '#2C2447', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              {copied ? '✓' : '🔗'} {copied ? t.shareCopied : t.shareCopy}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EnergyProfileResultsInner() {
  const searchParams = useSearchParams()
  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en'].includes(rawLang) ? rawLang : 'nl') as Lang
  const roleId = searchParams.get('role') ?? ''
  const encoded = searchParams.get('d') ?? ''
  const t = T[lang]
  const { DIMENSIONS, ROLES } = getProfileContent(lang)
  const backHref = `/energy_profile?lang=${lang}`
  const assessHref = `/energy_profile/assess?lang=${lang}`

  let dimScores: Record<string, number> = {}
  let decodeOk = false
  try { dimScores = JSON.parse(atob(decodeURIComponent(encoded))) as Record<string, number>; decodeOk = true } catch { /* show error */ }

  if (!encoded || !decodeOk) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <p style={{ fontSize: 16, color: '#2C2447' }}>{t.noResults}</p>
        <Link href={assessHref} style={{ padding: '12px 24px', borderRadius: 8, background: '#2C2447', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>{t.startScan}</Link>
      </div>
    )
  }

  const scores = Object.values(dimScores)
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 1
  const colour = profileColour(avgScore)
  const label = lang === 'nl' ? colour.label : colour.labelEn
  const desc = lang === 'nl' ? colour.description : colour.descriptionEn
  const role = ROLES.find(r => r.id === roleId)
  const ranked = DIMENSIONS.map(dim => ({ dim, score: dimScores[dim.id] ?? 1 })).sort((a, b) => b.score - a.score)
  const highDim = ranked[0]?.dim.name ?? ''
  const lowDim = ranked[ranked.length - 1]?.dim.name ?? ''
  const insightCards = t.insightCards(highDim, lowDim)
  const dimsForEmail = DIMENSIONS.map(d => ({ id: d.id, name: d.name, icon: d.icon }))

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/energy_profile" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2C2447', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>LD</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#2C2447', lineHeight: 1.2, margin: 0 }}>Laura Dijcks</p>
              <p style={{ fontSize: 11, color: '#696284', lineHeight: 1.2, margin: 0 }}>{t.subTitle}</p>
            </div>
          </Link>
          <Link href={backHref} style={{ fontSize: 13, color: '#696284', textDecoration: 'none', fontWeight: 500 }}>{t.backLink}</Link>
        </div>
      </nav>

      <section style={{ background: '#2C2447', padding: '56px 24px 64px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', background: colour.bg, padding: '5px 16px', borderRadius: 100, marginBottom: 20 }}>{label}</span>
          <h1 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: '#fff', margin: '0 0 20px', lineHeight: 1.2 }}>{t.heroTitle}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 28px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: colour.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{avgScore.toFixed(1)}</div>
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>{t.scoreLabel}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>{label}</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 440, lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          </div>
          {role && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 16 }}>{role.label}</p>}
        </div>
      </section>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 80px' }}>

        <div style={{ background: '#fff', borderRadius: 12, padding: '28px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#2C2447', margin: '0 0 24px' }}>{t.dimsTitle}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {DIMENSIONS.map(dim => {
              const score = dimScores[dim.id as DimensionId] ?? 1
              const profLabel = getDimensionProfile(score, dim.id as DimensionId, lang)
              const pct = ((score - 1) / 3) * 100
              return (
                <div key={dim.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#2C2447' }}>{dim.icon} {dim.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#2C2447', background: '#FFF3EE', padding: '2px 10px', borderRadius: 100 }}>{profLabel}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#2C2447' }}>{score.toFixed(1)}/4</span>
                    </div>
                  </div>
                  <div style={{ position: 'relative', height: 8, background: '#EEF2F7', borderRadius: 100, overflow: 'visible', marginBottom: 6 }}>
                    <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: '50%', background: '#2C2447', border: '2px solid #fff', boxShadow: '0 2px 6px rgba(232,73,26,0.35)' }} />
                    <div style={{ height: 8, borderRadius: 100, background: 'linear-gradient(90deg,rgba(232,73,26,0.15) 0%,rgba(232,73,26,0.6) 100%)', width: `${pct}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#696284' }}>
                    <span>{dim.lowLabel}</span>
                    <span style={{ textAlign: 'right', maxWidth: '45%' }}>{dim.highLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: '#F8F7FA', borderRadius: 12, padding: '28px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#2C2447', margin: '0 0 20px' }}>{t.insightTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
            {insightCards.map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>
                  {i === 0 ? '⚡' : i === 1 ? '🧘' : '🤝'}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#2C2447', margin: '0 0 8px' }}>{card.title}</p>
                <p style={{ fontSize: 13, color: '#2C2447', lineHeight: 1.65, margin: 0 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        <EmailCard lang={lang} avgScore={avgScore} profileLabel={label} dimScores={dimScores} dimensions={dimsForEmail} t={t} />
        <ShareCard lang={lang} t={t} />

        <div style={{ background: '#2C2447', borderRadius: 12, padding: '40px 36px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>{t.ctaTitle}</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>{t.ctaBody}</p>
          <a href="mailto:laura@hire.nl" style={{ display: 'inline-block', background: '#fff', color: '#2C2447', fontWeight: 700, fontSize: 15, padding: '13px 32px', borderRadius: 100, textDecoration: 'none' }}>{t.ctaBtn}</a>
        </div>

      </div>
    </div>
  )
}

export default function EnergyProfileResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #2C2447', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <EnergyProfileResultsInner />
    </Suspense>
  )
}
