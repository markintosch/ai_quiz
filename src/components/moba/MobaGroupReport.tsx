'use client'

import { MOBA_MARKETING_CONFIG } from '@/products/moba_marketing/config'
import type { MobaAggregate, DimensionAgg } from '@/lib/moba/aggregate'

const THRESHOLDS = MOBA_MARKETING_CONFIG.scoring.maturityThresholds

function levelColor(level: string): { text: string; bg: string } {
  const t = THRESHOLDS.find(x => x.level === level)
  return { text: t?.colorClass ?? 'text-gray-600', bg: t?.bgClass ?? 'bg-gray-50' }
}

// ── One dimension: mean + full spread (min–max band, individual dots) ─────────
function SpreadRow({ d }: { d: DimensionAgg }) {
  const c = levelColor(d.level)
  const bandLeft = d.min
  const bandWidth = Math.max(d.max - d.min, 1.5)
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-baseline justify-between mb-2 gap-3">
        <span className="text-sm font-medium text-gray-800">
          {d.icon ? `${d.icon} ` : ''}{d.label}
        </span>
        <span className="text-xs text-gray-500 shrink-0">
          gem. <strong className="text-gray-800">{d.mean}</strong>
          <span className={`ml-2 px-1.5 py-0.5 rounded ${c.bg} ${c.text} font-semibold`}>{d.level}</span>
        </span>
      </div>
      <div className="relative h-9 bg-gray-100 rounded-lg">
        {/* min–max spread band */}
        <div
          className="absolute top-0 bottom-0 bg-brand-accent/15 rounded-lg"
          style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
        />
        {/* individual answers */}
        {d.values.map((v, i) => (
          <div
            key={i}
            className="absolute top-1/2 w-2 h-2 rounded-full bg-brand/50 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${v}%` }}
          />
        ))}
        {/* mean marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-brand-accent -translate-x-1/2"
          style={{ left: `${d.mean}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[11px] text-gray-400">
        <span>laag ({d.min})</span>
        <span>spreiding {d.range} · σ {d.std}</span>
        <span>hoog ({d.max})</span>
      </div>
    </div>
  )
}

// ── Nu vs prioriteit quadrant ─────────────────────────────────────────────────
function NuVsPrioriteit({ dims }: { dims: DimensionAgg[] }) {
  const maxShare = Math.max(...dims.map(d => d.prioritySharePct), 1)
  return (
    <div className="relative">
      <svg viewBox="0 0 100 70" className="w-full" role="img" aria-label="Nu versus prioriteit">
        {/* quadrant shading: low now (left) + high priority (top) = act */}
        <rect x="0" y="0" width="50" height="35" className="fill-brand-accent/10" />
        {/* guide lines */}
        <line x1="50" y1="0" x2="50" y2="70" className="stroke-gray-200" strokeWidth="0.5" />
        <line x1="0" y1="35" x2="100" y2="35" className="stroke-gray-200" strokeWidth="0.5" />
        {dims.map(d => {
          const x = d.mean // 0–100 huidige stand
          const y = 70 - (d.prioritySharePct / maxShare) * 66 // hoge prioriteit = bovenaan
          return (
            <g key={d.key}>
              <circle cx={x} cy={y} r="2.4" className="fill-brand" />
            </g>
          )
        })}
      </svg>
      <div className="flex justify-between text-[11px] text-gray-400 -mt-1">
        <span>← lagere stand nu</span>
        <span>hogere stand nu →</span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-1">
        {[...dims].sort((a, b) => b.prioritySharePct - a.prioritySharePct).map(d => (
          <div key={d.key} className="flex items-center justify-between text-xs">
            <span className="text-gray-600">{d.label}</span>
            <span className="text-gray-400">stand {d.mean} · prioriteit {d.prioritySharePct}%</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Oranje vlak: thema's waar we nu laag staan én die het team hoog prioriteert. Daar zijn
        we het over eens dat er iets moet gebeuren.
      </p>
    </div>
  )
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-accent mb-1">{label}</p>
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  )
}

interface Props {
  data: MobaAggregate
  teamName: string
  demo?: boolean
}

export function MobaGroupReport({ data, teamName, demo = false }: Props) {
  const c = levelColor(data.overallLevel)
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-1">{teamName}</p>
            <h1 className="text-2xl font-bold text-gray-900">Teamoverzicht</h1>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{data.overallMean}</p>
            <p className={`text-sm font-semibold ${c.text}`}>{data.overallLevel}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          {data.n} teamleden ingevuld. Dit overzicht laat zien waar we het eens zijn en waar
          onze beelden uiteenlopen. De spreiding is net zo belangrijk als het gemiddelde.
        </p>
      </div>

      {/* Divergence highlight */}
      <Section label="Gespreksonderwerpen" title="Hier verschillen we het meest van mening">
        <div className="grid sm:grid-cols-3 gap-3">
          {data.mostDivergent.map((d, i) => (
            <div key={d.key} className="rounded-xl border border-brand-accent/30 bg-orange-50/40 p-4">
              <p className="text-xs text-brand-accent font-semibold mb-1">#{i + 1} · σ {d.std}</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug">{d.label}</p>
              <p className="text-xs text-gray-500 mt-1">
                antwoorden lopen van {d.min} tot {d.max}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Dit zijn de drie thema's met de grootste onderlinge spreiding. Precies hier ligt het
          gesprek voor de sessie.
        </p>
      </Section>

      {/* Per-dimension spread */}
      <Section label="Per thema" title="Gemiddelde én spreiding">
        <div>
          {data.dimensions.map(d => <SpreadRow key={d.key} d={d} />)}
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Elke stip is één teamlid. De band loopt van het laagste tot het hoogste antwoord, de
          oranje lijn is het gemiddelde.
        </p>
      </Section>

      {/* Priorities */}
      <Section label="Richting 2027" title="Waar wil het team de energie op zetten">
        <div className="space-y-2.5">
          {[...data.dimensions].sort((a, b) => b.priorityPoints - a.priorityPoints).map(d => {
            const max = Math.max(...data.dimensions.map(x => x.priorityPoints), 1)
            return (
              <div key={d.key} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-56 shrink-0 truncate">{d.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="h-2.5 rounded-full bg-brand-accent" style={{ width: `${(d.priorityPoints / max) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-10 text-right">{d.priorityPoints} pt</span>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Nu vs prioriteit */}
      <Section label="Nu vs. prioriteit" title="Waar zijn we het over eens dat het moet gebeuren">
        <NuVsPrioriteit dims={data.dimensions} />
      </Section>

      {/* Rol van marketing */}
      <Section label="Beeld van het team" title="Wat moet de rol van marketing zijn">
        {data.role.n === 0 ? (
          <p className="text-xs text-gray-400">Nog geen antwoorden.</p>
        ) : (
          <>
            <div className="space-y-2.5">
              {[...data.role.options].sort((a, b) => b.count - a.count).map(o => (
                <div key={o.code} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-64 shrink-0">{o.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-2.5 rounded-full bg-brand-accent" style={{ width: `${o.sharePct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-16 text-right">{o.count}× · {o.sharePct}%</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Meerdere antwoorden per persoon mogelijk, dus de percentages tellen niet op tot
              100. Aandeel is berekend over de {data.role.n} teamleden die deze vraag beantwoordden.
            </p>
            {data.role.otherAnswers.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Eigen aanvullingen (anoniem)</p>
                <ul className="space-y-1.5">
                  {data.role.otherAnswers.map((a, i) => (
                    <li key={i} className="text-sm text-gray-600 pl-3 border-l-2 border-gray-200">{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </Section>

      {/* Segment overlay */}
      {data.segments.techniek && data.segments.markt && (
        <Section label="Segmenten" title="Techniek-gedreven vs. markt-gedreven">
          <p className="text-sm text-gray-500 mb-4">
            Gemiddelde per thema, gesplitst naar waar mensen zich van nature toe aangetrokken
            voelen. Zo zie je of de invalshoek het beeld kleurt.
            <span className="text-gray-400"> (techniek n={data.segments.techniekN} · markt n={data.segments.marktN})</span>
          </p>
          <div className="space-y-3">
            {data.dimensions.map(d => {
              const tv = data.segments.techniek![d.key]
              const mv = data.segments.markt![d.key]
              return (
                <div key={d.key}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{d.label}</span>
                    <span className="text-gray-400">techniek {tv} · markt {mv}</span>
                  </div>
                  <div className="relative h-5 bg-gray-100 rounded-lg">
                    <div className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-slate-500 -translate-x-1/2 -translate-y-1/2" style={{ left: `${tv}%` }} title="techniek" />
                    <div className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-brand-accent -translate-x-1/2 -translate-y-1/2" style={{ left: `${mv}%` }} title="markt" />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> techniek-gedreven</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-brand-accent inline-block" /> markt-gedreven</span>
          </div>
        </Section>
      )}

      {/* Open answers */}
      <Section label="In eigen woorden" title="Open antwoorden (anoniem)">
        <div className="space-y-5">
          {data.openAnswers.map(q => (
            <div key={q.key}>
              <p className="text-sm font-medium text-gray-700 mb-2">{q.text}</p>
              {q.answers.length === 0 ? (
                <p className="text-xs text-gray-400">Nog geen antwoorden.</p>
              ) : (
                <ul className="space-y-1.5">
                  {q.answers.map((a, i) => (
                    <li key={i} className="text-sm text-gray-600 pl-3 border-l-2 border-gray-200">{a}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Section>

      {demo && (
        <p className="text-center text-xs text-gray-400">
          Voorbeeldrapport met fictieve data (n={data.n}). In het echt vult elk teamlid anoniem
          in en vult dit overzicht zich vanzelf.
        </p>
      )}
    </div>
  )
}
