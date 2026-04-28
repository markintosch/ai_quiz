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
import { getContent, type Lang } from '@/products/ai_benchmark/data'
import { Radar }         from './Radar'
import { Heatmap }       from './Heatmap'
import { RankedBars, StackedBar } from './RankedBars'

const INK    = '#0F172A'
const ACCENT = '#1D4ED8'
const WARM   = '#D97706'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'

const ROLE_COLOR: Record<string, string> = {
  marketing: '#1D4ED8',
  sales:     '#15803D',
  hybrid:    '#7C3AED',
}
const ARCH_COLORS: Record<string, string> = {
  pragmatist:      '#1D4ED8',
  power_user:      '#0EA5E9',
  curious_skeptic: '#A855F7',
  strategist:      '#1E3A8A',
  lagging_builder: '#94A3B8',
  shadow_operator: '#D97706',
}

export function MarketOverview({ data, lang = 'nl' }: { data: DashboardData; lang?: Lang }) {
  const t = getContent(lang)
  const ROLE_LABEL: Record<string, string> = {}
  for (const r of t.ROLES) ROLE_LABEL[r.id] = r.label

  const dims = t.DIMENSIONS.map(d => ({ id: d.id, label: d.name }))
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
    ? (lang === 'en' ? `Sales scores ${biggestDimGap.s} on ${biggestDimGap.d.label.toLowerCase()}, marketing ${biggestDimGap.m}. That is the biggest gap between roles.`
       : lang === 'fr' ? `La vente obtient ${biggestDimGap.s} sur ${biggestDimGap.d.label.toLowerCase()}, le marketing ${biggestDimGap.m}. C'est le plus grand écart entre rôles.`
       : lang === 'de' ? `Sales erzielt ${biggestDimGap.s} bei ${biggestDimGap.d.label.toLowerCase()}, Marketing ${biggestDimGap.m}. Das ist die größte Lücke zwischen Rollen.`
       : `Sales scoort ${biggestDimGap.s} op ${biggestDimGap.d.label.toLowerCase()}, marketing ${biggestDimGap.m}. Dat is het grootste verschil tussen rollen.`)
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
    const spreads = data.topTools.map(tool => {
      const vals = (['marketing', 'sales', 'hybrid'] as const).map(r => data.toolAdoptionByRole[r]?.[tool.id] ?? 0)
      const max  = Math.max(...vals); const min = Math.min(...vals)
      const dominant = (['marketing', 'sales', 'hybrid'] as const)[vals.indexOf(max)]
      return { tool, max, min, dominant, spread: max - min }
    })
      .sort((a, b) => b.spread - a.spread)
    const top = spreads[0]
    if (!top) return ''
    if (lang === 'en') return `${top.tool.label} is strongly concentrated in ${ROLE_LABEL[top.dominant]} (${top.max}% vs. ${top.min}% in the rest).`
    if (lang === 'fr') return `${top.tool.label} est fortement concentré dans ${ROLE_LABEL[top.dominant]} (${top.max}% contre ${top.min}% dans le reste).`
    if (lang === 'de') return `${top.tool.label} ist stark in ${ROLE_LABEL[top.dominant]} konzentriert (${top.max}% gegenüber ${top.min}% im Rest).`
    return `${top.tool.label} is sterk geconcentreerd in ${ROLE_LABEL[top.dominant]} (${top.max}% vs. ${top.min}% in de rest).`
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Radar ── */}
      <Card label={t.moRadarLabel} headline={t.moRadarHeadline}>
        <Radar axes={dims} series={radarSeries} size={320} lang={lang} />
        <Caption>{radarTakeaway} {t.moRadarCaption}</Caption>
      </Card>

      {/* ── Heatmap ── */}
      <Card label={t.moHeatmapLabel} headline={t.moHeatmapHeadline}>
        <Heatmap
          rows={(['marketing', 'sales', 'hybrid'] as const).map(r => ({ id: r, label: ROLE_LABEL[r] }))}
          cols={data.topTools}
          values={data.toolAdoptionByRole}
          lang={lang}
        />
        <Caption>{heatmapTakeaway} {t.moHeatmapCaption}</Caption>
      </Card>

      {/* ── Archetype distribution ── */}
      <Card
        label={t.moArchLabel}
        headline={topArch ? `${topArch.emoji} ${topArch.label} ${t.moArchHeadlineTopSuffix} (${topArch.pct}%).` : t.moArchHeadlineDefault}
      >
        <StackedBar segments={archSegments} height={32} />
        <Caption>{t.moArchCaption}</Caption>
      </Card>

      {/* ── Blockers per role ── */}
      <Card label={t.moBlockLabel} headline={t.moBlockHeadline}>
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
        <Caption>{t.moBlockCaption}</Caption>
      </Card>

      {/* ── Time saved + Top use cases ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <Card label={t.moTimeLabel} headline={t.moTimeHeadline}>
          <RankedBars
            items={data.timeSavedDist.map(d => ({ id: d.id, label: d.label, pct: d.pct }))}
            color={WARM}
          />
          <Caption>{t.moTimeCaption}</Caption>
        </Card>

        <Card label={t.moUseLabel} headline={t.moUseHeadline}>
          <RankedBars
            items={data.topUseCases.map(u => ({ id: u.id, label: u.label, pct: u.pct }))}
          />
          <Caption>{t.moUseCaption}</Caption>
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
