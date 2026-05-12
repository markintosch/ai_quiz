/**
 * UI strings for /blog (NL/EN/DE).
 *
 * Mirrors the pattern used by /mentor: a single STRINGS map keyed by locale,
 * not next-intl messages. Lets the blog stay independent from the assessment-
 * platform locale config (which is nl/en/fr).
 */

import type { BlogLocale } from '@/types/blog'

export type Lang = BlogLocale

export function pickLang(input: string | string[] | undefined | null): Lang {
  const v = Array.isArray(input) ? input[0] : input
  if (v === 'en' || v === 'de' || v === 'nl') return v
  return 'nl'
}

export const STRINGS: Record<Lang, {
  pageTitle:        string
  pageIntro:        string
  metaTitle:        string
  metaDescription:  string
  filterAll:        string
  filterArticles:   string
  filterUpdates:    string
  readMore:         string
  readingMinutes:   (n: number) => string
  publishedOn:      string
  backToBlog:       string
  byAuthor:         string
  noPostsYet:       string
  newsletterCta:    string
  shareThis:        string
  ogLocale:         string
  /** Magazine-layout extras */
  latestPost:       string
  earlierPosts:     string
  openInOwnPage:    string
}> = {
  nl: {
    pageTitle:       'Blog',
    pageIntro:       'Korte updates en lange essays over AI in marketing & sales — wat werkt, wat ik bouw, wat ik zie veranderen.',
    metaTitle:       'Blog | Mark de Kock — Brand PWRD Media',
    metaDescription: 'Korte updates en lange essays over AI in marketing & sales. Wat werkt, wat ik bouw, wat ik zie veranderen.',
    filterAll:       'Alles',
    filterArticles:  'Essays',
    filterUpdates:   'Updates',
    readMore:        'Lees verder',
    readingMinutes:  (n) => `${n} min lezen`,
    publishedOn:     'Gepubliceerd op',
    backToBlog:      '← Terug naar blog',
    byAuthor:        'door',
    noPostsYet:      'Nog geen posts gepubliceerd. Binnenkort hier.',
    newsletterCta:   'Wil je dit in je inbox? Stuur me een mail.',
    shareThis:       'Deel dit',
    ogLocale:        'nl_NL',
    latestPost:      'Laatste post',
    earlierPosts:    'Eerder verschenen',
    openInOwnPage:   'Lees op eigen pagina →',
  },
  en: {
    pageTitle:       'Blog',
    pageIntro:       'Short updates and long essays on AI in marketing & sales — what works, what I build, what I see changing.',
    metaTitle:       'Blog | Mark de Kock — Brand PWRD Media',
    metaDescription: 'Short updates and long essays on AI in marketing & sales. What works, what I build, what I see changing.',
    filterAll:       'All',
    filterArticles:  'Essays',
    filterUpdates:   'Updates',
    readMore:        'Read more',
    readingMinutes:  (n) => `${n} min read`,
    publishedOn:     'Published on',
    backToBlog:      '← Back to blog',
    byAuthor:        'by',
    noPostsYet:      'No posts published yet. Coming soon.',
    newsletterCta:   'Want this in your inbox? Send me an email.',
    shareThis:       'Share this',
    ogLocale:        'en_US',
    latestPost:      'Latest post',
    earlierPosts:    'Earlier posts',
    openInOwnPage:   'Read on its own page →',
  },
  de: {
    pageTitle:       'Blog',
    pageIntro:       'Kurze Updates und längere Essays zu KI in Marketing & Sales — was funktioniert, was ich baue, was sich verändert.',
    metaTitle:       'Blog | Mark de Kock — Brand PWRD Media',
    metaDescription: 'Kurze Updates und längere Essays zu KI in Marketing & Sales. Was funktioniert, was ich baue, was sich verändert.',
    filterAll:       'Alle',
    filterArticles:  'Essays',
    filterUpdates:   'Updates',
    readMore:        'Weiterlesen',
    readingMinutes:  (n) => `${n} Min. Lesedauer`,
    publishedOn:     'Veröffentlicht am',
    backToBlog:      '← Zurück zum Blog',
    byAuthor:        'von',
    noPostsYet:      'Noch keine Beiträge veröffentlicht. Bald hier.',
    newsletterCta:   'Möchtest du das in deinem Posteingang? Schreib mir eine Mail.',
    shareThis:       'Teilen',
    ogLocale:        'de_DE',
    latestPost:      'Letzter Beitrag',
    earlierPosts:    'Frühere Beiträge',
    openInOwnPage:   'Auf eigener Seite lesen →',
  },
}

/** Format a date in the post's locale. */
export function formatDate(iso: string, lang: Lang): string {
  try {
    const d = new Date(iso)
    const localeMap: Record<Lang, string> = { nl: 'nl-NL', en: 'en-US', de: 'de-DE' }
    return d.toLocaleDateString(localeMap[lang], {
      year:  'numeric',
      month: 'long',
      day:   'numeric',
    })
  } catch {
    return iso
  }
}
