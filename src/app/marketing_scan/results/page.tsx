'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getScanContent, scoreColour, overallScore } from '@/products/marketing_scan/data'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const ACCENT  = '#F55200'
const DARK    = '#0A0A0A'
const PRIMARY = '#111111'
const MUTED   = '#6B7280'
const BORDER  = '#E5E7EB'
const BG_GRAY = '#F7F7F7'
const FONT    = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

type Lang = 'en' | 'nl' | 'de' | 'de-ch'

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    backLink:       '← Back to scan',
    subTitle:       'Marketing Organisation Scan',
    resultsLabel:   'Your Results',
    resultsTitle:   'Your Marketing Scan',
    assessedAs:     'Assessed as:',
    pillarTitle:    'Your 8 Pillar Scores',
    gapsTitle:      'Priority Gaps',
    strengthsTitle: 'Your Strengths',
    emailTitle:     'Get your results by email',
    emailBody:      'We\'ll send a summary of your scores — a useful reference for your next conversation.',
    emailName:      'Your name',
    emailPlaceholder: 'your@email.com',
    emailBtn:       'Send results →',
    emailSending:   'Sending…',
    emailSent:      'Results sent! Check your inbox.',
    emailError:     'Something went wrong. Please try again.',
    emailInvalid:   'Please enter a valid email address.',
    referTitle:     'Share with a colleague',
    referBody:      'Does a colleague see the organisation differently? Comparing perspectives gives you better insight.',
    referCopy:      'Copy link',
    referCopied:    'Copied!',
    referEmail:     'Send by email',
    ctaTitle:       'Ready to discuss your results?',
    ctaBody:        'Your scan results are a starting point. Book a conversation with Wouter to explore what the gaps mean for your organisation.',
    ctaBtn:         'Contact Wouter →',
    noResults:      'No results found.',
    startScan:      'Start the scan →',
    focusArea:      'Focus area: strengthen this pillar to move to the next maturity level.',
    strengthArea:   'You\'re above average here — build on this advantage.',
  },
  nl: {
    backLink:       '← Terug naar scan',
    subTitle:       'Marketing Organisatie Scan',
    resultsLabel:   'Jouw Resultaten',
    resultsTitle:   'Jouw Marketing Scan',
    assessedAs:     'Beoordeeld als:',
    pillarTitle:    'Jouw 8 Pillar Scores',
    gapsTitle:      'Prioritaire Verbeterpunten',
    strengthsTitle: 'Jouw Sterktes',
    emailTitle:     'Ontvang je resultaten per e-mail',
    emailBody:      'We sturen je een overzicht van je scores — handig als referentie voor je volgende gesprek.',
    emailName:      'Jouw naam',
    emailPlaceholder: 'jouw@email.nl',
    emailBtn:       'Verstuur resultaten →',
    emailSending:   'Versturen…',
    emailSent:      'Resultaten verzonden! Check je inbox.',
    emailError:     'Er ging iets mis. Probeer het opnieuw.',
    emailInvalid:   'Voer een geldig e-mailadres in.',
    referTitle:     'Deel met een collega',
    referBody:      'Ziet een collega de organisatie anders? Perspectieven vergelijken geeft beter inzicht.',
    referCopy:      'Kopieer link',
    referCopied:    'Gekopieerd!',
    referEmail:     'Stuur per e-mail',
    ctaTitle:       'Klaar om je resultaten te bespreken?',
    ctaBody:        'Je scanresultaten zijn een startpunt. Plan een gesprek met Wouter om te verkennen wat de verbeterpunten betekenen voor jouw organisatie.',
    ctaBtn:         'Neem contact op met Wouter →',
    noResults:      'Geen resultaten gevonden.',
    startScan:      'Start de scan →',
    focusArea:      'Focusgebied: versterk deze pillar om naar het volgende volwassenheidsniveau te gaan.',
    strengthArea:   'Je scoort hier bovengemiddeld — bouw verder op dit voordeel.',
  },
  de: {
    backLink:       '← Zurück zum Scan',
    subTitle:       'Marketing-Organisations-Scan',
    resultsLabel:   'Deine Ergebnisse',
    resultsTitle:   'Dein Marketing-Scan',
    assessedAs:     'Bewertet als:',
    pillarTitle:    'Deine 8 Pillar-Scores',
    gapsTitle:      'Prioritäre Lücken',
    strengthsTitle: 'Deine Stärken',
    emailTitle:     'Ergebnisse per E-Mail erhalten',
    emailBody:      'Wir senden dir eine Zusammenfassung deiner Scores — eine nützliche Referenz für dein nächstes Gespräch.',
    emailName:      'Dein Name',
    emailPlaceholder: 'deine@email.de',
    emailBtn:       'Ergebnisse senden →',
    emailSending:   'Senden…',
    emailSent:      'Ergebnisse gesendet! Prüfe deinen Posteingang.',
    emailError:     'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
    emailInvalid:   'Bitte gib eine gültige E-Mail-Adresse ein.',
    referTitle:     'Mit einem Kollegen teilen',
    referBody:      'Sieht ein Kollege die Organisation anders? Der Vergleich von Perspektiven gibt dir besseren Einblick.',
    referCopy:      'Link kopieren',
    referCopied:    'Kopiert!',
    referEmail:     'Per E-Mail senden',
    ctaTitle:       'Bereit, deine Ergebnisse zu besprechen?',
    ctaBody:        'Deine Scan-Ergebnisse sind ein Ausgangspunkt. Vereinbare ein Gespräch mit Wouter, um zu erkunden, was die Lücken für deine Organisation bedeuten.',
    ctaBtn:         'Wouter kontaktieren →',
    noResults:      'Keine Ergebnisse gefunden.',
    startScan:      'Scan starten →',
    focusArea:      'Fokusbereich: Stärke diesen Pillar, um auf die nächste Reifeebene zu gelangen.',
    strengthArea:   'Du liegst hier überdurchschnittlich — baue auf diesen Vorteil auf.',
  },
  'de-ch': {
    backLink:       '← Zurück zum Scan',
    subTitle:       'Marketing-Organisations-Scan',
    resultsLabel:   'Deine Ergebnisse',
    resultsTitle:   'Dein Marketing-Scan',
    assessedAs:     'Bewertet als:',
    pillarTitle:    'Deine 8 Pillar-Scores',
    gapsTitle:      'Prioritäre Lücken',
    strengthsTitle: 'Deine Stärken',
    emailTitle:     'Ergebnisse per E-Mail erhalten',
    emailBody:      'Wir senden dir eine Zusammenfassung deiner Scores — eine nützliche Referenz für dein nächstes Gespräch.',
    emailName:      'Dein Name',
    emailPlaceholder: 'deine@email.ch',
    emailBtn:       'Ergebnisse senden →',
    emailSending:   'Senden…',
    emailSent:      'Ergebnisse gesendet! Prüfe deinen Posteingang.',
    emailError:     'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
    emailInvalid:   'Bitte gib eine gültige E-Mail-Adresse ein.',
    referTitle:     'Mit einem Kollegen teilen',
    referBody:      'Sieht ein Kollege die Organisation anders? Der Vergleich von Perspektiven gibt dir besseren Einblick.',
    referCopy:      'Link kopieren',
    referCopied:    'Kopiert!',
    referEmail:     'Per E-Mail senden',
    ctaTitle:       'Bereit, deine Ergebnisse zu besprechen?',
    ctaBody:        'Deine Scan-Ergebnisse sind ein Ausgangspunkt. Vereinbare ein Gespräch mit Wouter, um zu erkunden, was die Lücken für deine Organisation bedeuten.',
    ctaBtn:         'Wouter kontaktieren →',
    noResults:      'Keine Ergebnisse gefunden.',
    startScan:      'Scan starten →',
    focusArea:      'Fokusbereich: Stärke diesen Pillar, um auf die nächste Reifeebene zu gelangen.',
    strengthArea:   'Du liegst hier überdurchschnittlich — baue auf diesen Vorteil auf.',
  },
}

