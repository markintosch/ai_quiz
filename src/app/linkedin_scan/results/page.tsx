'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getProfileContent, getTier, TIER_META, type DimensionId } from '@/products/linkedin_scan/data'

type Lang = 'nl' | 'en'

const BRAND   = '#0F7B55'
const BRAND_D = '#085C3E'

const T = {
  nl: {
    heading: 'Jouw LinkedIn Recruiter Score',
    overallLabel: 'Totaalscore',
    tierLabel: 'Niveau',
    dimensionsTitle: 'Score per dimensie',
    topGapsTitle: 'Jouw top-3 aandachtspunten',
    gapBody: (name: string) => `Focus op ${name} — hier is de meeste winst te behalen.`,
    saveTitle: 'Ontvang jouw scorekaart per e-mail',
    saveSub: 'Vul je naam en e-mailadres in om jouw volledige resultaat in je inbox te krijgen.',
    namePlaceholder: 'Jouw naam', emailPlaceholder: 'Jouw e-mailadres',
    submitBtn: 'Verstuur mijn scorekaart →', submittingBtn: 'Versturen…', doneBtn: 'Verzonden ✓',
    tryAgain: 'Opnieuw doen →',
    navRole: 'LinkedIn Recruiter Scan · e-people',
  },
  en: {
    heading: 'Your LinkedIn Recruiter Score',
    overallLabel: 'Overall score',
    tierLabel: 'Level',
    dimensionsTitle: 'Score per dimension',
    topGapsTitle: 'Your top-3 focus areas',
    gapBody: (name: string) => `Focus on ${name} — this is where you can gain the most.`,
    saveTitle: 'Receive your scorecard by email',
    saveSub: 'Enter your name and email address to get your full results in your inbox.',
    namePlaceholder: 'Your name', emailPlaceholder: 'Your email address',
    submitBtn: 'Send my scorecard →', submittingBtn: 'Sending…', doneBtn: 'Sent ✓',
    tryAgain: 'Try again →',
    navRole: 'LinkedIn Recruiter Scan · e-people',
  },
}

function scoreToWidth(score: number) { return `${Math.round(score)}%` }

function scoreColor(score: number) {
  if (score >= 75) return BRAND
  if (score >= 50) return '#16A34A'
  if (score >= 30) return '#F59E0B'
  return '#EF4444'
}

