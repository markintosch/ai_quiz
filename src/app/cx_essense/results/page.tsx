'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getCxContent, scoreColour, overallScore, type CxDimScores } from '@/products/cx_essense/data'
import CxRadarChart from '@/components/cx/RadarChart'

// ── Brand tokens ──────────────────────────────────────────────────────────────
const GREEN       = '#24CF7A'
const GREEN_DARK  = '#044524'
const GREEN_LIGHT = '#EAF5F2'
const DARK        = '#1A1A2E'
const BODY        = '#374151'
const MUTED       = '#94A3B8'

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    resultsLabel:   'Your Results',
    resultsTitle:   'Your CX Maturity Picture',
    assessedAs:     'Assessed as:',
    radarLabel:     'CX Maturity Radar',
    overallLabel:   'Overall score',
    gapsTitle:      'Your 3 biggest opportunities',
    strengthsTitle: 'Where you\'re already strong',
    referTitle:     'Refer to a colleague',
    referBody:      'Are your results aligned — or does a colleague see the organisation differently? Compare your perspectives.',
    referEmail:     'Send by email',
    referCopy:      'Copy link',
    referCopied:    'Copied!',
    emailTitle:     'Receive your results by email',
    emailBody:      'We\'ll send a summary of your scores — a useful reference for your next conversation.',
    emailName:      'Your name (optional)',
    emailPlaceholder: 'your@email.com',
    emailBtn:       'Send results →',
    emailSending:   'Sending…',
    emailSent:      'Results sent! Check your inbox.',
    emailError:     'Something went wrong. Please try again.',
    emailInvalid:   'Please enter a valid email address.',
    ctaTitle:       'Want to turn this into action?',
    ctaBody:        'These results are a starting point — not a verdict. Book a conversation with Essense to explore what the gaps mean for your organisation.',
    ctaBtn:         'Talk to Essense →',
    retakeBtn:      'Retake assessment',
    ctaCaption:     'No sales pitch. Just a useful, practical conversation.',
    backLink:       '← Back to overview',
    subTitle:       'CX Maturity Assessment',
  },
  nl: {
    resultsLabel:   'Jouw Resultaten',
    resultsTitle:   'Jouw CX Volwassenheidsprofiel',
    assessedAs:     'Beoordeeld als:',
    radarLabel:     'CX Volwassenheidsradar',
    overallLabel:   'Totaalscore',
    gapsTitle:      'Jouw 3 grootste kansen',
    strengthsTitle: 'Waar je al sterk in bent',
    referTitle:     'Stuur door naar een collega',
    referBody:      'Zijn jullie resultaten eensgezind — of ziet een collega de organisatie anders? Vergelijk jullie perspectieven.',
    referEmail:     'Stuur via e-mail',
    referCopy:      'Kopieer link',
    referCopied:    'Gekopieerd!',
    emailTitle:     'Ontvang je resultaten per e-mail',
    emailBody:      'We sturen je een overzicht van je scores — handig als referentie voor je volgende gesprek.',
    emailName:      'Jouw naam (optioneel)',
    emailPlaceholder: 'jouw@email.nl',
    emailBtn:       'Verstuur resultaten →',
    emailSending:   'Versturen…',
    emailSent:      'Resultaten verzonden! Check je inbox.',
    emailError:     'Er ging iets mis. Probeer het opnieuw.',
    emailInvalid:   'Voer een geldig e-mailadres in.',
    ctaTitle:       'Wil je dit omzetten in actie?',
    ctaBody:        'Deze resultaten zijn een startpunt — geen eindoordeel. Plan een gesprek met Essense om te verkennen wat de verbeterpunten betekenen voor jouw organisatie.',
    ctaBtn:         'Praat met Essense →',
    retakeBtn:      'Assessment opnieuw doen',
    ctaCaption:     'Geen verkooppraatje. Gewoon een nuttig, praktisch gesprek.',
    backLink:       '← Terug naar overzicht',
    subTitle:       'CX Volwassenheidsassessment',
  },
}

