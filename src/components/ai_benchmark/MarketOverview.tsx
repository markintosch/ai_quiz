// Compact "state of the market" stack — used both on the standalone public
// /ai_benchmark/dashboard page and embedded in personal /results pages.
//
// Sections (each a card with a single-line takeaway above + 2-3 lines of
// context below the chart):
// 1. Radar — six dimensions × role
// 2. Heatmap — top-10 specialised tools × role
// 3. Archetype distribution — stacked horizontal bar
// 4. Top blockers per role — three mini RankedBars
// 5. Time saved + Top use cases — two side-by-side ranked bars
//
// SkillCurve is intentionally NOT embedded here (it's its own dedicated
// section on both the personal results page and the public dashboard).

import { type DashboardData } from '@/products/ai_benchmark/public_dashboard'
import { Radar }         from './Radar'
import { Heatmap }       from './Heatmap'
import { RankedBars, StackedBar } from './RankedBars'

const INK    = '#0F172A'
const ACCENT = '#1D4ED8'
const WARM   = '#D97706'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'

const ROLE_LABEL: Record<string, string> = {
  marketing: 'Marketing',
  sales:     'Sales',
  hybrid:    'Hybride',
}
const ROLE_COLOR: Record<string, string> = {
  marketing: '#1D4ED8', // accent blue
  sales:     '#15803D', // green
  hybrid:    '#7C3AED', // purple
}
const ARCH_COLORS: Record<string, string> = {
  pragmatist:      '#1D4ED8',
  power_user:      '#0EA5E9',
  curious_skeptic: '#A855F7',
  strategist:      '#1E3A8A',
  lagging_builder: '#94A3B8',
  shadow_operator: '#D97706',
}

