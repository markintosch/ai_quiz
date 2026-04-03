'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const INK    = '#0F172A'
const NAVY   = '#1E3A5F'
const ACCENT = '#1D4ED8'
const WARM   = '#D97706'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'
const LIGHT  = '#F8FAFC'
const ff     = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"

type Lang = 'nl' | 'en'

const UI = {
  nl: {
    back: '← Alle producten',
    register: 'Aanmelden',
    inclVat: 'incl. BTW',
    exclVat: 'excl. BTW',
    whatYouGet: 'WAT JE KRIJGT',
    contentTitle: 'Inhoud & details',
    delivery: 'LEVERING',
    deliveryTitle: 'Hoe ontvang je dit?',
    nameLabel: 'Naam', namePlaceholder: 'Jouw volledige naam',
    emailLabel: 'E-mailadres', emailPlaceholder: 'jouw@email.nl',
    terms: 'Ik ga akkoord met de ',
    termsLink: 'algemene voorwaarden',
    paying: 'Bezig met doorsturen...',
    payBtn: 'Betaal nu via Mollie →',
    notFound: 'Product niet gevonden',
    loading: 'Laden...',
    collab: 'Samenwerking',
  },
  en: {
    back: '← All products',
    register: 'Register',
    inclVat: 'incl. VAT',
    exclVat: 'excl. VAT',
    whatYouGet: 'WHAT YOU GET',
    contentTitle: 'Content & details',
    delivery: 'DELIVERY',
    deliveryTitle: 'How will you receive this?',
    nameLabel: 'Name', namePlaceholder: 'Your full name',
    emailLabel: 'Email address', emailPlaceholder: 'your@email.com',
    terms: 'I agree to the ',
    termsLink: 'terms and conditions',
    paying: 'Redirecting...',
    payBtn: 'Pay now via Mollie →',
    notFound: 'Product not found',
    loading: 'Loading...',
    collab: 'Collaboration',
  },
}

interface ShopProduct {
  id: string
  slug: string
  brand: string
  title: string
  tagline: string | null
  description: string | null
  title_en: string | null
  tagline_en: string | null
  description_en: string | null
  price_cents: number
  vat_rate: number
  type: string
  delivery_type: string
  delivery_notes: string | null
  delivery_notes_en: string | null
}

function formatPrice(cents: number): string {
  return '€' + (cents / 100).toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatVat(rate: number): string {
  return Math.round(rate * 100) + '%'
}

function typeAccent(type: string): string {
  if (type === 'mentoring') return WARM
  if (type === 'workshop') return '#059669'
  if (type === 'samenwerking') return '#7C3AED'
  return ACCENT
}

interface CheckoutFormProps {
  product: ShopProduct
  lang: Lang
  isEmbed?: boolean
  embedRef?: string
}

function CheckoutForm({ product, lang, isEmbed = false, embedRef }: CheckoutFormProps) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ui = UI[lang]
  const accent = typeAccent(product.type)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!terms) { setError(lang === 'nl' ? 'Accepteer de algemene voorwaarden om door te gaan.' : 'Please accept the terms and conditions to continue.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/shop/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug: product.slug, customerName: name, customerEmail: email }),
      })
      const data = await res.json() as { checkoutUrl?: string; orderId?: string; error?: string }
      if (!res.ok || !data.checkoutUrl) { setError(data.error ?? (lang === 'nl' ? 'Er is iets misgegaan.' : 'Something went wrong.')); setLoading(false); return }
      const successUrl = isEmbed && embedRef
        ? data.checkoutUrl.replace(/redirectUrl=[^&]+/, `redirectUrl=${encodeURIComponent(`${window.location.origin}/shop/success/${data.orderId}?ref=${embedRef}`)}`)
        : data.checkoutUrl
      window.location.href = successUrl
    } catch { setError(lang === 'nl' ? 'Er is iets misgegaan.' : 'Something went wrong.'); setLoading(false) }
  }

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '12px 14px',
    border: `1px solid ${BORDER}`, fontSize: '15px', fontFamily: ff,
    color: INK, background: '#ffffff', boxSizing: 'border-box', outline: 'none', borderRadius: '2px',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600, color: BODY, marginBottom: '6px', fontFamily: ff,
  }

  return (
    <div style={{ background: LIGHT, border: `1px solid ${BORDER}`, borderTop: `3px solid ${accent}`, padding: '32px', fontFamily: ff }}>
      <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: INK }}>{ui.register}</h3>
      <p style={{ margin: '0 0 24px' }}>
        <span style={{ fontSize: '24px', fontWeight: 700, color: accent }}>{formatPrice(product.price_cents)}</span>
        <span style={{ fontSize: '12px', color: MUTED, marginLeft: '6px' }}>{ui.inclVat}</span>
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle} htmlFor="name">{ui.nameLabel}</label>
          <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder={ui.namePlaceholder} style={inputStyle}
            onFocus={e => { (e.target as HTMLInputElement).style.outline = `2px solid ${accent}`; (e.target as HTMLInputElement).style.outlineOffset = '1px' }}
            onBlur={e => { (e.target as HTMLInputElement).style.outline = 'none' }} />
        </div>
        <div>
          <label style={labelStyle} htmlFor="email">{ui.emailLabel}</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={ui.emailPlaceholder} style={inputStyle}
            onFocus={e => { (e.target as HTMLInputElement).style.outline = `2px solid ${accent}`; (e.target as HTMLInputElement).style.outlineOffset = '1px' }}
            onBlur={e => { (e.target as HTMLInputElement).style.outline = 'none' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <input id="terms" type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
            style={{ marginTop: '2px', accentColor: accent, width: '16px', height: '16px', flexShrink: 0 }} />
          <label htmlFor="terms" style={{ fontSize: '13px', color: BODY, fontFamily: ff, cursor: 'pointer', lineHeight: 1.5 }}>
            {ui.terms}
            <a href="/voorwaarden" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'underline' }}>{ui.termsLink}</a>
          </label>
        </div>
        {error && <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontFamily: ff }}>{error}</p>}
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#9ca3af' : accent, color: '#ffffff', border: 'none', borderRadius: '2px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: ff, transition: 'background 0.15s ease' }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = NAVY }}
          onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = accent }}>
          {loading ? ui.paying : ui.payBtn}
        </button>
      </form>
    </div>
  )
}

function ProductPageInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string
  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en'].includes(rawLang) ? rawLang : 'nl') as Lang
  const ui = UI[lang]
  const switchLang = (l: Lang) => router.replace(`/shop/${slug}?lang=${l}`)

  const [product, setProduct] = useState<ShopProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/shop/products/${slug}`)
      .then(r => { if (!r.ok) { setNotFound(true); setLoading(false); return null } return r.json() as Promise<ShopProduct> })
      .then(data => { if (data) { setProduct(data); setLoading(false) } })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [slug])

  if (loading) return <main style={{ fontFamily: ff, padding: '60px 24px', textAlign: 'center', color: MUTED }}>{ui.loading}</main>
  if (notFound || !product) {
    return (
      <main style={{ fontFamily: ff, padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ color: INK }}>{ui.notFound}</h1>
        <Link href={`/shop?lang=${lang}`} style={{ color: ACCENT }}>{ui.back}</Link>
      </main>
    )
  }

  const title       = (lang === 'en' && product.title_en)         ? product.title_en         : product.title
  const tagline     = (lang === 'en' && product.tagline_en)       ? product.tagline_en       : product.tagline
  const description = (lang === 'en' && product.description_en)   ? product.description_en   : product.description
  const delivNotes  = (lang === 'en' && product.delivery_notes_en) ? product.delivery_notes_en : product.delivery_notes
  const accent      = typeAccent(product.type)

  return (
    <main style={{ fontFamily: ff }}>
      {/* Hero */}
      <section style={{ background: INK, padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <Link href={`/shop?lang=${lang}`} style={{ fontSize: '13px', color: MUTED, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = MUTED }}>
              {ui.back}
            </Link>
            {/* Lang toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en'] as Lang[]).map(l => (
                <button key={l} onClick={() => switchLang(l)} style={{ padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: lang === l ? '#fff' : 'transparent', color: lang === l ? INK : MUTED, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ display: 'inline-block', background: `${accent}22`, color: accent, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 12px' }}>
              {product.type}
            </span>
            {product.brand === 'frank-meeuwsen' && (
              <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', color: MUTED, fontSize: '11px', fontWeight: 600, padding: '4px 12px' }}>Frank Meeuwsen</span>
            )}
            {product.brand === 'mark-frank' && (
              <span style={{ display: 'inline-block', background: 'rgba(124,58,237,0.2)', color: '#A78BFA', fontSize: '11px', fontWeight: 600, padding: '4px 12px' }}>Mark de Kock & Frank Meeuwsen</span>
            )}
          </div>

          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.15, maxWidth: '640px' }}>
            {title}
          </h1>
          {tagline && <p style={{ margin: '0 0 28px', fontSize: '18px', color: MUTED, lineHeight: 1.5, maxWidth: '540px' }}>{tagline}</p>}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '28px' }}>
            <span style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF' }}>{formatPrice(product.price_cents)}</span>
            <span style={{ fontSize: '13px', color: MUTED }}>excl. {formatVat(product.vat_rate)} {lang === 'nl' ? 'BTW' : 'VAT'}</span>
          </div>
        </div>
      </section>

      {/* Content + form */}
      <section style={{ background: '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="shop-product-outer">
          <div className="shop-product-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '0', alignItems: 'start' }}>
            {/* Left: content */}
            <div style={{ padding: 'clamp(48px, 6vw, 72px) clamp(24px, 5vw, 80px)' }}>
              {description && (
                <div style={{ marginBottom: '48px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, fontWeight: 700 }}>{ui.whatYouGet}</p>
                  <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 700, color: INK }}>{ui.contentTitle}</h2>
                  <p style={{ margin: 0, fontSize: '16px', color: BODY, lineHeight: 1.75 }}>{description}</p>
                </div>
              )}
              {delivNotes && (
                <div style={{ marginBottom: '48px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: accent, fontWeight: 700 }}>{ui.delivery}</p>
                  <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 700, color: INK }}>{ui.deliveryTitle}</h2>
                  <p style={{ margin: 0, fontSize: '16px', color: BODY, lineHeight: 1.75 }}>{delivNotes}</p>
                </div>
              )}
              {/* Mobile form */}
              <div className="shop-form-mobile">
                <CheckoutForm product={product} lang={lang} />
              </div>
            </div>
            {/* Right: sticky form — desktop only */}
            <div className="shop-form-sticky" style={{ position: 'sticky', top: '24px', padding: 'clamp(48px, 6vw, 72px) clamp(24px, 4vw, 48px) clamp(48px, 6vw, 72px) 0' }}>
              <CheckoutForm product={product} lang={lang} />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 899px) {
          .shop-product-grid { grid-template-columns: 1fr !important; }
          .shop-form-sticky { display: none !important; }
          .shop-form-mobile { display: block; }
        }
        @media (min-width: 900px) { .shop-form-mobile { display: none; } }
      `}</style>
    </main>
  )
}

export default function ProductPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100vh', background: INK }} />}>
      <ProductPageInner />
    </Suspense>
  )
}
