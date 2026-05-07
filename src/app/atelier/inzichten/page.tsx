// FILE: src/app/atelier/inzichten/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Server wrapper for the Inzichten tab. Fetches the available ICPs (so the
// user can pick one as audience-context) and hands them to InzichtenClient.

import { createServiceClient } from '@/lib/supabase/server'
import InzichtenClient, { type IcpOption } from './InzichtenClient'

export const dynamic = 'force-dynamic'

interface IcpRow {
  id:                string
  industry:          string | null
  role:              string | null
  request_keywords:  string | null
  archetype_label:   string | null
  business_type:     string | null
  is_starter:        boolean | null
  created_at:        string
}

function formatLabel(r: IcpRow): string {
  if (r.archetype_label) return r.archetype_label
  if (r.request_keywords) return `Aanvraag: ${r.request_keywords}`
  const ind = r.industry?.trim() || 'Onbekende industry'
  const role = r.role?.trim() || 'Rol n.t.b.'
  return `${ind} · ${role}`
}

export default async function InzichtenPage() {
  const sb = createServiceClient()

  const { data: icps } = await sb
    .from('atelier_icp_profiles')
    .select('id, industry, role, request_keywords, archetype_label, business_type, is_starter, created_at')
    .order('is_starter', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200) as { data: IcpRow[] | null }

  const icpOptions: IcpOption[] = (icps ?? []).map(r => ({
    id:            r.id,
    label:         formatLabel(r),
    business_type: r.business_type,
    is_starter:    !!r.is_starter,
  }))

  return <InzichtenClient icpOptions={icpOptions} />
}
