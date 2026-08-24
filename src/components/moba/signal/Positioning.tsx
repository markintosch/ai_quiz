'use client'

// ─── Brand & positioning paper ────────────────────────────────────────────────
// The quarterly reference document: how Moba, Sanovo and NABEL position
// themselves publicly. Fixed structure per edition so editions compare; the
// axes and theme taxonomy never change. The dashboard card shows the map and
// theme matrix; /moba/signal/paper renders the full paper. Both render from
// the same approved edition and take an entityName resolver so the admin
// console can preview a draft with the same components.

import type { PaperThemeKey, PositioningPaper } from '@/products/moba_signal/types'
import { PAPER_AXES, PAPER_THEMES } from '@/products/moba_signal/types'
import { entityColor } from '@/products/moba_signal/selectors'

const THEME_KEYS = Object.keys(PAPER_THEMES) as PaperThemeKey[]
const SCORE_RAMP = ['#f3f6f8', '#b7c9d3', '#63879c', '#354E5E']
const SCORE_INK = ['#c3c2b7', '#1E3340', '#ffffff', '#ffffff']

export type EntityNameFn = (id: string) => string

// ── The 2×2 map ───────────────────────────────────────────────────────────────

export function PositioningMap({ paper, entityName, height = 250 }: {
  paper: PositioningPaper
  entityName: EntityNameFn
  height?: number
}) {
  const W = 420, H = height, P = 18, PB = 30
  const px = (v: number) => P + ((W - 2 * P) * v) / 100
  const py = (v: number) => (H - PB) - ((H - PB - P) * v) / 100

  // Direct labels: nudge apart vertically when placements sit close together
  const sorted = [...paper.map.placements].sort((a, b) => py(a.y) - py(b.y))
  const labelY: Record<string, number> = {}
  let prev = -Infinity
  for (const p of sorted) {
    let ly = py(p.y)
    if (ly - prev < 13) ly = prev + 13
    labelY[p.entityId] = ly
    prev = ly
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label={`Positioning map: ${PAPER_AXES.x.label} versus ${PAPER_AXES.y.label}`}>
      <rect x={P} y={P} width={W - 2 * P} height={H - PB - P} fill="#fcfcfb" stroke="#e1e0d9" />
      <line x1={px(50)} y1={P} x2={px(50)} y2={H - PB} stroke="#e1e0d9" strokeDasharray="3 3" />
      <line x1={P} y1={py(50)} x2={W - P} y2={py(50)} stroke="#e1e0d9" strokeDasharray="3 3" />
      {/* Axis extremes: the fixed reading frame */}
      <text x={P} y={H - PB + 12} fontSize="9" fill="#898781">{PAPER_AXES.x.low}</text>
      <text x={W - P} y={H - PB + 12} fontSize="9" fill="#898781" textAnchor="end">{PAPER_AXES.x.high}</text>
      <text x={W / 2} y={H - PB + 24} fontSize="9" fontWeight="600" fill="#52514e" textAnchor="middle">{PAPER_AXES.x.label} →</text>
      <text x={P + 4} y={H - PB - 6} fontSize="9" fill="#898781">{PAPER_AXES.y.low}</text>
      <text x={P + 4} y={P + 11} fontSize="9" fill="#898781">{PAPER_AXES.y.high} ↑</text>
      {paper.map.placements.map(p => {
        const isMoba = p.entityId === 'moba'
        return (
          <g key={p.entityId}>
            <circle cx={px(p.x)} cy={py(p.y)} r={isMoba ? 7 : 5.5}
              fill={entityColor(p.entityId)} stroke="#fff" strokeWidth="1.5">
              <title>{`${entityName(p.entityId)}: ${p.rationale}`}</title>
            </circle>
            <text x={px(p.x) + 10} y={labelY[p.entityId] + 3.5} fontSize="11"
              fontWeight={isMoba ? 700 : 600} fill="#0b0b0b">
              {entityName(p.entityId)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Theme matrix ──────────────────────────────────────────────────────────────

export function ThemeMatrix({ paper, entityName }: {
  paper: PositioningPaper
  entityName: EntityNameFn
}) {
  return (
    <div className="overflow-x-auto">
      <table className="text-xs min-w-[300px]">
        <thead>
          <tr>
            <th className="text-left py-1 pr-3 font-medium text-[10px] uppercase tracking-wide text-gray-400">Theme</th>
            {paper.profiles.map(p => (
              <th key={p.entityId} className="py-1 px-1 font-semibold text-[11px] text-gray-700 text-center min-w-[52px]">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entityColor(p.entityId) }} />
                  {entityName(p.entityId).split(' ')[0]}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {THEME_KEYS.map(k => (
            <tr key={k}>
              <td className="py-0.5 pr-3 text-gray-600 whitespace-nowrap">{PAPER_THEMES[k]}</td>
              {paper.profiles.map(p => {
                const s = p.themes[k]?.score ?? 0
                const ev = p.themes[k]?.evidence ?? []
                return (
                  <td key={p.entityId} className="py-0.5 px-1 text-center">
                    <span
                      className="inline-flex items-center justify-center w-9 h-5 rounded font-semibold tabular-nums"
                      style={{ backgroundColor: SCORE_RAMP[s], color: SCORE_INK[s] }}
                      title={ev.length ? ev.map(e => `"${e.text}"`).join('\n') : `${PAPER_THEMES[k]}: ${s}/3`}
                    >
                      {s}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-gray-400 mt-1.5">0 absent · 1 mentioned · 2 recurring · 3 core theme, scored from their own public copy.</p>
    </div>
  )
}

// ── Dashboard card ────────────────────────────────────────────────────────────

export function PositioningCard({ paper, entityName }: {
  paper?: PositioningPaper
  entityName: EntityNameFn
}) {
  if (!paper) {
    return (
      <p className="text-xs text-gray-400">
        No approved edition yet. Draft one in the{' '}
        <a href="/admin/moba-signal" className="text-brand underline">collection console</a>{' '}
        (the Positioning agent also drafts one each quarter).
      </p>
    )
  }
  return (
    <div>
      <PositioningMap paper={paper} entityName={entityName} height={230} />
      <div className="mt-2">
        <ThemeMatrix paper={paper} entityName={entityName} />
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100 flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-gray-400">
          Edition {paper.edition}{paper.approvedAt ? `, approved ${paper.approvedAt.slice(0, 10)}` : ''}
        </span>
        <a href="/moba/signal/paper" className="text-xs font-semibold text-brand underline whitespace-nowrap">
          Full paper →
        </a>
      </div>
    </div>
  )
}

// ── The full paper ────────────────────────────────────────────────────────────

function FactList({ facts }: { facts: Array<{ text: string; sourceUrl: string }> }) {
  if (facts.length === 0) return <p className="text-xs text-gray-400">Nothing found in this edition&rsquo;s input.</p>
  return (
    <ul className="space-y-1">
      {facts.map((f, i) => (
        <li key={i} className="text-sm text-gray-700 leading-snug">
          {f.text}{' '}
          <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="text-[10px] text-gray-400 underline align-baseline" title={f.sourceUrl}>source</a>
        </li>
      ))}
    </ul>
  )
}

function SectionTitle({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-4 mb-1.5">
      <span className="text-gray-300 mr-1.5">{n}</span>{children}
    </h3>
  )
}

export function PositioningPaperView({ paper, entityName }: {
  paper: PositioningPaper
  entityName: EntityNameFn
}) {
  return (
    <div className="space-y-6">
      {/* Company profiles: the identical template, three times */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {paper.profiles.map(p => (
          <section key={p.entityId} className="rounded-xl border border-gray-200 bg-white p-4 min-w-0">
            <header className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entityColor(p.entityId) }} />
              <h2 className={`text-sm font-bold ${p.entityId === 'moba' ? 'text-brand' : 'text-gray-900'}`}>
                {entityName(p.entityId)}
              </h2>
            </header>
            <SectionTitle n="1">Snapshot</SectionTitle>
            <FactList facts={p.snapshot} />
            <SectionTitle n="2">Stated positioning</SectionTitle>
            {p.tagline && <p className="text-sm font-semibold text-gray-800 italic mb-1">&ldquo;{p.tagline}&rdquo;</p>}
            <p className="text-sm text-gray-700 leading-snug">{p.positioningSummary}</p>
            {p.claims.length > 0 && (
              <div className="mt-1.5">
                <FactList facts={p.claims} />
              </div>
            )}
            <SectionTitle n="3">Target audience signals</SectionTitle>
            <FactList facts={p.audience} />
            <SectionTitle n="4">Proof points used</SectionTitle>
            <FactList facts={p.proofPoints} />
            <SectionTitle n="5">Channel behaviour</SectionTitle>
            <p className="text-sm text-gray-700 leading-snug">{p.channelBehaviour}</p>
          </section>
        ))}
      </div>

      {/* Cross-company analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Positioning map</h2>
          <PositioningMap paper={paper} entityName={entityName} height={280} />
          <ul className="mt-2 space-y-1">
            {paper.map.placements.map(pl => (
              <li key={pl.entityId} className="text-xs text-gray-500 leading-snug">
                <span className="font-semibold text-gray-700">{entityName(pl.entityId)}:</span> {pl.rationale}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Messaging themes</h2>
          <ThemeMatrix paper={paper} entityName={entityName} />
          {paper.collisions.length > 0 && (
            <>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-4 mb-1.5">Claim collisions</h3>
              <ul className="space-y-2">
                {paper.collisions.map((c, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-snug">
                    <span className="font-medium">&ldquo;{c.claim}&rdquo;</span>
                    <span className="text-xs text-gray-500"> · {c.entityIds.map(entityName).join(' + ')}</span>
                    <span className="block text-xs text-gray-500">{c.note}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-2">What changed since the previous edition</h2>
          {paper.changes.length === 0 && (
            <p className="text-sm text-gray-400">First edition, or no material movement. Deltas are computed field by field, never drafted.</p>
          )}
          <ul className="space-y-1">
            {paper.changes.map((c, i) => (
              <li key={i} className="text-sm text-gray-700 leading-snug">
                <span className="font-semibold">{entityName(c.entityId)}:</span> {c.change}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border-2 border-brand/30 bg-brand/5 p-4">
          <h2 className="text-sm font-bold text-brand mb-2">Implications for Moba</h2>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{paper.implications}</p>
          <p className="text-[11px] text-gray-400 mt-2">
            {paper.approvedBy
              ? `Wording approved by ${paper.approvedBy}${paper.approvedAt ? `, ${paper.approvedAt.slice(0, 10)}` : ''}. The agent never edits an approved edition.`
              : 'Agent draft. The analyst rewrites and owns this section before approval.'}
          </p>
        </section>
      </div>
    </div>
  )
}
