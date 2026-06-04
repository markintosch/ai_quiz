'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getContent, PILLAR_ORDER, normaliseLocale, type Locale, type RoleId, type StageId } from '@/products/wouterblok/data'

// ── Brand tokens (emerald / navy) ────────────────────────────────────────────
const ACCENT      = '#0E9F6E'
const ACCENT_DEEP = '#076B46'
const NAVY        = '#0C2B3A'
const PRIMARY     = '#111827'
const MUTED       = '#6B7280'
const BORDER      = '#E5E7EB'
const BG_GRAY     = '#F5F8F6'
const FONT        = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

type Step = 'role' | 'stage' | 'scan'

const T = {
  en: {
    sub: 'Growth Flywheel Scan', back: '← Back',
    roleStep: 'Step 1 of 3', stageStep: 'Step 2 of 3',
    nextRole: 'Continue →', nextStage: 'Start the 16 statements →',
    pillarOf: (a: number, b: number) => `Pillar ${a} of ${b}`,
    prev: '← Previous', next: 'Next pillar →', see: 'See my result →',
    remaining: (n: number) => `${n} statement${n !== 1 ? 's' : ''} left`,
  },
  nl: {
    sub: 'Growth Flywheel Scan', back: '← Terug',
    roleStep: 'Stap 1 van 3', stageStep: 'Stap 2 van 3',
    nextRole: 'Verder →', nextStage: 'Start de 16 stellingen →',
    pillarOf: (a: number, b: number) => `Pijler ${a} van ${b}`,
    prev: '← Vorige', next: 'Volgende pijler →', see: 'Bekijk mijn resultaat →',
    remaining: (n: number) => `Nog ${n} stelling${n !== 1 ? 'en' : ''}`,
  },
  de: {
    sub: 'Growth Flywheel Scan', back: '← Zurück',
    roleStep: 'Schritt 1 von 3', stageStep: 'Schritt 2 von 3',
    nextRole: 'Weiter →', nextStage: 'Die 16 Aussagen starten →',
    pillarOf: (a: number, b: number) => `Säule ${a} von ${b}`,
    prev: '← Zurück', next: 'Nächste Säule →', see: 'Mein Ergebnis ansehen →',
    remaining: (n: number) => `Noch ${n} Aussage${n !== 1 ? 'n' : ''}`,
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

  const goToResults = () => {
    const payload = btoa(JSON.stringify({ a: answers, r: role as RoleId, s: stage as StageId }))
    router.push(`/wouterblok/results?d=${encodeURIComponent(payload)}&lang=${lang}`)
  }

  if (step === 'role') {
    return <ProfilingStep badge={t.roleStep} question={labels.roleQuestion} options={roles}
      value={role} onSelect={setRole} onNext={() => setStep('stage')} nextLabel={t.nextRole} backHref={backHref} t={t} />
  }
  if (step === 'stage') {
    return <ProfilingStep badge={t.stageStep} question={labels.stageQuestion} options={stages}
      value={stage} onSelect={setStage} onNext={() => setStep('scan')} nextLabel={t.nextStage} backHref={backHref} t={t} />
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
            <button disabled={totalAnswered < totalStmts} onClick={goToResults} style={{
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