function ResultsInner() {
  const searchParams = useSearchParams()
  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en'].includes(rawLang) ? rawLang : 'nl') as Lang
  const role  = searchParams.get('role') ?? ''
  const t = T[lang]
  const { DIMENSIONS } = getProfileContent(lang)

  // Decode scores
  let dimScoresRaw: Record<string, number> = {}
  try {
    const d = searchParams.get('d')
    if (d) dimScoresRaw = JSON.parse(atob(decodeURIComponent(d)))
  } catch { /* ignore */ }

  const dimScores = DIMENSIONS.map(dim => {
    const avg = dimScoresRaw[dim.id] ?? 1
    const score100 = Math.round((avg / 4) * 100)
    return { ...dim, score: score100 }
  })

  const overall = Math.round(dimScores.reduce((s, d) => s + d.score, 0) / dimScores.length)
  const tier    = getTier(overall)
  const tierMeta = TIER_META[tier]

  // Top-3 gaps = 3 lowest-scoring dimensions
  const topGaps = [...dimScores].sort((a, b) => a.score - b.score).slice(0, 3)

  // Email save form
  const [name, setName]    = useState('')
  const [email, setEmail]  = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setStatus('sending')
    try {
      await fetch('/api/linkedin_scan/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), overall, dimScores, role, lang }),
      })
      setStatus('done')
    } catch {
      setStatus('done') // still show done — fire and forget
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F2FAF6', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #D8F0E6', height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/linkedin_scan" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>BW</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0D2B20', lineHeight: 1.2, margin: 0 }}>Bas Westland</p>
              <p style={{ fontSize: 11, color: '#4D7A66', lineHeight: 1.2, margin: 0 }}>{t.navRole}</p>
            </div>
          </Link>
          <Link href={`/linkedin_scan/assess?lang=${lang}`} style={{ fontSize: 13, color: BRAND, fontWeight: 700, textDecoration: 'none' }}>{t.tryAgain}</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Hero score */}
        <div style={{ background: BRAND, borderRadius: 20, padding: '40px 36px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{t.heading}</p>
            <h1 style={{ fontSize: 'clamp(56px,10vw,80px)', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 8 }}>{overall}</h1>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 100, padding: '5px 14px' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{lang === 'nl' ? tierMeta.labelNl : tierMeta.label}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 240 }}>
              {lang === 'nl' ? tierMeta.descriptionNl : tierMeta.description}
            </div>
          </div>
        </div>

        {/* Dimension scores */}
        <div style={{ background: '#fff', border: '1px solid #D8F0E6', borderRadius: 16, padding: '24px 24px', marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0D2B20', marginBottom: 20 }}>{t.dimensionsTitle}</h3>
          {dimScores.map(dim => (
            <div key={dim.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0D2B20' }}>{dim.icon} {dim.name}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor(dim.score), fontFamily: 'monospace' }}>{dim.score}</span>
              </div>
              <div style={{ height: 8, background: '#F2FAF6', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: scoreToWidth(dim.score), background: scoreColor(dim.score), borderRadius: 100, transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#4D7A66' }}>
                <span>{dim.lowLabel}</span>
                <span>{dim.highLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top gaps */}
        <div style={{ background: '#fff', border: '1px solid #D8F0E6', borderRadius: 16, padding: '24px 24px', marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0D2B20', marginBottom: 16 }}>🎯 {t.topGapsTitle}</h3>
          {topGaps.map((gap, i) => (
            <div key={gap.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < 2 ? '1px solid #F2FAF6' : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F2FAF6', border: `1px solid #D8F0E6`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 800, color: BRAND }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0D2B20', margin: '0 0 3px' }}>{gap.icon} {gap.name}</p>
                <p style={{ fontSize: 13, color: '#4D7A66', margin: 0, lineHeight: 1.5 }}>
                  {lang === 'nl' ? gap.description : gap.description} <span style={{ color: scoreColor(gap.score), fontWeight: 700, fontFamily: 'monospace' }}>{gap.score}/100</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Email save */}
        <div style={{ background: '#fff', border: '1px solid #D8F0E6', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND}, #4AA07F)` }} />
          <div style={{ padding: '24px 24px' }}>
            {status === 'done' ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#0D2B20', marginBottom: 6 }}>{lang === 'nl' ? 'Scorekaart verstuurd!' : 'Scorecard sent!'}</p>
                <p style={{ fontSize: 14, color: '#4D7A66', marginBottom: 20 }}>{lang === 'nl' ? 'Check je inbox. Je kunt ook opnieuw de scan doen.' : 'Check your inbox. You can also retake the scan.'}</p>
                <Link href={`/linkedin_scan/assess?lang=${lang}`} style={{ display: 'inline-block', background: BRAND, color: '#fff', fontSize: 14, fontWeight: 700, padding: '12px 28px', borderRadius: 100, textDecoration: 'none' }}>{t.tryAgain}</Link>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0D2B20', marginBottom: 6 }}>{t.saveTitle}</h3>
                <p style={{ fontSize: 13, color: '#4D7A66', marginBottom: 20 }}>{t.saveSub}</p>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      required
                      style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #D8F0E6', fontSize: 14, color: '#0D2B20', outline: 'none', background: '#FAFAFA', fontFamily: 'inherit' }}
                    />
                    <input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      type="email"
                      required
                      style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #D8F0E6', fontSize: 14, color: '#0D2B20', outline: 'none', background: '#FAFAFA', fontFamily: 'inherit' }}
                    />
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      style={{ padding: '14px 24px', borderRadius: 8, background: BRAND, color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: status === 'sending' ? 'default' : 'pointer', opacity: status === 'sending' ? 0.7 : 1, transition: 'opacity 0.15s' }}
                    >
                      {status === 'sending' ? t.submittingBtn : t.submitBtn}
                    </button>
                  </div>
                </form>
                <p style={{ fontSize: 12, color: '#4D7A66', marginTop: 12 }}>
                  🔒 {lang === 'nl' ? 'Jouw gegevens worden niet gedeeld.' : 'Your data is not shared.'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* About Bas */}
        <div style={{ marginTop: 24, background: '#fff', border: '1px solid #D8F0E6', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 800, color: '#fff' }}>BW</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0D2B20', margin: '0 0 2px' }}>Bas Westland</p>
            <p style={{ fontSize: 12, color: '#4D7A66', margin: '0 0 6px' }}>Trainer · Speaker · Recruiter · e-people</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://www.baswestland.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: BRAND, fontWeight: 600, textDecoration: 'none' }}>baswestland.com</a>
              <a href="https://www.linkedin.com/in/baswestland" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: BRAND, fontWeight: 600, textDecoration: 'none' }}>LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LinkedInScanResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F2FAF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #0F7B55', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <ResultsInner />
    </Suspense>
  )
}
