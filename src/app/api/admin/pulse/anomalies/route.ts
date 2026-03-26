import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthorised } from '@/lib/admin/auth'
import type { Json } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!(await isAuthorised())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const themeId = req.nextUrl.searchParams.get('themeId')

  const supabase = createServiceClient()

  // Get all responses for the theme (or all themes)
  const query = supabase
    .from('pulse_responses_v2')
    .select('id, theme_id, entity_id, ip_hash, submitted_at')

  if (themeId) {
    query.eq('theme_id', themeId)
  }

  const { data: responses, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const flags: Array<{
    flag_type: string
    severity: string
    entity_id: string | null
    theme_id: string | null
    details: Record<string, unknown>
  }> = []

  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000

  // Check: > 20 responses in last hour for same entity
  const recentByEntity: Record<string, number> = {}
  for (const r of responses ?? []) {
    const resp = r as { entity_id: string; submitted_at: string; theme_id: string; ip_hash: string }
    const submittedMs = new Date(resp.submitted_at).getTime()
    if (submittedMs >= oneHourAgo) {
      recentByEntity[resp.entity_id] = (recentByEntity[resp.entity_id] ?? 0) + 1
    }
  }

  for (const [entityId, count] of Object.entries(recentByEntity)) {
    if (count > 20) {
      const resp = (responses ?? []).find((r) => {
        const row = r as { entity_id: string }
        return row.entity_id === entityId
      }) as { theme_id: string } | undefined
      flags.push({
        flag_type: 'burst',
        severity: count > 50 ? 'high' : 'medium',
        entity_id: entityId,
        theme_id: resp?.theme_id ?? null,
        details: { count, window: '1h', threshold: 20 },
      })
    }
  }

  // Check: > 5 responses from same ip_hash
  const byIpEntity: Record<string, { count: number; entity_id: string; theme_id: string }> = {}
  for (const r of responses ?? []) {
    const resp = r as { ip_hash: string; entity_id: string; theme_id: string }
    if (!resp.ip_hash) continue
    const key = `${resp.ip_hash}:${resp.entity_id}`
    if (!byIpEntity[key]) {
      byIpEntity[key] = { count: 0, entity_id: resp.entity_id, theme_id: resp.theme_id }
    }
    byIpEntity[key].count++
  }

  for (const [key, { count, entity_id, theme_id }] of Object.entries(byIpEntity)) {
    if (count > 5) {
      flags.push({
        flag_type: 'ip_repeat',
        severity: count > 10 ? 'high' : 'medium',
        entity_id,
        theme_id,
        details: { count, ip_key: key.split(':')[0]?.slice(0, 8) + '…', threshold: 5 },
      })
    }
  }

  // Store new flags in DB
  if (flags.length > 0) {
    await supabase.from('pulse_anomaly_flags').insert(
      flags.map((f) => ({
        theme_id: f.theme_id,
        entity_id: f.entity_id,
        flag_type: f.flag_type,
        severity: f.severity,
        details: f.details as Json,
      })),
    )
  }

  // Return all existing flags
  const { data: allFlags } = await supabase
    .from('pulse_anomaly_flags')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ flags: allFlags ?? [], newFlags: flags.length })
}
