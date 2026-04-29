// FILE: src/app/ai_benchmark/tools/page.tsx
// Public Tool Wall — two voted lists (marketing / sales). PREVIEW: noindex,
// no nav links from elsewhere, not in sitemap. Reachable by direct URL.

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getContent, getQuestions, type Lang } from '@/products/ai_benchmark/data'
import { computeToolWalls } from '@/products/ai_benchmark/tools_aggregator'
import { LangPills }   from '@/components/ai_benchmark/LangPills'
import { VoteButtons } from '@/components/ai_benchmark/VoteButtons'

export const dynamic = 'force-dynamic'

const INK        = '#0F172A'
const ACCENT     = '#1D4ED8'
const WARM       = '#D97706'
const WARM_LIGHT = '#FEF3C7'
const BODY       = '#374151'
const MUTED      = '#94A3B8'
const BORDER     = '#E2E8F0'
const LIGHT      = '#F8FAFC'
const FONT       = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const lang = (['nl', 'en', 'fr', 'de'].includes(searchParams.lang || '') ? searchParams.lang : 'nl') as Lang
  const t    = getContent(lang)

  // Load Q2 canonical labels in the active language
  const q2 = getQuestions('marketing', lang).find(q => q.id === 'q2')
  const toolLabels: Record<string, string> = {}
  if (q2) for (const o of q2.options) if (o.id !== 'none') toolLabels[o.id] = o.label

  // Pull all submissions (for Q2 mention counts) and all votes
  const [{ data: rows }, { data: votes }] = await Promise.all([
    supabase
      .from('ai_benchmark_responses')
      .select('role, answers')
      .limit(5000),
    supabase
      .from('ai_benchmark_tool_votes')
      .select('tool_id, direction')
      .limit(20000),
  ]) as unknown as [
    { data: { role: string; answers: Record<string, unknown> | null }[] | null },
    { data: { tool_id: string; direction: number }[] | null },
  ]

  const walls = computeToolWalls(rows ?? [], votes ?? [], toolLabels)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: INK, fontFamily: FONT }}>
      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/ai_benchmark?lang=${lang}`} style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none' }}>
            <span style={{ color: INK, fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>
              {t.navName}
            </span>
            <span style={{ color: MUTED, fontSize: 13, fontWeight: 500 }}>
              · tools
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <LangPills lang={lang} basePath="/ai_benchmark/tools" />
            <Link
              href={`/ai_benchmark/start?lang=${lang}`}
              style={{
                background: 'transparent', color: ACCENT, fontSize: 13, fontWeight: 700,
                padding: '8px 18px', borderRadius: 6, textDecoration: 'none',
                border: `2px solid ${ACCENT}`,
              }}
            >
              {t.navCta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: LIGHT, padding: '56px 24px 40px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: WARM, background: WARM_LIGHT,
              padding: '5px 14px', borderRadius: 100,
            }}>
              {t.toolWallBadge}
            </span>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 800,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#fff', background: '#B91C1C',
              padding: '5px 12px', borderRadius: 100,
            }}>
              {t.toolWallPreviewBadge}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, color: INK, letterSpacing: '-0.025em', maxWidth: 900 }}>
            {t.toolWallH1}
          </h1>
          <p style={{ fontSize: 16, color: BODY, lineHeight: 1.6, marginBottom: 0, maxWidth: 720 }}>
            {t.toolWallSubtitle}
          </p>
        </div>
      </section>

      {/* ── Two columns ── */}
      <section style={{ padding: '40px 24px 64px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
          <ToolColumn
            label={t.toolWallColMarketing}
            color={ACCENT}
            entries={walls.marketing}
            mentionsTpl={t.toolWallMentionsTpl}
            emptyText={t.toolWallEmpty}
          />
          <ToolColumn
            label={t.toolWallColSales}
            color="#15803D"
            entries={walls.sales}
            mentionsTpl={t.toolWallMentionsTpl}
            emptyText={t.toolWallEmpty}
          />
        </div>

        <p style={{ maxWidth: 1100, margin: '20px auto 0', fontSize: 12, color: MUTED, textAlign: 'center' }}>
          {t.toolWallVotesNote}
          {walls.usingMock && (
            <span style={{ marginLeft: 6, color: WARM, fontWeight: 700 }}>· preview-data</span>
          )}
        </p>
      </section>

      <footer style={{ background: INK, padding: '36px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.01em' }}>
            {t.footerLine}
          </span>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {t.reportLine}
          </p>
        </div>
      </footer>
    </div>
  )
}

// ── Single column ───────────────────────────────────────────────────────
function ToolColumn({ label, color, entries, mentionsTpl, emptyText }: {
  label:        string
  color:        string
  entries:      ReturnType<typeof computeToolWalls>['marketing']
  mentionsTpl:  string
  emptyText:    string
}) {
  return (
    <div>
      <h2 style={{
        fontSize: 14, fontWeight: 800, color, letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ width: 8, height: 8, background: color, borderRadius: '50%', display: 'inline-block' }} />
        {label}
      </h2>

      {entries.length === 0 ? (
        <div style={{ background: LIGHT, border: `1px dashed ${BORDER}`, borderRadius: 12, padding: '32px 24px', textAlign: 'center', fontSize: 13, color: MUTED }}>
          {emptyText}
        </div>
      ) : (
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((entry, idx) => (
            <li key={entry.id} style={{
              background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10,
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: 100,
                background: '#F1F5F9', color: BODY,
                fontSize: 12, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {idx + 1}
              </span>

              <div style={{ flex: '1 1 200px', minWidth: 180 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: INK }}>
                  {entry.label}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: MUTED }}>
                  {mentionsTpl.replace('{n}', String(entry.mentions))} · {entry.pct}%
                </p>
              </div>

              <VoteButtons
                toolId={entry.id}
                initialScore={entry.voteScore}
                initialVoterCount={entry.voterCount}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