export function MarketOverview({ data }: { data: DashboardData }) {
  const dims = [
    { id: 'adoption',   label: 'Adoptie' },
    { id: 'workflow',   label: 'Workflow' },
    { id: 'outcome',    label: 'Outcome' },
    { id: 'data',       label: 'Data' },
    { id: 'skill',      label: 'Skill' },
    { id: 'governance', label: 'Governance' },
  ]
  const radarSeries = (['marketing', 'sales', 'hybrid'] as const).map(role => ({
    id:    role,
    label: ROLE_LABEL[role],
    color: ROLE_COLOR[role],
    values: dims.map(d => data.dimensionAvgsByRole[role]?.[d.id] ?? 0),
  }))

  // Find the most differentiated tool between marketing and sales for the radar takeaway
  const biggestDimGap = dims
    .map(d => ({
      d,
      gap: Math.abs((data.dimensionAvgsByRole.marketing?.[d.id] ?? 0) - (data.dimensionAvgsByRole.sales?.[d.id] ?? 0)),
      m:   data.dimensionAvgsByRole.marketing?.[d.id] ?? 0,
      s:   data.dimensionAvgsByRole.sales?.[d.id]     ?? 0,
    }))
    .sort((a, b) => b.gap - a.gap)[0]

  const radarTakeaway = biggestDimGap
    ? `Sales scoort ${biggestDimGap.s} op ${biggestDimGap.d.label.toLowerCase()}, marketing ${biggestDimGap.m} — het grootste verschil tussen rollen.`
    : ''

  // Archetype distribution as stacked bar
  const archSegments = data.archetypeDist.filter(a => a.pct > 0).map(a => ({
    id:    a.id,
    label: a.label,
    pct:   a.pct,
    color: ARCH_COLORS[a.id] || ACCENT,
    emoji: a.emoji,
  }))
  const topArch = data.archetypeDist[0]

  // Heatmap takeaway
  const heatmapTakeaway = (() => {
    // Find tool with biggest spread (max - min across roles)
    const spreads = data.topTools.map(t => {
      const vals = (['marketing', 'sales', 'hybrid'] as const).map(r => data.toolAdoptionByRole[r]?.[t.id] ?? 0)
      const max  = Math.max(...vals); const min = Math.min(...vals)
      const dominant = (['marketing', 'sales', 'hybrid'] as const)[vals.indexOf(max)]
      return { tool: t, max, min, dominant, spread: max - min }
    })
      .sort((a, b) => b.spread - a.spread)
    const top = spreads[0]
    return top ? `${top.tool.label} is sterk geconcentreerd in ${ROLE_LABEL[top.dominant]} (${top.max}% vs. ${top.min}% in de rest).` : ''
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Radar ── */}
      <Card label="Dimensies × rol" headline="Waar elke rol sterk en zwak in is.">
        <Radar axes={dims} series={radarSeries} size={320} />
        <Caption>
          {radarTakeaway} De zes dimensies meten elk een ander aspect van AI-volwassenheid: van pure adoptie tot governance. Hoe groter het oppervlak, hoe meer een rol in de breedte werkt met AI.
        </Caption>
      </Card>

      {/* ── Heatmap ── */}
      <Card label="Tool-adoptie heatmap" headline="Welke tools horen bij welke rol.">
        <Heatmap
          rows={(['marketing', 'sales', 'hybrid'] as const).map(r => ({ id: r, label: ROLE_LABEL[r] }))}
          cols={data.topTools}
          values={data.toolAdoptionByRole}
        />
        <Caption>
          {heatmapTakeaway} De heatmap toont per rol welk percentage de top-10 specialistische AI-tools wekelijks gebruikt. Donker = hoge adoptie. Sales-stacks centreren rond outreach (Apollo, Clay, Gong); marketing-stacks rond content (Jasper, Canva, Midjourney).
        </Caption>
      </Card>

      {/* ── Archetype distribution ── */}
      <Card label="Archetype-verdeling" headline={topArch ? `${topArch.emoji} ${topArch.label} is het grootste profiel (${topArch.pct}%).` : 'Archetypes in het veld.'}>
        <StackedBar segments={archSegments} height={32} />
        <Caption>
          De zes archetypes vatten samen hoe iemand AI gebruikt — niet hoe goed. Een Pragmatist is even waardevol als een Strategist; ze nemen verschillende posities in. Klein aandeel Power Users is normaal; klein aandeel Lagging Builders signaleert dat het veld z'n inhaalslag heeft gemaakt.
        </Caption>
      </Card>

      {/* ── Blockers per role ── */}
      <Card label="Top blokkades per rol" headline="Waar de remmen zitten.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {(['marketing', 'sales', 'hybrid'] as const).map(role => (
            <div key={role}>
              <p style={{ fontSize: 12, fontWeight: 800, color: ROLE_COLOR[role], letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                {ROLE_LABEL[role]}
              </p>
              <RankedBars
                items={data.topBlockersByRole[role].map(b => ({ id: b.id, label: b.label, pct: b.pct }))}
                color={ROLE_COLOR[role]}
                compact
              />
            </div>
          ))}
        </div>
        <Caption>
          De drie meest-genoemde blokkades per rol. Strategie en data-hygiëne komen het vaakst terug — opvallend hoe rolspecifiek het beeld is: sales worstelt met data, marketing met richting, hybride teams met budget en bestuur.
        </Caption>
      </Card>

      {/* ── Time saved + Top use cases ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <Card label="Tijdwinst per week" headline="Hoeveel uur AI bespaart.">
          <RankedBars
            items={data.timeSavedDist.map(t => ({ id: t.id, label: t.label, pct: t.pct }))}
            color={WARM}
          />
          <Caption>
            Eigen schatting van de respondenten. De meesten zitten tussen 1 en 8 uur per week — daarboven kantelt het van time-saver naar productiviteits-multiplier.
          </Caption>
        </Card>

        <Card label="Top AI use-cases" headline="Waar AI vandaag voor wordt ingezet.">
          <RankedBars
            items={data.topUseCases.map(u => ({ id: u.id, label: u.label, pct: u.pct }))}
          />
          <Caption>
            De vijf meest-genoemde toepassingen, over alle rollen heen. Schrijven en research domineren — de "agentic" use-cases (proactieve workflows, klantcontact) zijn nog kleiner maar groeien snel.
          </Caption>
        </Card>
      </div>
    </div>
  )
}

// ── Card chrome ──────────────────────────────────────────────────────────────
function Card({ label, headline, children }: { label: string; headline: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ACCENT, marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 18, fontWeight: 800, color: INK, marginBottom: 16, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
        {headline}
      </p>
      {children}
    </div>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, color: BODY, lineHeight: 1.6, marginTop: 14, marginBottom: 0 }}>
      {children}
    </p>
  )
}

// Suppress unused warning
void MUTED
