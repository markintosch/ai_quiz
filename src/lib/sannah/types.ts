// FILE: src/lib/sannah/types.ts
// Shared types for Sannah's portfolio site + CMS.

export type Locale = 'nl' | 'en'

export interface SannahWork {
  id:            string
  image_path:    string
  thumb_path:    string | null
  title:         string | null
  year:          string | null
  medium:        string | null
  description:   string | null
  position:      number
  is_published:  boolean
  created_at:    string
  updated_at:    string
}

export type PageKey = 'homepage' | 'over_mij' | 'contact' | 'cv'

export interface SannahPageImage {
  path: string
  alt?: string
}

export interface SannahPage {
  page_key:       PageKey
  body_nl:        string | null
  body_en:        string | null
  draft_body_nl:  string | null
  draft_body_en:  string | null
  images:         SannahPageImage[]
  updated_at:     string
}

export const PAGE_LABEL: Record<PageKey, { nl: string; en: string }> = {
  homepage: { nl: 'Werk',     en: 'Work' },
  over_mij: { nl: 'Over',     en: 'About' },
  cv:       { nl: 'CV',       en: 'CV' },
  contact:  { nl: 'Contact',  en: 'Contact' },
}

/** Construct the public Supabase Storage URL for a sannah-portfolio path. */
export function publicImageUrl(path: string | null | undefined): string {
  if (!path) return ''
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return ''
  return `${base}/storage/v1/object/public/sannah-portfolio/${path}`
}
