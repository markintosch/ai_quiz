'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MARKETS, ROLES, DIMENSIONS, QUESTIONS,
  DUMMY_SCORES, scoreColour, overallScore,
} from '@/products/oncology/data'
import RadarChart from '@/components/oncology/RadarChart'

type Step = 'select' | 'assess' | 'results'

export default function OncologyAssessPage() {
  const [step, setStep] = useState<Step>('select')
  const [marketId, setMarketId] = useState('')
  const [roleId, setRoleId]   = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [activeDim, setActiveDim] = useState(0)

  // ── Step 1: select ──────────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-lg">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: '#C8006E' }}>STEP 1 OF 3</p>
            <h1 className="text-3xl font-black mb-2" style={{ color: '#1F2970' }}>Select market &amp; role</h1>
            <p className="text-gray-500 mb-8">
              Choose the market you&apos;re assessing and your role. Different roles provide different perspectives.
            </p>

            <label className="block mb-2 text-sm font-semibold text-gray-700">Market</label>
            <select
              value={marketId}
              onChange={e => setMarketId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 mb-5 bg-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#C8006E' } as React.CSSProperties}
            >
              <option value="">Select a market…</option>
              {MARKETS.map(m => (
                <option key={m.id} value={m.id}>{m.flag} {m.name}</option>
              ))}
            </select>

            <label className="block mb-2 text-sm font-semibold text-gray-700">Your role</label>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoleId(r.id)}
                  className="text-left p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: roleId === r.id ? '#C8006E' : '#E5E7EB',
                    background: roleId === r.id ? 'rgba(200,0,110,0.05)' : '#fff',
                  }}
                >
                  <p className="font-semibold text-sm text-gray-800">{r.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{r.description}</p>
                </button>
              ))}
            </div>

            <button
              disabled={!marketId || !roleId}
              onClick={() => setStep('assess')}
              className="w-full text-white font-bold py-4 rounded-full text-base transition-opacity disabled:opacity-40"
              style={{ background: '#C8006E' }}
            >
              Start Assessment →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2: assess ──────────────────────────────────────────────────────
  if (step === 'assess') {
    const dim = DIMENSIONS[activeDim]
    const dimQuestions = QUESTIONS.filter(q => q.dimensionId === dim.id)
    const dimAnswered = dimQuestions.every(q => answers[q.id] !== undefined)
    const totalAnswered = Object.keys(answers).length
    const progress = Math.round((totalAnswered / QUESTIONS.length) * 100)

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200">
          <div className="h-1.5 transition-all" style={{ width: `${progress}%`, background: '#C8006E' }} />
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">

          {/* Dimension tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {DIMENSIONS.map((d, i) => {
              const dimQs = QUESTIONS.filter(q => q.dimensionId === d.id)
              const done = dimQs.every(q => answers[q.id] !== undefined)
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDim(i)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                  style={{
                    background: activeDim === i ? '#1F2970' : done ? 'rgba(16,185,129,0.1)' : '#fff',
                    color: activeDim === i ? '#fff' : done ? '#059669' : '#6B7280',
                    borderColor: activeDim === i ? '#1F2970' : done ? '#10B981' : '#E5E7EB',
                  }}
                >
                  {done && activeDim !== i ? '✓ ' : ''}{d.short}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C8006E' }}>
              DIMENSION {activeDim + 1} / {DIMENSIONS.length}
            </span>
          </div>
          <h2 className="text-2xl font-black mb-1" style={{ color: '#1F2970' }}>{dim.name}</h2>
          <p className="text-gray-400 text-sm mb-8">{dim.description}</p>

          <div className="space-y-6">
            {dimQuestions.map((q, qi) => {
              const selected = answers[q.id]
              return (
                <div key={q.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <p className="font-semibold text-gray-800 mb-1 leading-snug">{q.text}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>{q.lowAnchor}</span>
                    <span className="text-right">{q.highAnchor}</span>
                  </div>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4].map(v => {
                      const col = scoreColour(v)
                      const isSelected = selected === v
                      return (
                        <button
                          key={v}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: v }))}
                          className="flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2"
                          style={{
                            background: isSelected ? col.bg : '#F9FAFB',
                            color: isSelected ? '#fff' : '#9CA3AF',
                            borderColor: isSelected ? col.bg : '#E5E7EB',
                          }}
                        >
                          {v}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-xs mt-1.5 text-gray-400">
                    <span>Critical</span><span>Emerging</span><span>Developing</span><span>Ready</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-4 mt-8">
            {activeDim > 0 && (
              <button
                onClick={() => setActiveDim(a => a - 1)}
                className="flex-1 py-3 rounded-full font-semibold text-sm border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
              >
                ← Previous
              </button>
            )}
            {activeDim < DIMENSIONS.length - 1 ? (
              <button
                disabled={!dimAnswered}
                onClick={() => setActiveDim(a => a + 1)}
                className="flex-1 py-3 rounded-full font-bold text-sm text-white transition-opacity disabled:opacity-40"
                style={{ background: '#1F2970' }}
              >
                Next dimension →
              </button>
            ) : (
              <button
                disabled={totalAnswered < QUESTIONS.length}
                onClick={() => setStep('results')}
                className="flex-1 py-3 rounded-full font-bold text-sm text-white transition-opacity disabled:opacity-40"
                style={{ background: '#C8006E' }}
              >
                {totalAnswered < QUESTIONS.length
                  ? `${QUESTIONS.length - totalAnswered} questions remaining`
                  : 'See my results →'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Step 3: results ─────────────────────────────────────────────────────
  const dimScores: Record<string, number> = {}
  DIMENSIONS.forEach(d => {
    const qs = QUESTIONS.filter(q => q.dimensionId === d.id)
    const vals = qs.map(q => answers[q.id] ?? 0).filter(Boolean)
    dimScores[d.id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  })
  const avg = overallScore(dimScores)
  const overallCol = scoreColour(avg)
  const market = MARKETS.find(m => m.id === marketId)!
  const role = ROLES.find(r => r.id === roleId)!
  const baseline = DUMMY_SCORES[marketId]

  // Top gaps
  const gaps = DIMENSIONS
    .map(d => ({ dim: d, score: dimScores[d.id] ?? 0 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)

  // Save to localStorage
  if (typeof window !== 'undefined') {
    const key = `oncology:${marketId}:${roleId}`
    localStorage.setItem(key, JSON.stringify({ dimScores, timestamp: Date.now() }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: '#C8006E' }}>ASSESSMENT RESULTS</p>
          <h1 className="text-3xl font-black" style={{ color: '#1F2970' }}>
            {market.flag} {market.name} — {role.label}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">

          {/* Radar */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
            <p className="text-sm font-semibold text-gray-500 mb-4">Readiness Profile</p>
            <RadarChart scores={dimScores} size={280} secondaryScores={baseline} />
            <div className="flex gap-4 text-xs mt-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 block" style={{ background: '#C8006E' }} /> Your assessment
              </span>
              {baseline && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 block border border-pink-300 border-dashed" /> Baseline
                </span>
              )}
            </div>
          </div>

          {/* Scores */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-semibold text-gray-500">Overall readiness</p>
              <span
                className="text-xl font-black px-4 py-1.5 rounded-full"
                style={{ background: overallCol.bg, color: overallCol.text }}
              >
                {avg.toFixed(1)} — {overallCol.label}
              </span>
            </div>
            <div className="space-y-3">
              {DIMENSIONS.map(d => {
                const s = dimScores[d.id] ?? 0
                const col = scoreColour(s)
                const bar = ((s - 1) / 3) * 100
                return (
                  <div key={d.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{d.name}</span>
                      <span className="font-bold" style={{ color: col.bg }}>{s.toFixed(1)} {col.label}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${bar}%`, background: col.bg }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top gaps */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="text-lg font-black mb-4" style={{ color: '#1F2970' }}>Top 3 Priority Gaps</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {gaps.map(({ dim, score }, i) => {
              const col = scoreColour(score)
              return (
                <div key={dim.id} className="p-4 rounded-xl border" style={{ borderColor: col.bg + '44', background: col.bg + '0A' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black"
                      style={{ background: col.bg }}
                    >
                      {i + 1}
                    </span>
                    <span className="font-bold text-sm text-gray-800">{dim.short}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{dim.description}</p>
                  <p className="text-lg font-black mt-2" style={{ color: col.bg }}>{score.toFixed(1)}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/oncology/dashboard?market=${marketId}`}
            className="flex-1 text-center font-bold py-4 rounded-full text-white transition-opacity hover:opacity-90"
            style={{ background: '#1F2970' }}
          >
            View in Dashboard →
          </Link>
          <button
            onClick={() => { setStep('select'); setAnswers({}); setActiveDim(0) }}
            className="flex-1 py-4 rounded-full font-bold border-2 text-gray-500 hover:border-gray-400 transition-colors"
            style={{ borderColor: '#E5E7EB' }}
          >
            Assess another market
          </button>
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/oncology" className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ background: '#1F2970' }} />
          <span className="text-xs font-bold tracking-wide text-gray-600">KIRK &amp; BLACKBEARD</span>
        </Link>
        <Link href="/oncology/dashboard" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          Dashboard
        </Link>
      </div>
    </nav>
  )
}
