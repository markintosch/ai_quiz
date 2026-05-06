// FILE: src/lib/sannah/server.ts
// Server-only helpers for Sannah's portfolio.

import { createServiceClient } from '@/lib/supabase/server'
import type { Locale, PageKey, SannahPage, SannahWork } from './types'

export async function getPublishedWorks(): Promise<SannahWork[]> {
  const sb = createServiceClient()
  const { data } = await sb
    .from('sannah_works')
    .select('*')
    .eq('is_published', true)
    .order('position', { ascending: true })
  return (data ?? []) as SannahWork[]
}

export async function getAllWorks(): Promise<SannahWork[]> {
  const sb = createServiceClient()
  const { data } = await sb
    .from('sannah_works')
    .select('*')
    .order('position', { ascending: true })
  return (data ?? []) as SannahWork[]
}

export async function getPage(key: PageKey): Promise<SannahPage | null> {
  const sb = createServiceClient()
  const { data } = await sb
    .from('sannah_pages')
    .select('*')
    .eq('page_key', key)
    .maybeSingle()
  return (data ?? null) as SannahPage | null
}

/** Pick body for locale, falling back to NL if EN is empty. */
export function pageBody(page: SannahPage | null, locale: Locale): string {
  if (!page) return ''
  if (locale === 'en') return (page.body_en?.trim()) || (page.body_nl?.trim()) || ''
  return page.body_nl?.trim() ?? ''
}