// ── Inner component ────────────────────────────────────────────────────────────
function CxEssenseResultsInner() {
  const searchParams = useSearchParams()
  const lang         = (searchParams.get('lang') === 'nl' ? 'nl' : 'en') as 'en' | 'nl'
  const roleId       = searchParams.get('role') ?? ''
  const encoded      = searchParams.get('d') ?? ''
  const t            = T[lang]
  const { DIMENSIONS, ROLES } = getCxContent(lang)
  const backHref     = lang === 'nl' ? '/cx_essense?lang=nl' : '/cx_essense'
  const assessHref   = lang === 'nl' ? '/cx_essense/assess?lang=nl' : '/cx_essense/assess'

  // Decode scores from URL param
  let dimScores: CxDimScores = {} as CxDimScores
  try {
    const decoded = JSON.parse(atob(decodeURIComponent(encoded)))
    dimScores = decoded as CxDimScores
  } catch {
    // fallback — redirect to assess if scores are missing
  }

  const avg        = overallScore(dimScores)
  const overallCol = scoreColour(avg)
  const role       = ROLES.find(r => r.id === roleId)
  const scoreLabel = lang === 'nl' ? overallCol.labelNl : overallCol.label

  const gaps = DIMENSIONS
    .map(d => ({ dim: d, score: dimScores[d.id] ?? 1 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)

  const strengths = DIMENSIONS
    .map(d => ({ dim: d, score: dimScores[d.id] ?? 1 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  const mailtoSubject = lang === 'nl'
    ? 'CX%20Volwassenheidsassessment%20%E2%80%94%20Gesprek%20aanvragen'
    : 'CX%20Maturity%20Assessment%20%E2%80%94%20Let%27s%20talk'
  const mailtoBody = lang === 'nl'
    ? `Hallo%20Essense%2C%0A%0AIk%20heb%20het%20CX%20Volwassenheidsassessment%20ingevuld%20en%20scoorde%20${avg.toFixed(1)}%20(${encodeURIComponent(scoreLabel)}).%0A%0AIk%20wil%20graag%20bespreken%20wat%20dit%20betekent%20voor%20mijn%20organisatie.%0A%0AMet%20vriendelijke%20groet%2C`
    : `Hello%20Essense%2C%0A%0AI%20completed%20the%20CX%20Maturity%20Assessment%20and%20scored%20${avg.toFixed(1)}%20(${encodeURIComponent(scoreLabel)}).%0A%0AI%27d%20love%20to%20discuss%20what%20this%20means%20for%20my%20organisation.%0A%0AKind%20regards%2C`
  const essenseMailto = `mailto:hello@essense.eu?subject=${mailtoSubject}&body=${mailtoBody}`

  if (!encoded) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFBFD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24 }}>
        <p style={{ fontSize: 16, color: BODY }}>No results found.</p>
        <Link href={assessHref} style={{ padding: '12px 24px', borderRadius: 100, background: GREEN, color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
          Start the assessment →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFBFD', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #EEF2F7', height: 64, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={backHref} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: GREEN_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: GREEN, fontSize: 18, fontWeight: 900 }}>e</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: DARK, lineHeight: 1.2 }}>Essense</p>
              <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.subTitle}</p>
            </div>
          </Link>
          <Link href={backHref} style={{ fontSize: 13, color: MUTED, textDecoration: 'none', fontWeight: 500 }}>{t.backLink}</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Results header */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: GREEN_DARK, background: GREEN_LIGHT, padding: '3px 12px', borderRadius: 100, marginBottom: 16 }}>
            {t.resultsLabel}
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: DARK, marginBottom: 8, lineHeight: 1.2 }}>{t.resultsTitle}</h1>
          {role && <p style={{ fontSize: 15, color: BODY }}>{t.assessedAs} <strong>{role.label}</strong></p>}
        </div>

        {/* Radar + score bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, marginBottom: 24, alignItems: 'start' }}>

          <div style={{ background: '#fff', borderRadius: 24, padding: '28px 24px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 16 }}>{t.radarLabel}</p>
            <CxRadarChart scores={dimScores} size={260} primaryColor={overallCol.bg} />
          </div>

          <div style={{ background: '#fff', borderRadius: 24, padding: '28px 24px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: overallCol.pastelBg, borderRadius: 16, padding: '14px 20px', marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: overallCol.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900 }}>
                {avg.toFixed(1)}
              </div>
              <div>
                <p style={{ fontSize: 12, color: MUTED, marginBottom: 2 }}>{t.overallLabel}</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: overallCol.bg }}>{scoreLabel}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {DIMENSIONS.map(d => {
                const s        = dimScores[d.id] ?? 1
                const col      = scoreColour(s)
                const dimLabel = lang === 'nl' ? col.labelNl : col.label
                const bar      = ((s - 1) / 3) * 100
                return (
                  <div key={d.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{d.icon} {d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: col.bg }}>{s.toFixed(1)} · {dimLabel}</span>
                    </div>
                    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: 8, borderRadius: 100, transition: 'width 0.6s ease', width: `${bar}%`, background: col.bg }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top 3 gaps */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '28px 24px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: DARK, marginBottom: 20 }}>{t.gapsTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {gaps.map(({ dim, score }, i) => {
              const col      = scoreColour(score)
              const gapLabel = lang === 'nl' ? col.labelNl : col.label
              return (
                <div key={dim.id} style={{ borderRadius: 18, padding: '20px 18px', background: col.pastelBg, border: `1px solid ${col.bg}33` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: col.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: DARK }}>{dim.name}</span>
                  </div>
                  <p style={{ fontSize: 12, color: BODY, lineHeight: 1.6, marginBottom: 10 }}>{dim.description}</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: col.bg }}>{score.toFixed(1)}</p>
                  <p style={{ fontSize: 11, color: col.bg, fontWeight: 600 }}>{gapLabel}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Strengths */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '22px 24px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: DARK, marginBottom: 8 }}>{t.strengthsTitle}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {strengths.map(({ dim, score }) => {
                const col = scoreColour(score)
                return (
                  <span key={dim.id} style={{ fontSize: 13, fontWeight: 600, padding: '5px 14px', borderRadius: 100, background: col.pastelBg, color: col.bg, border: `1px solid ${col.bg}33` }}>
                    {dim.icon} {dim.name} · {score.toFixed(1)}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Email results ── */}
        <EmailResultsCard lang={lang} avg={avg} scoreLabel={scoreLabel} dimScores={dimScores} dimensions={DIMENSIONS} t={t} />

        {/* ── Refer a colleague ── */}
        <ReferralCard lang={lang} t={t} />

        {/* ── Essense CTA ── */}
        <div style={{ background: GREEN_DARK, borderRadius: 28, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: GREEN, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: GREEN_DARK, fontSize: 36, fontWeight: 900 }}>e</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>{t.ctaTitle}</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>{t.ctaBody}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={essenseMailto} style={{ display: 'inline-block', background: `linear-gradient(135deg, ${GREEN}, #1DB865)`, color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 100, textDecoration: 'none' }}>
              {t.ctaBtn}
            </a>
            <Link href={assessHref} style={{ display: 'inline-block', padding: '14px 28px', borderRadius: 100, border: `2px solid ${GREEN}44`, background: 'transparent', fontWeight: 600, fontSize: 14, color: GREEN, textDecoration: 'none' }}>
              {t.retakeBtn}
            </Link>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>{t.ctaCaption}</p>
        </div>

      </div>
    </div>
  )
}

