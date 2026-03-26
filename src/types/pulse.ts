export interface PulseTheme {
  id: string
  slug: string
  title: string
  description: string | null
  editorial_intro: string | null
  linked_episode_url: string | null
  presub_open_at: string | null
  presub_close_at: string | null
  opens_at: string | null
  closes_at: string | null
  published: boolean
  disclaimer_text: string | null
  created_at: string
  updated_at: string
}

export interface PulseEntity {
  id: string
  theme_id: string
  entity_type: string
  slug: string
  label: string
  subtitle: string | null
  description_short: string | null
  source_url: string | null
  source_domain: string | null
  canonical_url: string | null
  hero_image_url: string | null
  og_image_url: string | null
  logo_url: string | null
  location_text: string | null
  organizer_name: string | null
  start_date: string | null
  end_date: string | null
  edition_label: string | null
  ingest_status: 'draft' | 'reviewed' | 'approved' | 'live'
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PulseDimension {
  id: string
  theme_id: string
  slug: string
  label: string
  anchor_low: string
  anchor_high: string
  weight: number
  editorial_note: string | null
  sort_order: number
}

export interface PulseResponse {
  id: string
  theme_id: string
  entity_id: string
  scores: Record<string, number>
  respondent_num: number
  submitted_at: string
  ip_hash: string | null
}

export interface PulseAgentProfile {
  id: string
  entity_id: string
  generated_title: string | null
  generated_summary: string | null
  generated_tags: string[] | null
  generated_fields: Record<string, unknown> | null
  confidence_flags: {
    image_missing?: boolean
    description_weak?: boolean
    date_missing?: boolean
  } | null
  created_at: string
}

export type PulsePhase = 'teaser' | 'presub' | 'active' | 'closed'

export function getPulsePhase(theme: PulseTheme): PulsePhase {
  const now = Date.now()
  const presubOpen = theme.presub_open_at ? new Date(theme.presub_open_at).getTime() : null
  const presubClose = theme.presub_close_at ? new Date(theme.presub_close_at).getTime() : null
  const opensAt = theme.opens_at ? new Date(theme.opens_at).getTime() : null
  const closesAt = theme.closes_at ? new Date(theme.closes_at).getTime() : null

  if (closesAt && now > closesAt) return 'closed'
  if (opensAt && now >= opensAt) return 'active'
  if (presubOpen && presubClose && now >= presubOpen && now <= presubClose) return 'presub'
  return 'teaser'
}
