/**
 * src/lib/seo/structured-data.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable JSON-LD structured-data builders.
 * Standard routine: import the builder you need, call it in any layout,
 * render with <StructuredData /> or as a raw <script> tag.
 *
 * Usage (in a layout.tsx):
 *   import { buildPersonSchema, buildProfessionalServiceSchema } from '@/lib/seo/structured-data'
 *   const jsonLd = { '@context': 'https://schema.org', '@graph': [buildPersonSchema(...), ...] }
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FAQItem {
  question: string
  answer: string
}

export interface PersonConfig {
  name: string
  url: string
  jobTitle: string
  description: string
  orgName: string
  orgUrl?: string
  country?: string
  linkedin?: string
  knowsAbout?: string[]
}

export interface ServiceConfig {
  name: string
  url: string
  description: string
  providerName: string
  country?: string
  languages?: string[]
  freeIntake?: boolean
}

export interface WebAppConfig {
  name: string
  url: string
  description: string
  authors: Array<{ name: string; jobTitle?: string; url?: string; orgName?: string }>
  orgName: string
  locale?: string
}

export interface OrgConfig {
  name: string
  url: string
  id?: string
}

// ── Person ────────────────────────────────────────────────────────────────────

export function buildPersonSchema(p: PersonConfig) {
  return {
    '@type':      'Person',
    '@id':        `${p.url}/#person`,
    name:         p.name,
    url:          p.url,
    jobTitle:     p.jobTitle,
    description:  p.description,
    worksFor: {
      '@type': 'Organization',
      name:    p.orgName,
      ...(p.orgUrl ? { url: p.orgUrl } : {}),
    },
    address: {
      '@type':          'PostalAddress',
      addressCountry:   p.country ?? 'NL',
    },
    ...(p.knowsAbout?.length ? { knowsAbout: p.knowsAbout } : {}),
    ...(p.linkedin ? { sameAs: [p.linkedin] } : {}),
  }
}

// ── ProfessionalService ───────────────────────────────────────────────────────

export function buildProfessionalServiceSchema(s: ServiceConfig) {
  return {
    '@type':       'ProfessionalService',
    '@id':         `${s.url}/#service`,
    name:          s.name,
    url:           s.url,
    description:   s.description,
    provider: {
      '@type': 'Person',
      name:    s.providerName,
    },
    areaServed: {
      '@type': 'Country',
      name:    s.country ?? 'Netherlands',
    },
    ...(s.languages?.length ? { availableLanguage: s.languages } : {}),
    ...(s.freeIntake ? {
      offers: {
        '@type':         'Offer',
        price:           '0',
        priceCurrency:   'EUR',
        description:     'Gratis intakegesprek',
        availability:    'https://schema.org/InStock',
      },
    } : {}),
  }
}

// ── WebApplication ────────────────────────────────────────────────────────────

export function buildWebApplicationSchema(a: WebAppConfig) {
  return {
    '@type':               'WebApplication',
    '@id':                 `${a.url}/#app`,
    name:                  a.name,
    url:                   a.url,
    description:           a.description,
    applicationCategory:   'BusinessApplication',
    operatingSystem:       'Web',
    inLanguage:            a.locale ?? 'nl',
    offers: {
      '@type':         'Offer',
      price:           '0',
      priceCurrency:   'EUR',
      availability:    'https://schema.org/InStock',
    },
    author: a.authors.map(au => ({
      '@type':   'Person',
      name:      au.name,
      ...(au.jobTitle ? { jobTitle: au.jobTitle } : {}),
      ...(au.url      ? { url:      au.url      } : {}),
      ...(au.orgName  ? { worksFor: { '@type': 'Organization', name: au.orgName } } : {}),
    })),
    publisher: {
      '@type': 'Organization',
      name:    a.orgName,
    },
  }
}

// ── Organization ──────────────────────────────────────────────────────────────

export function buildOrganizationSchema(o: OrgConfig) {
  return {
    '@type': 'Organization',
    '@id':   o.id ?? `${o.url}/#org`,
    name:    o.name,
    url:     o.url,
  }
}

// ── WebSite ───────────────────────────────────────────────────────────────────

export function buildWebSiteSchema(url: string, name: string) {
  return {
    '@type':    'WebSite',
    '@id':      `${url}/#website`,
    url,
    name,
    inLanguage: ['nl', 'en'],
  }
}

// ── FAQPage ───────────────────────────────────────────────────────────────────

export function buildFAQSchema(items: FAQItem[]) {
  return {
    '@type':      'FAQPage',
    mainEntity:   items.map(item => ({
      '@type':          'Question',
      name:             item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text:    item.answer,
      },
    })),
  }
}

// ── Helper: render as <script> tag string (for dangerouslySetInnerHTML) ───────

export function serializeJsonLd(graph: object[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph':   graph,
  })
}