// ── Email results card ────────────────────────────────────────────────────────
function EmailResultsCard({ lang, avg, scoreLabel, dimScores, dimensions, t }: {
  lang: 'en' | 'nl'
  avg: number
  scoreLabel: string
  dimScores: Record<string, number>
  dimensions: { id: string; name: string; icon: string }[]
  t: typeof T['en']
}) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState<'idle'|'sending'|'sent'|'error'>('idle')
  const [errMsg,  setErrMsg]  = useState('')

  const handleSend = async () => {
    if (!email.includes('@')) { setErrMsg(t.emailInvalid); return }
    setErrMsg('')
    setStatus('sending')
    try {
      const res = await fetch('/api/cx_essense/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, lang, avg, scoreLabel, dimScores, dimensions }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: 24, padding: '28px 28px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📩</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: DARK, marginBottom: 4 }}>{t.emailTitle}</p>
          <p style={{ fontSize: 13, color: BODY, lineHeight: 1.6, marginBottom: 16 }}>{t.emailBody}</p>

          {status === 'sent' ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 100, background: GREEN_LIGHT, color: GREEN_DARK, fontSize: 13, fontWeight: 700 }}>
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
                  style={{ flex: '1 1 140px', padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, color: DARK, outline: 'none', background: '#F8FAFC' }}
                />
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrMsg('') }}
                  style={{ flex: '2 1 180px', padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${errMsg ? '#E05A7A' : '#E2E8F0'}`, fontSize: 13, color: DARK, outline: 'none', background: '#F8FAFC' }}
                />
                <button
                  onClick={handleSend}
                  disabled={status === 'sending'}
                  style={{
                    padding: '9px 20px', borderRadius: 100,
                    background: status === 'sending' ? '#E2E8F0' : GREEN_DARK,
                    color: status === 'sending' ? MUTED : '#fff',
                    fontSize: 13, fontWeight: 700, border: 'none',
                    cursor: status === 'sending' ? 'not-allowed' : 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                >
                  {status === 'sending' ? t.emailSending : t.emailBtn}
                </button>
              </div>
              {errMsg  && <p style={{ fontSize: 12, color: '#E05A7A', margin: 0 }}>{errMsg}</p>}
              {status === 'error' && <p style={{ fontSize: 12, color: '#E05A7A', margin: 0 }}>{t.emailError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Referral card ─────────────────────────────────────────────────────────────
function ReferralCard({ lang, t }: { lang: 'en' | 'nl'; t: typeof T['en'] }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/cx_essense`
    : 'https://aiquiz.brandpwrdmedia.nl/cx_essense'

  const emailSubject = lang === 'nl' ? 'Doe%20ook%20het%20CX%20Volwassenheidsassessment' : 'Take%20the%20CX%20Maturity%20Assessment'
  const emailBody    = lang === 'nl'
    ? `Hoi%2C%0A%0AIk%20deed%20het%20CX%20assessment%20van%20Essense%20en%20vond%20het%20erg%20nuttig.%20Misschien%20ook%20interessant%20voor%20jou%3F%0A%0A${encodeURIComponent(url)}`
    : `Hi%2C%0A%0AI%20completed%20a%20CX%20Maturity%20Assessment%20by%20Essense%20and%20found%20it%20genuinely%20useful.%20Thought%20it%20might%20be%20relevant%20for%20you%20too.%0A%0A${encodeURIComponent(url)}`

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ background: '#fff', borderRadius: 24, padding: '28px 28px', border: '1px solid #EEF2F7', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🤝</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: DARK, marginBottom: 4 }}>{t.referTitle}</p>
          <p style={{ fontSize: 13, color: BODY, lineHeight: 1.6, marginBottom: 16 }}>{t.referBody}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a
              href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 100, background: GREEN_DARK, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
            >
              ✉️ {t.referEmail}
            </a>
            <button
              onClick={copy}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 100,
                background: copied ? GREEN_LIGHT : '#F1F5F9',
                border: `1.5px solid ${copied ? GREEN : '#E2E8F0'}`,
                color: copied ? GREEN_DARK : BODY,
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

// ── Page export ───────────────────────────────────────────────────────────────
export default function CxEssenseResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#FAFBFD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid #24CF7A`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <CxEssenseResultsInner />
    </Suspense>
  )
}
