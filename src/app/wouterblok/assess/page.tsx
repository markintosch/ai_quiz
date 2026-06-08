'use client'

import { Suspense, useState, type CSSProperties } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getContent, PILLAR_ORDER, normaliseLocale } from '@/products/wouterblok/data'

// ── Brand tokens (emerald / navy) ────────────────────────────────────────────
const ACCENT      = '#0E9F6E'
const ACCENT_DEEP = '#076B46'
const NAVY        = '#0C2B3A'
const PRIMARY     = '#111827'
const MUTED       = '#6B7280'
const BORDER      = '#E5E7EB'
const BG_GRAY     = '#F5F8F6'
const FONT        = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

type Step = 'role' | 'stage' | 'scan' | 'lead'

const T = {
  en: {
    sub: 'Growth Flywheel Scan', back: '← Back',
    roleStep: 'Step 1 of 3', stageStep: 'Step 2 of 3',
    nextRole: 'Continue →', nextStage: 'Start the 16 statements →',
    pillarOf: (a: number, b: number) => `Pillar ${a} of ${b}`,
    prev: '← Previous', next: 'Next pillar →', see: 'See my result →',
    remaining: (n: number) => `${n} statement${n !== 1 ? 's' : ''} left`,
    leadBadge: 'Last step', leadTitle: 'Where should we send your result?',
    leadIntro: 'Your full breakdown opens on the next screen. We also email you a copy you can forward to your team.',
    name: 'Your name', email: 'Work email', company: 'Company',
    gdpr: 'I agree my answers and contact details may be stored to deliver and discuss my result.',
    marketing: 'Send me the occasional growth insight from Wouter. (optional)',
    submit: 'See my result →', submitting: 'Calculating…',
    errGeneric: 'Something went wrong. Please try again.',
    privacy: 'No spam. You can unsubscribe at any time.',
  },
  nl: {
    sub: 'Growth Flywheel Scan', back: '← Terug',
    roleStep: 'Stap 1 van 3', stageStep: 'Stap 2 van 3',
    nextRole: 'Verder →', nextStage: 'Start de 16 stellingen →',
    pillarOf: (a: number, b: number) => `Pijler ${a} van ${b}`,
    prev: '← Vorige', next: 'Volgende pijler →', see: 'Bekijk mijn resultaat →',
    remaining: (n: number) => `Nog ${n} stelling${n !== 1 ? 'en' : ''}`,
    leadBadge: 'Laatste stap', leadTitle: 'Waar mogen we je resultaat heen sturen?',
    leadIntro: 'Je volledige analyse opent op het volgende scherm. We mailen je ook een kopie die je met je team kunt delen.',
    name: 'Je naam', email: 'Werk-e-mail', company: 'Bedrijf',
    gdpr: 'Ik ga ermee akkoord dat mijn antwoorden en contactgegevens worden bewaard om mijn resultaat te leveren en te bespreken.',
    marketing: 'Stuur me af en toe een groei-inzicht van Wouter. (optioneel)',
    submit: 'Bekijk mijn resultaat →', submitting: 'Berekenen…',
    errGeneric: 'Er ging iets mis. Probeer het opnieuw.',
    privacy: 'Geen spam. Je kunt je altijd uitschrijven.',
  },
  de: {
    sub: 'Growth Flywheel Scan', back: '← Zurück',
    roleStep: 'Schritt 1 von 3', stageStep: 'Schritt 2 von 3',
    nextRole: 'Weiter →', nextStage: 'Die 16 Aussagen starten →',
    pillarOf: (a: number, b: number) => `Säule ${a} von ${b}`,
    prev: '← Zurück', next: 'Nächste Säule →', see: 'Mein Ergebnis ansehen →',
    remaining: (n: number) => `Noch ${n} Aussage${n !== 1 ? 'n' : ''}`,
    leadBadge: 'Letzter Schritt', leadTitle: 'Wohin sollen wir dein Ergebnis schicken?',
    leadIntro: 'Deine vollständige Auswertung öffnet sich im nächsten Schritt. Wir mailen dir auch eine Kopie für dein Team.',
    name: 'Dein Name', email: 'Geschäftliche E-Mail', company: 'Unternehmen',
    gdpr: 'Ich bin einverstanden, dass meine Antworten und Kontaktdaten gespeichert werden, um mein Ergebnis zu liefern und zu besprechen.',
    marketing: 'Schick mir gelegentlich einen Growth-Impuls von Wouter. (optional)',
    submit: 'Mein Ergebnis ansehen →', submitting: 'Wird berechnet…',
    errGeneric: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
    privacy: 'Kein Spam. Du kannst dich jederzeit abmelden.',
  },
}

function Header({ backHref, t }: { backHref: string; t: typeof T['en'] }) {
  return (
    <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, height: 60, display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: NAVY, lineHeight: 1.2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>WOUTER BLOK</p>
          <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.2 }}>{t.sub}</p>
        </div>
        <Link href={backHref} style={{ fontSize: 13, color: MUTED, textDecoration: 'none', fontWeight: 500 }}>{t.back}</Link>
      </div>
    </nav>
  )
}

