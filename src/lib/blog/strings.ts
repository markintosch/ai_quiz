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
  homeLink:         string
  /** Comments + share */
  shareTitle:       string
  shareCopy:        string
  shareCopied:      string
  shareOnX:         string
  shareOnLinkedIn:  string
  commentsTitle:    string
  commentsEmpty:    string
  commentsHidden:   string
  commentsCount:    (n: number) => string
  cFormHeading:     string
  cFormName:        string
  cFormEmail:       string
  cFormEmailHint:   string
  cFormBody:        string
  cFormConsent:     string
  cFormConsentTextStored: string
  cFormSubmit:      string
  cFormSubmitting:  string
  cFormSuccess:     string
  cFormError:       string
  cFormErrorRequired: string
  cFormErrorEmail:  string
  cFormErrorRate:   string
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
    homeLink:        '← Terug naar markdekock.com',
    shareTitle:      'Deel deze post',
    shareCopy:       'Kopieer link',
    shareCopied:     'Gekopieerd ✓',
    shareOnX:        'Deel op X',
    shareOnLinkedIn: 'Deel op LinkedIn',
    commentsTitle:   'Reacties',
    commentsEmpty:   'Nog geen reacties. Wees de eerste.',
    commentsHidden:  'Je reactie is verstuurd en wacht op moderatie. Zodra Mark \'m goedkeurt verschijnt-ie hier.',
    commentsCount:   (n) => n === 1 ? '1 reactie' : `${n} reacties`,
    cFormHeading:    'Laat een reactie achter',
    cFormName:       'Naam',
    cFormEmail:      'E-mail',
    cFormEmailHint:  'Niet zichtbaar voor anderen — alleen voor moderatie en eventuele reactie van Mark.',
    cFormBody:       'Je reactie',
    cFormConsent:    'Ik ga akkoord dat mijn naam en reactie publiek worden getoond na moderatie. Mijn e-mail blijft privé. Zie het privacybeleid.',
    cFormConsentTextStored: 'Ik ga akkoord dat mijn naam en reactie publiek worden getoond na moderatie. Mijn e-mail blijft privé.',
    cFormSubmit:     'Plaats reactie',
    cFormSubmitting: 'Versturen…',
    cFormSuccess:    'Bedankt — je reactie wacht op moderatie.',
    cFormError:      'Er ging iets mis. Probeer het opnieuw.',
    cFormErrorRequired: 'Vul alle velden in en accepteer het privacybeleid.',
    cFormErrorEmail: 'Ongeldig e-mailadres.',
    cFormErrorRate:  'Te veel reacties vanaf dit adres. Probeer het over een uur opnieuw.',
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
    homeLink:        '← Back to markdekock.com',
    shareTitle:      'Share this post',
    shareCopy:       'Copy link',
    shareCopied:     'Copied ✓',
    shareOnX:        'Share on X',
    shareOnLinkedIn: 'Share on LinkedIn',
    commentsTitle:   'Comments',
    commentsEmpty:   'No comments yet. Be the first.',
    commentsHidden:  'Your comment was submitted and is awaiting moderation. Once Mark approves it, it appears here.',
    commentsCount:   (n) => n === 1 ? '1 comment' : `${n} comments`,
    cFormHeading:    'Leave a comment',
    cFormName:       'Name',
    cFormEmail:      'Email',
    cFormEmailHint:  'Not shown publicly — only for moderation and possible reply from Mark.',
    cFormBody:       'Your comment',
    cFormConsent:    'I agree that my name and comment will be publicly shown after moderation. My email stays private. See the privacy policy.',
    cFormConsentTextStored: 'I agree that my name and comment will be publicly shown after moderation. My email stays private.',
    cFormSubmit:     'Post comment',
    cFormSubmitting: 'Sending…',
    cFormSuccess:    'Thanks — your comment is awaiting moderation.',
    cFormError:      'Something went wrong. Please try again.',
    cFormErrorRequired: 'Fill in all fields and accept the privacy policy.',
    cFormErrorEmail: 'Invalid email address.',
    cFormErrorRate:  'Too many comments from this address. Try again in an hour.',
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
    homeLink:        '← Zurück zu markdekock.com',
    shareTitle:      'Diesen Beitrag teilen',
    shareCopy:       'Link kopieren',
    shareCopied:     'Kopiert ✓',
    shareOnX:        'Auf X teilen',
    shareOnLinkedIn: 'Auf LinkedIn teilen',
    commentsTitle:   'Kommentare',
    commentsEmpty:   'Noch keine Kommentare. Sei die Erste.',
    commentsHidden:  'Dein Kommentar wurde eingereicht und wartet auf Moderation. Sobald Mark ihn freigibt, erscheint er hier.',
    commentsCount:   (n) => n === 1 ? '1 Kommentar' : `${n} Kommentare`,
    cFormHeading:    'Kommentar hinterlassen',
    cFormName:       'Name',
    cFormEmail:      'E-Mail',
    cFormEmailHint:  'Nicht öffentlich sichtbar — nur für Moderation und mögliche Antwort von Mark.',
    cFormBody:       'Dein Kommentar',
    cFormConsent:    'Ich bin damit einverstanden, dass mein Name und Kommentar nach Moderation öffentlich angezeigt werden. Meine E-Mail bleibt privat. Siehe Datenschutzerklärung.',
    cFormConsentTextStored: 'Ich bin damit einverstanden, dass mein Name und Kommentar nach Moderation öffentlich angezeigt werden. Meine E-Mail bleibt privat.',
    cFormSubmit:     'Kommentar absenden',
    cFormSubmitting: 'Wird gesendet…',
    cFormSuccess:    'Danke — dein Kommentar wartet auf Moderation.',
    cFormError:      'Etwas ist schiefgegangen. Bitte versuche es erneut.',
    cFormErrorRequired: 'Fülle alle Felder aus und akzeptiere die Datenschutzerklärung.',
    cFormErrorEmail: 'Ungültige E-Mail-Adresse.',
    cFormErrorRate:  'Zu viele Kommentare von dieser Adresse. Versuche es in einer Stunde erneut.',
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
