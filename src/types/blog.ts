// Blog/CMS types — shared between public pages, admin editor, and API routes.
//
// The Tiptap document uses a recursive JSON structure (ProseMirror nodes).
// We keep the type loose (`unknown`) at the boundary so the client can
// pass any valid Tiptap doc; the server-side renderer (`renderTiptap.tsx`)
// pattern-matches on `node.type`.

export type BlogLocale = 'nl' | 'en' | 'de'
export type BlogStatus = 'draft' | 'published'
export type BlogFormat = 'article' | 'update'

/** Raw row from Supabase. */
export interface BlogPostRow {
  id:                string
  parent_id:         string | null
  locale:            BlogLocale
  slug:              string
  title:             string
  excerpt:           string | null
  content:           TiptapDoc                              // JSONB
  cover_image:       string | null
  cover_alt:         string | null
  /** Optional poster image — used as og:image when cover_image is a video. */
  cover_poster:      string | null
  format:            BlogFormat
  status:            BlogStatus
  published_at:      string | null
  author_name:       string
  tags:              string[]
  reading_minutes:   number | null
  meta_title:        string | null
  meta_description:  string | null
  noindex:           boolean
  created_at:        string
  updated_at:        string
}

/** Tiptap / ProseMirror document — top-level shape. */
export interface TiptapDoc {
  type:    'doc'
  content: TiptapNode[]
}

/** Generic node — children may be text leaves, marks (inline styling), or nested blocks. */
export interface TiptapNode {
  type:    string
  attrs?:  Record<string, unknown>
  content?: TiptapNode[]
  text?:    string
  marks?:   TiptapMark[]
}

export interface TiptapMark {
  type:   string
  attrs?: Record<string, unknown>
}

/** Empty document — use as default when creating a new post. */
export const EMPTY_TIPTAP_DOC: TiptapDoc = { type: 'doc', content: [] }

/** Compute reading minutes from a Tiptap doc — 200 wpm, min 1 minute. */
export function computeReadingMinutes(doc: TiptapDoc): number {
  const wordCount = countWords(doc)
  return Math.max(1, Math.round(wordCount / 200))
}

function countWords(node: TiptapNode | TiptapDoc): number {
  let count = 0
  if ('text' in node && typeof node.text === 'string') {
    count += node.text.trim().split(/\s+/).filter(Boolean).length
  }
  if ('content' in node && Array.isArray(node.content)) {
    for (const child of node.content) {
      count += countWords(child)
    }
  }
  return count
}

/** Slug helper — strip diacritics, lowercase, hyphenate. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')              // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Locale display labels for UI. */
export const LOCALE_LABELS: Record<BlogLocale, string> = {
  nl: 'Nederlands',
  en: 'English',
  de: 'Deutsch',
}