// ── Email card ────────────────────────────────────────────────────────────────
function EmailCard({
  lang, avg, scoreLabel, pillarScores, pillars, t,
}: {
  lang: Lang
  avg: number
  scoreLabel: string
  pillarScores: Record<string, number>
  pillars: { id: string; name: string; icon: string }[]
  t: typeof T['en']
}) {
  const [name,   setName]   = useState('')
  const [email,  setEmail]  = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const handleSend = async () => {
    if (!email.includes('@')) { setErrMsg(t.emailInvalid); return }
    setErrMsg('')
    setStatus('sending')
    try {
      const res = await fetch('/api/marketing_scan/email', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, lang, avg, scoreLabel, pillarScores, pillars }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '28px', border: `1px solid ${BORDER}`, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📩</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: PRIMARY, marginBottom: 4 }}>{t.emailTitle}</p>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 16 }}>{t.emailBody}</p>

          {status === 'sent' ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 6, background: '#FFF3EE', color: ACCENT, fontSize: 13, fontWeight: 700 }}>
              ✓ {t.emailSent}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder={t.emailName}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ flex: '1 1 140px', padding: '9px 14px', borderRadius: 6, border: `1.5px solid ${BORDER}`, fontSize: 13, color: PRIMARY, outline: 'none', background: BG_GRAY }}
                />
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrMsg('') }}
                  style={{ flex: '2 1 180px', padding: '9px 14px', borderRadius: 6, border: `1.5px solid ${errMsg ? '#DC2626' : BORDER}`, fontSize: 13, color: PRIMARY, outline: 'none', background: BG_GRAY }}
                />
                <button
                  onClick={handleSend}
                  disabled={status === 'sending'}
                  style={{
                    padding: '9px 20px', borderRadius: 6,
                    background: status === 'sending' ? BORDER : 'transparent',
                    color: status === 'sending' ? MUTED : ACCENT,
                    border: status === 'sending' ? `2px solid ${BORDER}` : `2px solid ${ACCENT}`,
                    fontSize: 13, fontWeight: 700,
                    cursor: status === 'sending' ? 'not-allowed' : 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                >
                  {status === 'sending' ? t.emailSending : t.emailBtn}
                </button>
              </div>
              {errMsg          && <p style={{ fontSize: 12, color: '#DC2626', margin: 0 }}>{errMsg}</p>}
              {status === 'error' && <p style={{ fontSize: 12, color: '#DC2626', margin: 0 }}>{t.emailError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Referral card ─────────────────────────────────────────────────────────────
function ReferralCard({ lang, t }: { lang: Lang; t: typeof T['en'] }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.href}`
    : 'https://aiquiz.brandpwrdmedia.nl/marketing_scan'

  const shareUrl     = typeof window !== 'undefined' ? `${window.location.origin}/marketing_scan?lang=${lang}` : `https://aiquiz.brandpwrdmedia.nl/marketing_scan?lang=${lang}`
  const emailSubject = encodeURIComponent(
    lang === 'nl' ? 'Doe ook de Marketing Scan' :
    lang === 'de' || lang === 'de-ch' ? 'Mach auch den Marketing-Scan' :
    'Take the Marketing Organisation Scan'
  )
  const emailBody    = encodeURIComponent(
    `${lang === 'nl' ? 'Hoi, ik deed de Marketing Scan en vond het erg nuttig. Misschien ook interessant voor jou?' :
      lang === 'de' || lang === 'de-ch' ? 'Hallo, ich habe den Marketing-Scan gemacht und fand ihn sehr nützlich. Vielleicht auch interessant für dich?' :
      'Hi, I completed the Marketing Organisation Scan and found it genuinely useful. Thought it might be relevant for you too.'}\n\n${shareUrl}`
  )

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '28px', border: `1px solid ${BORDER}`, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🤝</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: PRIMARY, marginBottom: 4 }}>{t.referTitle}</p>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 16 }}>{t.referBody}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* "Send by email" — outlined button */}
            <a
              href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 6, background: 'transparent', color: PRIMARY, fontSize: 13, fontWeight: 700, textDecoration: 'none', border: `1.5px solid ${BORDER}` }}
            >
              ✉️ {t.referEmail}
            </a>
            <button
              onClick={copy}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 6,
                background: 'transparent',
                border: `1.5px solid ${copied ? ACCENT : BORDER}`,
                color: copied ? ACCENT : PRIMARY,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {copied ? '✓' : '🔗'} {copied ? t.referCopied : t.referCopy}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Inner component ────────────────────────────────────────────────────────────
