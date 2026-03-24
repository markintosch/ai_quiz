'use client'

import Link from 'next/link'
import {
  MARKETS, DIMENSIONS, DUMMY_SCORES, SALES_DATA, QUARTER_KEYS,
  ROLES, scoreColour, overallScore,
} from '@/products/oncology/data'

// ── Mini sparkline (SVG, inline) ──────────────────────────────────────────
function Sparkline({ marketId }: { marketId: string }) {
  const vals = QUARTER_KEYS.map(k => SALES_DATA[marketId]?.[k] ?? 0)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const w = 72; const h = 28
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline points={pts} fill="none" stroke="#C8006E" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

// ── Heatmap ───────────────────────────────────────────────────────────────
function Heatmap({ clickable = false }: { clickable?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ minWidth: 680 }}>
        <thead>
          <tr style={{ background: '#1F2970' }}>
            <th className="text-left text-white/80 font-medium py-3 px-4 text-xs tracking-wider">MARKET</th>
            {DIMENSIONS.map(d => (
              <th key={d.id} className="text-center text-white/80 font-medium py-3 px-2 text-xs tracking-wider whitespace-nowrap">
                {d.short.toUpperCase()}
              </th>
            ))}
            <th className="text-center text-white/80 font-medium py-3 px-3 text-xs tracking-wider">OVERALL</th>
          </tr>
        </thead>
        <tbody>
          {MARKETS.map((m, mi) => {
            const scores = DUMMY_SCORES[m.id] ?? {}
            const avg = overallScore(scores)
            const avgCol = scoreColour(avg)
            return (
              <tr
                key={m.id}
                className={`border-b border-gray-100 ${clickable ? 'cursor-pointer hover:bg-blue-50/50 transition-colors' : ''}`}
                onClick={clickable ? () => window.location.href = `/oncology/dashboard?market=${m.id}` : undefined}
                style={{ background: mi % 2 === 0 ? '#fff' : '#F9FAFB' }}
              >
                <td className="py-2.5 px-4 font-medium text-gray-800 whitespace-nowrap">
                  <span className="mr-2">{m.flag}</span>{m.name}
                </td>
                {DIMENSIONS.map(d => {
                  const s = scores[d.id] ?? 0
                  const col = scoreColour(s)
                  return (
                    <td key={d.id} className="py-2.5 px-2 text-center">
                      <span
                        className="inline-block w-12 rounded text-xs font-bold py-0.5"
                        style={{ background: col.bg, color: col.text }}
                      >
                        {s.toFixed(1)}
                      </span>
                    </td>
                  )
                })}
                <td className="py-2.5 px-3 text-center">
                  <span
                    className="inline-block w-14 rounded text-xs font-bold py-0.5"
                    style={{ background: avgCol.bg, color: avgCol.text }}
                  >
                    {avg.toFixed(1)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function OncologyLandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded" style={{ background: '#1F2970' }} />
            <span className="font-bold text-sm tracking-wide" style={{ color: '#1F2970' }}>
              KIRK &amp; BLACKBEARD
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/oncology/dashboard" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Dashboard
            </Link>
            <Link
              href="/oncology/assess"
              className="text-sm font-semibold text-white px-5 py-2 rounded-full transition-opacity hover:opacity-90"
              style={{ background: '#C8006E' }}
            >
              Start Assessment
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #1F2970 0%, #0F1848 60%, #1A3060 100%)' }} className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-8"
            style={{ background: 'rgba(200,0,110,0.2)', color: '#FF6BB5', border: '1px solid rgba(200,0,110,0.4)' }}
          >
            European Oncology Diagnostics · GTM Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            How ready are your European markets<br />
            <span style={{ color: '#FF6BB5' }}>for the next wave in cancer diagnostics?</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            A structured assessment platform for oncology diagnostics leaders. Evaluate market readiness across six dimensions, validate your GTM strategy, and prioritise where to invest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/oncology/assess"
              className="text-white font-bold px-8 py-4 rounded-full text-base transition-opacity hover:opacity-90 shadow-lg"
              style={{ background: '#C8006E' }}
            >
              Start Full Assessment →
            </Link>
            <Link
              href="/oncology/dashboard"
              className="font-bold px-8 py-4 rounded-full text-base transition-colors border-2"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}
            >
              Explore European Overview
            </Link>
          </div>
          <p className="text-white/40 text-sm mt-6">10 minutes · 24 questions · No login required</p>
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────────────────────── */}
      <section style={{ background: '#F4F5FA' }} className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: '#C8006E' }}>
            WHAT THIS IS
          </p>
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: '#1F2970' }}>
            Assess. Analyse. Act.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Assess',
                body: 'Rate six market dimensions across your European territories. Capture perspectives from every commercial role — sales, medical, market access.',
              },
              {
                step: '02',
                title: 'Analyse',
                body: 'See where readiness meets revenue. Overlay quarterly sales data on your market scores and identify where conditions are holding back growth.',
              },
              {
                step: '03',
                title: 'Act',
                body: 'Generate tailored GTM playbooks based on each market\'s unique gap profile. Validate your planned strategy against actual readiness.',
              },
            ].map(card => (
              <div key={card.step} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                <div
                  className="text-xs font-black tracking-widest mb-4 w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ background: '#1F2970' }}
                >
                  {card.step}
                </div>
                <h3 className="text-xl font-black mb-2" style={{ color: '#1F2970' }}>{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Heatmap ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: '#C8006E' }}>
            EUROPEAN OVERVIEW
          </p>
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <h2 className="text-3xl font-black" style={{ color: '#1F2970' }}>
              Market Readiness Heatmap
            </h2>
            <div className="flex items-center gap-3 text-xs">
              {[
                { label: 'Ready', bg: '#10B981' },
                { label: 'Developing', bg: '#F59E0B' },
                { label: 'Early', bg: '#EF4444' },
                { label: 'Critical', bg: '#991B1B' },
              ].map(c => (
                <span key={c.label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: c.bg }} />
                  <span className="text-gray-500">{c.label}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <Heatmap clickable />
          </div>
          <p className="text-xs text-gray-400 mt-3">Populated with illustrative dummy data. Click a row to explore that market in the dashboard.</p>
        </div>
      </section>

      {/* ── Country cards ────────────────────────────────────────────────── */}
      <section style={{ background: '#F4F5FA' }} className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: '#C8006E' }}>
            EXPLORE BY MARKET
          </p>
          <h2 className="text-3xl font-black mb-8" style={{ color: '#1F2970' }}>Ten European Markets</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MARKETS.map(m => {
              const scores = DUMMY_SCORES[m.id] ?? {}
              const avg = overallScore(scores)
              const col = scoreColour(avg)
              // Top gap: lowest-scoring dimension
              const topGap = DIMENSIONS.reduce((worst, d) =>
                (scores[d.id] ?? 5) < (scores[worst.id] ?? 5) ? d : worst
              , DIMENSIONS[0])
              return (
                <Link
                  key={m.id}
                  href={`/oncology/dashboard?market=${m.id}`}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all block"
                >
                  <div className="text-2xl mb-2">{m.flag}</div>
                  <p className="font-bold text-sm text-gray-800 mb-1">{m.name}</p>
                  <div
                    className="inline-block text-xs font-black px-2 py-0.5 rounded mb-2"
                    style={{ background: col.bg, color: col.text }}
                  >
                    {avg.toFixed(1)} — {col.label}
                  </div>
                  <Sparkline marketId={m.id} />
                  <p className="text-xs text-gray-400 mt-2 truncate">
                    Gap: {topGap.short}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Roles ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: '#1F2970' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: '#FF6BB5' }}>
            MULTI-ROLE INTELLIGENCE
          </p>
          <h2 className="text-3xl font-black text-white mb-8">
            Built for every role in the commercial team
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map(r => (
              <div
                key={r.id}
                className="rounded-xl p-5"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <p className="font-bold text-white mb-1">{r.label}</p>
                <p className="text-white/55 text-sm leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dimensions ───────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: '#C8006E' }}>
            ASSESSMENT FRAMEWORK
          </p>
          <h2 className="text-3xl font-black mb-8" style={{ color: '#1F2970' }}>Six Dimensions of Market Readiness</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DIMENSIONS.map((d, i) => (
              <div key={d.id} className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5"
                  style={{ background: '#C8006E' }}
                >
                  {i + 1}
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">{d.name}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F4F5FA' }} className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-4" style={{ color: '#1F2970' }}>
            Ready to assess your markets?
          </h2>
          <p className="text-gray-500 mb-8">
            Ten minutes. Six dimensions. One clear picture of your European GTM readiness — before the quarter review gets there first.
          </p>
          <Link
            href="/oncology/assess"
            className="inline-block text-white font-bold px-10 py-4 rounded-full text-base transition-opacity hover:opacity-90 shadow-md"
            style={{ background: '#C8006E' }}
          >
            Start your assessment →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded" style={{ background: '#1F2970' }} />
            <span className="text-xs font-bold tracking-wide text-gray-500">KIRK &amp; BLACKBEARD</span>
          </div>
          <p className="text-xs text-gray-400">
            European Oncology Market Readiness Platform · Confidential · v1.0 MVP
          </p>
          <div className="flex gap-5">
            <Link href="/oncology/assess" className="text-xs text-gray-400 hover:text-gray-600">Assess</Link>
            <Link href="/oncology/dashboard" className="text-xs text-gray-400 hover:text-gray-600">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