// ── A single-select profiling step (role or stage) ───────────────────────────
function ProfilingStep({
  badge, question, options, value, onSelect, onNext, nextLabel, backHref, t,
}: {
  badge: string; question: string; options: { id: string; label: string }[]
  value: string; onSelect: (id: string) => void; onNext: () => void; nextLabel: string
  backHref: string; t: typeof T['en']
}) {
  return (
    <div style={{ minHeight: '100vh', background: BG_GRAY, fontFamily: FONT }}>
      <Header backHref={backHref} t={t} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 540 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: ACCENT_DEEP, border: `1px solid ${ACCENT}44`,
            padding: '3px 12px', borderRadius: 4, marginBottom: 20,
          }}>{badge}</span>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: NAVY, marginBottom: 24, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{question}</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {options.map(o => (
              <button key={o.id} onClick={() => onSelect(o.id)} style={{
                textAlign: 'left', padding: '16px 18px', borderRadius: 8,
                border: `2px solid ${value === o.id ? ACCENT : BORDER}`,
                background: value === o.id ? '#EAF7F1' : '#fff', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: value === o.id ? ACCENT_DEEP : PRIMARY }}>{o.label}</p>
              </button>
            ))}
          </div>
          <button disabled={!value} onClick={onNext} style={{
            width: '100%', padding: '14px 24px', borderRadius: 6,
            background: value ? ACCENT : BORDER, color: value ? '#fff' : MUTED,
            fontWeight: 700, fontSize: 15, border: 'none', cursor: value ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
          }}>{nextLabel}</button>
        </div>
      </div>
    </div>
  )
}

function AssessInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const lang         = normaliseLocale(searchParams.get('lang'))
  const t            = T[lang]
  const backHref     = `/wouterblok?lang=${lang}`
  const { pillars, statements, roles, stages, scale, labels } = getContent(lang)

  const [step, setStep]               = useState<Step>('role')
  const [role, setRole]               = useState<string>('')
  const [stage, setStage]             = useState<string>('')
  const [answers, setAnswers]         = useState<Record<string, number>>({})
  const [activePillar, setActivePillar] = useState(0)

  // Lead capture (final step)
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [company, setCompany]     = useState('')
  const [gdpr, setGdpr]           = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  const submitLead = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/wouterblok/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers, role, stage, lang,
          lead: { name, email, company, gdprConsent: gdpr, marketingConsent: marketing },
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t.errGeneric); setSubmitting(false); return }
      router.push(`/wouterblok/results?id=${data.responseId}&lang=${lang}`)
    } catch {
      setError(t.errGeneric)
      setSubmitting(false)
    }
  }

  if (step === 'role') {
    return <ProfilingStep badge={t.roleStep} question={labels.roleQuestion} options={roles}
      value={role} onSelect={setRole} onNext={() => setStep('stage')} nextLabel={t.nextRole} backHref={backHref} t={t} />
  }
  if (step === 'stage') {
    return <ProfilingStep badge={t.stageStep} question={labels.stageQuestion} options={stages}
      value={stage} onSelect={setStage} onNext={() => setStep('scan')} nextLabel={t.nextStage} backHref={backHref} t={t} />
  }

  if (step === 'lead') {
    const inputStyle: CSSProperties = {
      width: '100%', padding: '12px 14px', borderRadius: 8, border: `1.5px solid ${BORDER}`,
      fontSize: 15, color: PRIMARY, fontFamily: FONT, outline: 'none', boxSizing: 'border-box',
    }
    const valid = name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && gdpr
    return (
      <div style={{ minHeight: '100vh', background: BG_GRAY, fontFamily: FONT }}>
        <Header backHref={backHref} t={t} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: 480 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: ACCENT_DEEP, border: `1px solid ${ACCENT}44`,
              padding: '3px 12px', borderRadius: 4, marginBottom: 18,
            }}>{t.leadBadge}</span>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: NAVY, marginBottom: 10, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{t.leadTitle}</h1>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>{t.leadIntro}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input style={inputStyle} placeholder={t.name} value={name} onChange={e => setName(e.target.value)} />
              <input style={inputStyle} type="email" placeholder={t.email} value={email} onChange={e => setEmail(e.target.value)} />
              <input style={inputStyle} placeholder={t.company} value={company} onChange={e => setCompany(e.target.value)} />

              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 13, color: PRIMARY, lineHeight: 1.5 }}>
                <input type="checkbox" checked={gdpr} onChange={e => setGdpr(e.target.checked)} style={{ marginTop: 3, accentColor: ACCENT, width: 16, height: 16, flexShrink: 0 }} />
                <span>{t.gdpr}</span>
              </label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} style={{ marginTop: 3, accentColor: ACCENT, width: 16, height: 16, flexShrink: 0 }} />
                <span>{t.marketing}</span>
              </label>
            </div>

            {error && <p style={{ color: '#B91C1C', fontSize: 13, marginTop: 14 }}>{error}</p>}

            <button disabled={!valid || submitting} onClick={submitLead} style={{
              width: '100%', marginTop: 22, padding: '14px 24px', borderRadius: 6,
              background: valid && !submitting ? ACCENT : BORDER, color: valid && !submitting ? '#fff' : MUTED,
              fontWeight: 700, fontSize: 15, border: 'none',
              cursor: valid && !submitting ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
            }}>{submitting ? t.submitting : t.submit}</button>

            <p style={{ fontSize: 12, color: MUTED, marginTop: 14, textAlign: 'center' }}>{t.privacy}</p>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: diagnostic statements, grouped by pillar (2 each)
  const pillar         = pillars[activePillar]
  const pillarStmts    = statements.filter(s => s.pillarId === pillar.id)
  const pillarAnswered = pillarStmts.every(s => answers[s.id] !== undefined)
  const totalAnswered  = Object.keys(answers).length
  const totalStmts     = statements.length
  const progress       = Math.round((totalAnswered / totalStmts) * 100)
  const isLast         = activePillar === PILLAR_ORDER.length - 1

  return (
    <div style={{ minHeight: '100vh', background: BG_GRAY, fontFamily: FONT }}>
      <Header backHref={backHref} t={t} />
      <div style={{ height: 3, background: BORDER }}>
        <div style={{ height: 3, transition: 'width 0.4s ease', width: `${progress}%`, background: ACCENT }} />
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Pillar tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
          {pillars.map((p, i) => {
            const done = statements.filter(s => s.pillarId === p.id).every(s => answers[s.id] !== undefined)
            return (
              <button key={p.id} onClick={() => setActivePillar(i)} style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700,
                border: `1.5px solid ${activePillar === i ? ACCENT : done ? `${ACCENT}44` : BORDER}`,
                background: activePillar === i ? ACCENT : done ? '#EAF7F1' : '#fff',
                color: activePillar === i ? '#fff' : done ? ACCENT_DEEP : MUTED,
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>{done && activePillar !== i ? '✓ ' : ''}{p.name}</button>
            )
          })}
        </div>

        {/* Pillar header */}
        <div style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: ACCENT_DEEP, border: `1px solid ${ACCENT}44`,
            padding: '3px 12px', borderRadius: 4, marginBottom: 12,
          }}>{t.pillarOf(activePillar + 1, PILLAR_ORDER.length)}</span>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 6, letterSpacing: '-0.01em' }}>{pillar.icon} {pillar.name}</h2>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, maxWidth: 600 }}>{pillar.blurb}</p>
        </div>

        {/* Statements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pillarStmts.map(s => {
            const selected = answers[s.id]
            return (
              <div key={s.id} style={{ background: '#fff', borderRadius: 10, padding: '24px 22px', border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 15, fontWeight: 500, color: PRIMARY, marginBottom: 16, lineHeight: 1.6 }}>{s.text}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[0, 1, 2, 3].map(v => {
                    const isSel = selected === v
                    return (
                      <button key={v} onClick={() => setAnswers(prev => ({ ...prev, [s.id]: v }))} style={{
                        flex: 1, padding: '10px 6px', borderRadius: 6, fontWeight: 600, fontSize: 12, lineHeight: 1.3,
                        border: `2px solid ${isSel ? ACCENT : BORDER}`,
                        background: isSel ? ACCENT : BG_GRAY, color: isSel ? '#fff' : MUTED,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>{scale[v]}</button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {activePillar > 0 && (
            <button onClick={() => setActivePillar(a => a - 1)} style={{
              flex: 1, padding: '13px 24px', borderRadius: 6, border: `1.5px solid ${BORDER}`,
              background: '#fff', fontWeight: 600, fontSize: 14, color: PRIMARY, cursor: 'pointer',
            }}>{t.prev}</button>
          )}
          {!isLast ? (
            <button disabled={!pillarAnswered} onClick={() => setActivePillar(a => a + 1)} style={{
              flex: 1, padding: '13px 24px', borderRadius: 6,
              background: pillarAnswered ? 'transparent' : BORDER, color: pillarAnswered ? ACCENT_DEEP : MUTED,
              border: `2px solid ${pillarAnswered ? ACCENT : BORDER}`, fontWeight: 700, fontSize: 14,
              cursor: pillarAnswered ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
            }}>{t.next}</button>
          ) : (
            <button disabled={totalAnswered < totalStmts} onClick={() => setStep('lead')} style={{
              flex: 1, padding: '13px 24px', borderRadius: 6,
              background: totalAnswered >= totalStmts ? ACCENT : BORDER, color: totalAnswered >= totalStmts ? '#fff' : MUTED,
              border: 'none', fontWeight: 700, fontSize: 14,
              cursor: totalAnswered >= totalStmts ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
            }}>{totalAnswered < totalStmts ? t.remaining(totalStmts - totalAnswered) : t.see}</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WouterblokAssessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: BG_GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${ACCENT}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <AssessInner />
    </Suspense>
  )
}