function MarketingScanResultsInner() {
  const searchParams = useSearchParams()
  const rawLang      = searchParams.get('lang') ?? 'en'
  const lang         = (['en', 'nl', 'de', 'de-ch'].includes(rawLang) ? rawLang : 'en') as Lang
  const roleId       = searchParams.get('role') ?? ''
  const encoded      = searchParams.get('d') ?? ''
  const t            = T[lang]
  const { PILLARS, ROLES } = getScanContent(lang)
  const backHref     = `/marketing_scan?lang=${lang}`
  const assessHref   = `/marketing_scan/assess?lang=${lang}`

  // Decode scores
  let pillarScores: Record<string, number> = {}
  let decodeOk = false
  try {
    pillarScores = JSON.parse(atob(decodeURIComponent(encoded))) as Record<string, number>
    decodeOk     = true
  } catch {
    // fallback: show error state
  }

  if (!encoded || !decodeOk) {
    return (
      <div style={{ minHeight: '100vh', background: BG_GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24, fontFamily: FONT }}>
        <p style={{ fontSize: 16, color: PRIMARY }}>{t.noResults}</p>
        <Link href={assessHref} style={{ padding: '12px 24px', borderRadius: 6, background: ACCENT, color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
          {t.startScan}
        </Link>
      </div>
    )
  }

  const avg        = overallScore(pillarScores)
  const overallCol = scoreColour(avg)
  const scoreLabel = lang === 'nl' ? overallCol.labelNl : (lang === 'de' || lang === 'de-ch') ? overallCol.labelDe : overallCol.label
  const scoreDesc  = lang === 'nl' ? overallCol.descriptionNl : (lang === 'de' || lang === 'de-ch') ? overallCol.descriptionDe : overallCol.description
  const role       = ROLES.find(r => r.id === roleId)

  const ranked = PILLARS
    .map(p => ({ pillar: p, score: pillarScores[p.id] ?? 1 }))
    .sort((a, b) => a.score - b.score)

  const gaps      = ranked.slice(0, 3)
  const strengths = [...ranked].sort((a, b) => b.score - a.score).slice(0, 2)

  const pillarsForEmail = PILLARS.map(p => ({ id: p.id, name: p.name, icon: p.icon }))

  return (
    <div style={{ minHeight: '100vh', background: BG_GRAY, fontFamily: FONT }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/marketing_scan" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'rgba(0,0,0,0.9)', lineHeight: 1.2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>MARKENZUKUNFT</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.subTitle}</p>
            </div>
          </Link>
          <Link href={backHref} style={{ fontSize: 13, color: MUTED, textDecoration: 'none', fontWeight: 500 }}>{t.backLink}</Link>
        </div>
      </nav>

      {/* Score hero — light section */}
      <section style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: ACCENT, border: `1px solid ${ACCENT}44`,
            padding: '3px 12px', borderRadius: 4, marginBottom: 20,
          }}>
            {t.resultsLabel}
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111111', marginBottom: 4, letterSpacing: '-0.01em' }}>{t.resultsTitle}</h1>
          {role && <p style={{ fontSize: 14, color: MUTED, marginBottom: 28 }}>{t.assessedAs} {role.label}</p>}

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, background: BG_GRAY, borderRadius: 12, padding: '20px 28px', border: `1px solid ${BORDER}` }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: overallCol.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: '#fff', flexShrink: 0,
            }}>
              {avg.toFixed(1)}
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#111111', marginBottom: 4 }}>{scoreLabel}</p>
              <p style={{ fontSize: 14, color: MUTED, maxWidth: 440, lineHeight: 1.6 }}>{scoreDesc}</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Pillar scores */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '28px', border: `1px solid ${BORDER}`, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: PRIMARY, marginBottom: 22 }}>{t.pillarTitle}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PILLARS.map(p => {
              const s   = pillarScores[p.id] ?? 1
              const col = scoreColour(s)
              const bar = ((s - 1) / 3) * 100
              return (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}>{p.icon} {p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: col.bg }}>{s.toFixed(1)}/4</span>
                  </div>
                  <div style={{ height: 7, background: BG_GRAY, borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: 7, borderRadius: 100, transition: 'width 0.6s ease', width: `${bar}%`, background: ACCENT }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top gaps */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '28px', border: `1px solid ${BORDER}`, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: PRIMARY, marginBottom: 20 }}>{t.gapsTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {gaps.map(({ pillar, score }, i) => {
              const col = scoreColour(score)
              return (
                <div key={pillar.id} style={{ borderRadius: 8, padding: '20px 18px', background: col.pastelBg, border: `1px solid ${col.bg}22` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%', background: col.bg, color: '#fff',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 900, flexShrink: 0,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>{pillar.icon} {pillar.name}</span>
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 900, color: col.bg, marginBottom: 4 }}>{score.toFixed(1)}</p>
                  <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.55 }}>{t.focusArea}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Strengths */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '22px 28px', border: `1px solid ${BORDER}`, marginBottom: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FFF3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✨</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, marginBottom: 10 }}>{t.strengthsTitle}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {strengths.map(({ pillar, score }) => {
                const col = scoreColour(score)
                return (
                  <span key={pillar.id} style={{ fontSize: 13, fontWeight: 600, padding: '5px 14px', borderRadius: 4, background: col.pastelBg, color: col.bg, border: `1px solid ${col.bg}33` }}>
                    {pillar.icon} {pillar.name} · {score.toFixed(1)}
                  </span>
                )
              })}
            </div>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 10 }}>{t.strengthArea}</p>
          </div>
        </div>

        {/* Email capture */}
        <EmailCard
          lang={lang}
          avg={avg}
          scoreLabel={scoreLabel}
          pillarScores={pillarScores}
          pillars={pillarsForEmail}
          t={t}
        />

        {/* Referral */}
        <ReferralCard lang={lang} t={t} />

        {/* CTA — light section with outlined button */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '40px 36px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111111', marginBottom: 10, lineHeight: 1.3 }}>{t.ctaTitle}</h2>
          <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>{t.ctaBody}</p>
          <a
            href="mailto:wouter@markenzukunft.com"
            style={{ display: 'inline-block', background: 'transparent', color: ACCENT, fontWeight: 700, fontSize: 15, padding: '13px 32px', borderRadius: 6, textDecoration: 'none', border: `2px solid ${ACCENT}` }}
          >
            {t.ctaBtn}
          </a>
        </div>

      </div>
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function MarketingScanResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: BG_GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <MarketingScanResultsInner />
    </Suspense>
  )
}
