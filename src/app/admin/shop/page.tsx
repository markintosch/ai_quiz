'use client'

import { useEffect, useState, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ShopProduct {
  id: string
  slug: string
  brand: string | null
  type: string
  active: boolean
  sort_order: number
  price_cents: number
  vat_rate: number
  cover_image_url: string | null
  // NL
  title: string
  tagline: string | null
  description: string | null
  delivery_notes: string | null
  // EN
  title_en: string | null
  tagline_en: string | null
  description_en: string | null
  delivery_notes_en: string | null
}

type EditState = Partial<ShopProduct>
type Tab = 'nl' | 'en'

// ── Helpers ───────────────────────────────────────────────────────────────────

function euro(cents: number) {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`
}

function typeBadge(type: string) {
  const map: Record<string, { bg: string; color: string }> = {
    pdf:          { bg: '#FEF9C3', color: '#854D0E' },
    webinar:      { bg: '#DBEAFE', color: '#1D4ED8' },
    course:       { bg: '#F3E8FF', color: '#7E22CE' },
    mentoring:    { bg: '#DCFCE7', color: '#166534' },
    workshop:     { bg: '#FFEDD5', color: '#C2410C' },
    samenwerking: { bg: '#F0FDF4', color: '#15803D' },
    bundle:       { bg: '#F1F5F9', color: '#475569' },
  }
  const s = map[type] ?? { bg: '#F1F5F9', color: '#64748B' }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {type}
    </span>
  )
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({
  product,
  onClose,
  onSaved,
}: {
  product: ShopProduct
  onClose: () => void
  onSaved: (updated: ShopProduct) => void
}) {
  const [form, setForm] = useState<EditState>({
    title: product.title,
    tagline: product.tagline ?? '',
    description: product.description ?? '',
    delivery_notes: product.delivery_notes ?? '',
    title_en: product.title_en ?? '',
    tagline_en: product.tagline_en ?? '',
    description_en: product.description_en ?? '',
    delivery_notes_en: product.delivery_notes_en ?? '',
    price_cents: product.price_cents,
    vat_rate: product.vat_rate,
    active: product.active,
    brand: product.brand ?? '',
    cover_image_url: product.cover_image_url ?? '',
  })
  const [tab, setTab] = useState<Tab>('nl')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof EditState, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/shop/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, ...form }),
      })
      if (!res.ok) throw new Error(await res.text())
      const updated = await res.json() as ShopProduct
      onSaved(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F0',
    fontSize: 13, color: '#0F172A', background: '#fff', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 4 }
  const fieldStyle: React.CSSProperties = { marginBottom: 14 }

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
        background: tab === t ? '#354E5E' : 'transparent',
        color: tab === t ? '#fff' : '#64748B',
      }}
    >{label}</button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{product.title}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>/{product.slug}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94A3B8', lineHeight: 1 }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflow: 'auto', padding: 24, flex: 1 }}>

          {/* Pricing & meta row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20, padding: 16, background: '#F8FAFC', borderRadius: 10 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Prijs (centen)</label>
              <input
                type="number"
                style={inputStyle}
                value={form.price_cents ?? 0}
                onChange={e => set('price_cents', parseInt(e.target.value) || 0)}
              />
              <p style={{ fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>{euro(form.price_cents ?? 0)} excl. BTW</p>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>BTW % (bv. 21)</label>
              <input
                type="number"
                style={inputStyle}
                value={form.vat_rate ?? 21}
                onChange={e => set('vat_rate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Brand</label>
              <input
                type="text"
                style={inputStyle}
                value={form.brand ?? ''}
                placeholder="markdekock / frank"
                onChange={e => set('brand', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.active ?? false}
                onChange={e => set('active', e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              Actief (zichtbaar in shop)
            </label>
          </div>

          {/* Language tabs */}
          <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 8, padding: 4, width: 'fit-content', marginBottom: 20 }}>
            {tabBtn('nl', '🇳🇱 Nederlands')}
            {tabBtn('en', '🇬🇧 English')}
          </div>

          {tab === 'nl' && (
            <>
              <div style={fieldStyle}>
                <label style={labelStyle}>Titel (NL)</label>
                <input type="text" style={inputStyle} value={form.title ?? ''} onChange={e => set('title', e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Tagline (NL)</label>
                <input type="text" style={inputStyle} value={form.tagline ?? ''} onChange={e => set('tagline', e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Beschrijving (NL) — HTML toegestaan</label>
                <textarea
                  rows={8}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
                  value={form.description ?? ''}
                  onChange={e => set('description', e.target.value)}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Levering / afspraken (NL)</label>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={form.delivery_notes ?? ''}
                  onChange={e => set('delivery_notes', e.target.value)}
                />
              </div>
            </>
          )}

          {tab === 'en' && (
            <>
              <div style={fieldStyle}>
                <label style={labelStyle}>Title (EN)</label>
                <input type="text" style={inputStyle} value={form.title_en ?? ''} onChange={e => set('title_en', e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Tagline (EN)</label>
                <input type="text" style={inputStyle} value={form.tagline_en ?? ''} onChange={e => set('tagline_en', e.target.value)} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Description (EN) — HTML allowed</label>
                <textarea
                  rows={8}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
                  value={form.description_en ?? ''}
                  onChange={e => set('description_en', e.target.value)}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Delivery / notes (EN)</label>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={form.delivery_notes_en ?? ''}
                  onChange={e => set('delivery_notes_en', e.target.value)}
                />
              </div>
            </>
          )}

          <div style={fieldStyle}>
            <label style={labelStyle}>Cover image URL</label>
            <input
              type="text"
              style={inputStyle}
              value={form.cover_image_url ?? ''}
              placeholder="https://..."
              onChange={e => set('cover_image_url', e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#F8FAFC' }}>
          {error && <p style={{ fontSize: 13, color: '#EF4444', margin: 0 }}>{error}</p>}
          {!error && <span />}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
              Annuleer
            </button>
            <button
              onClick={save}
              disabled={saving}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#354E5E', color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Opslaan…' : 'Opslaan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShopAdminPage() {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ShopProduct | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/shop/products')
      .then(r => r.json())
      .then((d: ShopProduct[]) => { setProducts(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const onSaved = (updated: ShopProduct) => {
    setProducts(ps => ps.map(p => p.id === updated.id ? updated : p))
    setEditing(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>🛍️ Shop — Producten</h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Bewerk content en prijzen voor markdekock.com/shop</p>
        </div>
        <button onClick={load} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', color: '#374151', fontWeight: 600 }}>
          ↻ Vernieuwen
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8', fontSize: 14 }}>Laden…</p>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🛒</p>
          <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>Geen producten gevonden.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 100px 80px', gap: 12, padding: '8px 16px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span>Product</span>
            <span>Type / Brand</span>
            <span>Prijs</span>
            <span>BTW</span>
            <span>Status</span>
            <span></span>
          </div>

          {products.map(p => (
            <div
              key={p.id}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 80px 100px 80px', gap: 12, padding: '14px 16px', background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', alignItems: 'center' }}
            >
              {/* Title + slug */}
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{p.title}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>/{p.slug}</p>
                {p.tagline && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748B' }}>{p.tagline}</p>}
                {!p.title_en && (
                  <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, marginTop: 4, display: 'inline-block' }}>⚠ EN tekst ontbreekt</span>
                )}
              </div>

              {/* Type + brand */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {typeBadge(p.type)}
                {p.brand && <span style={{ fontSize: 11, color: '#64748B' }}>{p.brand}</span>}
              </div>

              {/* Price */}
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{euro(p.price_cents)}</div>

              {/* VAT */}
              <div style={{ fontSize: 13, color: '#64748B' }}>{p.vat_rate}%</div>

              {/* Active */}
              <div>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                  background: p.active ? '#DCFCE7' : '#F1F5F9',
                  color: p.active ? '#166534' : '#94A3B8',
                }}>
                  {p.active ? 'Actief' : 'Inactief'}
                </span>
              </div>

              {/* Edit */}
              <div>
                <button
                  onClick={() => setEditing(p)}
                  style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', color: '#354E5E', fontWeight: 700 }}
                >
                  Bewerk
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}
