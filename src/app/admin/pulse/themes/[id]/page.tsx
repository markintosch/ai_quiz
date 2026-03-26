'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { PulseTheme, PulseEntity, PulseDimension, PulseAgentProfile } from '@/types/pulse'
import { getPulsePhase } from '@/types/pulse'

type Tab = 'instellingen' | 'entities' | 'dimensies' | 'responses' | 'publicatie'

type EntityRow = PulseEntity & { agentProfile?: PulseAgentProfile }

interface AnomalyFlag {
  id: string
  flag_type: string
  severity: string
  entity_id: string | null
  theme_id: string | null
  details: Record<string, unknown>
  created_at: string
}

export default function ThemeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [activeTab, setActiveTab] = useState<Tab>('instellingen')
  const [theme, setTheme] = useState<PulseTheme | null>(null)
  const [entities, setEntities] = useState<EntityRow[]>([])
  const [dimensions, setDimensions] = useState<PulseDimension[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Settings form
  const [settingsForm, setSettingsForm] = useState<Partial<PulseTheme>>({})
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Entity ingest
  const [ingestUrl, setIngestUrl] = useState('')
  const [ingesting, setIngesting] = useState(false)
  const [ingestResult, setIngestResult] = useState<{ entity: PulseEntity; agentProfile: PulseAgentProfile | null } | null>(null)
  const [ingestError, setIngestError] = useState('')
  const [ingestEntityForm, setIngestEntityForm] = useState<Partial<PulseEntity>>({})
  const [ingestSaving, setIngestSaving] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Dimensions
  const [newDim, setNewDim] = useState({ slug: '', label: '', anchor_low: '', anchor_high: '' })
  const [dimSaving, setDimSaving] = useState(false)

  // Responses / anomalies
  const [anomalyFlags, setAnomalyFlags] = useState<AnomalyFlag[]>([])
  const [anomalyLoading, setAnomalyLoading] = useState(false)
  const [responseCount, setResponseCount] = useState(0)

  const loadData = useCallback(async () => {
    try {
      const [themeRes, entRes] = await Promise.all([
        fetch(`/api/admin/pulse/themes/${id}`),
        fetch(`/api/admin/pulse/entities?themeId=${id}`),
      ])

      if (!themeRes.ok) throw new Error('Thema niet gevonden.')
      const themeJson = (await themeRes.json()) as { theme: PulseTheme; dimensions: PulseDimension[] }
      setTheme(themeJson.theme)
      setSettingsForm(themeJson.theme)
      setDimensions(themeJson.dimensions ?? [])

      const entJson = entRes.ok ? (await entRes.json() as { entities: PulseEntity[] }) : { entities: [] }
      setEntities(entJson.entities ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Er ging iets mis.')
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // Fetch response count on responses tab
  useEffect(() => {
    if (activeTab !== 'responses' || !theme) return
    // Count from entities
    const total = entities.length
    setResponseCount(total) // placeholder — we'd fetch actual count from API
  }, [activeTab, theme, entities.length])

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaving(true)
    try {
      const res = await fetch(`/api/admin/pulse/themes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      })
      if (res.ok) {
        const json = (await res.json()) as { theme: PulseTheme }
        setTheme(json.theme)
        setSettingsSaved(true)
        setTimeout(() => setSettingsSaved(false), 2500)
      }
    } catch { /* noop */ }
    setSettingsSaving(false)
  }

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIngestError('')
    setIngestResult(null)
    if (!ingestUrl.startsWith('http')) {
      setIngestError('Voer een geldige URL in.')
      return
    }
    setIngesting(true)
    try {
      const res = await fetch('/api/admin/pulse/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ingestUrl, themeId: id }),
      })
      const json = (await res.json()) as { entity?: PulseEntity; agentProfile?: PulseAgentProfile; error?: string }
      if (!res.ok) {
        setIngestError(json.error ?? 'Er ging iets mis.')
        setIngesting(false)
        return
      }
      setIngestResult({ entity: json.entity!, agentProfile: json.agentProfile ?? null })
      setIngestEntityForm(json.entity!)
    } catch {
      setIngestError('Er ging iets mis.')
    }
    setIngesting(false)
  }

  const handleIngestSave = async () => {
    if (!ingestResult) return
    setIngestSaving(true)
    try {
      await fetch(`/api/admin/pulse/entities/${ingestResult.entity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingestEntityForm),
      })
      setIngestResult(null)
      setIngestUrl('')
      setIngestEntityForm({})
      await loadData()
    } catch { /* noop */ }
    setIngestSaving(false)
  }

  const handleEntityDelete = async (entityId: string) => {
    if (!confirm('Zeker weten? Dit verwijdert ook alle beoordelingen voor dit item.')) return
    await fetch(`/api/admin/pulse/entities/${entityId}`, { method: 'DELETE' })
    await loadData()
  }

  const handleEntityStatusChange = async (entityId: string, newStatus: string) => {
    await fetch(`/api/admin/pulse/entities/${entityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingest_status: newStatus }),
    })
    await loadData()
  }

  const handleDimAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setDimSaving(true)
    try {
      const res = await fetch(`/api/admin/pulse/themes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimensions: [...dimensions, {
            ...newDim,
            sort_order: dimensions.length,
          }],
        }),
      })
      if (res.ok) {
        await loadData()
        setNewDim({ slug: '', label: '', anchor_low: '', anchor_high: '' })
      }
    } catch { /* noop */ }
    setDimSaving(false)
  }

  const handleCheckAnomalies = async () => {
    setAnomalyLoading(true)
    try {
      const res = await fetch(`/api/admin/pulse/anomalies?themeId=${id}`)
      const json = (await res.json()) as { flags: AnomalyFlag[] }
      setAnomalyFlags(json.flags ?? [])
    } catch { /* noop */ }
    setAnomalyLoading(false)
  }

  const handlePublishToggle = async () => {
    if (!theme) return
    const newPublished = !theme.published
    const res = await fetch(`/api/admin/pulse/themes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: newPublished }),
    })
    if (res.ok) {
      setTheme((prev) => prev ? { ...prev, published: newPublished } : prev)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je dit thema wilt verwijderen? Dit is onomkeerbaar.')) return
    await fetch(`/api/admin/pulse/themes/${id}`, { method: 'DELETE' })
    router.push('/admin/pulse')
  }

  const inputCls = 'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  const TABS: { key: Tab; label: string }[] = [
    { key: 'instellingen', label: 'Instellingen' },
    { key: 'entities', label: 'Entities' },
    { key: 'dimensies', label: 'Dimensies' },
    { key: 'responses', label: 'Responses' },
    { key: 'publicatie', label: 'Publicatie' },
  ]

  const filteredEntities = statusFilter === 'all'
    ? entities
    : entities.filter((e) => e.ingest_status === statusFilter)

  if (loading) return <p className="text-gray-500">Laden...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (!theme) return null

  const phase = getPulsePhase(theme)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link href="/admin/pulse" className="hover:text-gray-700">Pulse</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{theme.title}</span>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-brand text-brand'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Instellingen ─────────────────────────────────────────────── */}
      {activeTab === 'instellingen' && (
        <form onSubmit={(e) => void handleSettingsSave(e)} className="max-w-2xl space-y-6">
          <div>
            <label className={labelCls}>Titel *</label>
            <input
              type="text"
              required
              value={settingsForm.title ?? ''}
              onChange={(e) => setSettingsForm((p) => ({ ...p, title: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input
              type="text"
              value={settingsForm.slug ?? ''}
              onChange={(e) => setSettingsForm((p) => ({ ...p, slug: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Beschrijving</label>
            <textarea
              rows={3}
              value={settingsForm.description ?? ''}
              onChange={(e) => setSettingsForm((p) => ({ ...p, description: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Redactionele intro</label>
            <textarea
              rows={4}
              value={settingsForm.editorial_intro ?? ''}
              onChange={(e) => setSettingsForm((p) => ({ ...p, editorial_intro: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Aflevering URL</label>
            <input
              type="url"
              value={settingsForm.linked_episode_url ?? ''}
              onChange={(e) => setSettingsForm((p) => ({ ...p, linked_episode_url: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Fasering</h2>
            <div className="grid grid-cols-2 gap-4">
              {([
                ['presub_open_at', 'Suggesties openen'],
                ['presub_close_at', 'Suggesties sluiten'],
                ['opens_at', 'Meting opent'],
                ['closes_at', 'Meting sluit'],
              ] as [keyof PulseTheme, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input
                    type="datetime-local"
                    value={settingsForm[key] ? String(settingsForm[key]).slice(0, 16) : ''}
                    onChange={(e) => setSettingsForm((p) => ({ ...p, [key]: e.target.value || null }))}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Disclaimer</label>
            <textarea
              rows={2}
              value={settingsForm.disclaimer_text ?? ''}
              onChange={(e) => setSettingsForm((p) => ({ ...p, disclaimer_text: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="flex gap-3 items-center">
            <button
              type="submit"
              disabled={settingsSaving}
              className="px-5 py-2 bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-50"
            >
              {settingsSaving ? 'Opslaan...' : 'Opslaan'}
            </button>
            {settingsSaved && <span className="text-green-600 text-sm">Opgeslagen ✓</span>}
          </div>
        </form>
      )}

      {/* ── Tab: Entities ─────────────────────────────────────────────────── */}
      {activeTab === 'entities' && (
        <div>
          {/* Ingest form */}
          <div className="bg-gray-50 border border-gray-200 p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Entity toevoegen via URL</h2>
            <form onSubmit={(e) => void handleIngest(e)} className="flex gap-3">
              <input
                type="url"
                placeholder="https://festivalnaam.nl"
                value={ingestUrl}
                onChange={(e) => setIngestUrl(e.target.value)}
                className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={ingesting}
                className="px-4 py-2 bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-50"
              >
                {ingesting ? 'Analyseren...' : 'Laden & analyseren →'}
              </button>
            </form>
            {ingestError && <p className="text-red-600 text-sm mt-2">{ingestError}</p>}

            {/* Agent profile review form */}
            {ingestResult && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Controleer en pas aan
                  {ingestResult.agentProfile && (
                    <span className="ml-2 text-xs text-green-600 font-normal">✓ AI-profiel gegenereerd</span>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {([
                    ['label', 'Naam *'],
                    ['entity_type', 'Type'],
                    ['subtitle', 'Subtitel'],
                    ['location_text', 'Locatie'],
                    ['edition_label', 'Editie'],
                    ['organizer_name', 'Organisator'],
                    ['source_url', 'Bron URL'],
                    ['hero_image_url', 'Hero afbeelding URL'],
                  ] as [keyof PulseEntity, string][]).map(([key, label]) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <input
                        type="text"
                        value={String(ingestEntityForm[key] ?? '')}
                        onChange={(e) => setIngestEntityForm((p) => ({ ...p, [key]: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className={labelCls}>Korte beschrijving</label>
                    <textarea
                      rows={3}
                      value={String(ingestEntityForm.description_short ?? '')}
                      onChange={(e) => setIngestEntityForm((p) => ({ ...p, description_short: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      value={String(ingestEntityForm.ingest_status ?? 'draft')}
                      onChange={(e) => setIngestEntityForm((p) => ({ ...p, ingest_status: e.target.value as PulseEntity['ingest_status'] }))}
                      className={inputCls}
                    >
                      <option value="draft">Draft</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                </div>

                {ingestResult.agentProfile?.confidence_flags && (
                  <div className="mt-4 flex gap-3 flex-wrap">
                    {Object.entries(ingestResult.agentProfile.confidence_flags).map(([flag, val]) =>
                      val ? (
                        <span key={flag} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1">
                          ⚠ {flag.replace(/_/g, ' ')}
                        </span>
                      ) : null,
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => void handleIngestSave()}
                    disabled={ingestSaving}
                    className="px-4 py-2 bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-50"
                  >
                    {ingestSaving ? 'Opslaan...' : 'Opslaan →'}
                  </button>
                  <button
                    onClick={() => { setIngestResult(null); setIngestUrl('') }}
                    className="px-4 py-2 border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Annuleer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status filter */}
          <div className="flex gap-2 mb-4">
            {['all', 'draft', 'reviewed', 'approved', 'live'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? 'bg-brand text-white border-brand'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? 'Alle' : s}
              </button>
            ))}
          </div>

          {/* Entities table */}
          {filteredEntities.length === 0 ? (
            <p className="text-gray-400 py-8">Geen entities.</p>
          ) : (
            <div className="border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Entity</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntities.map((entity, i) => (
                    <tr key={entity.id} className={i < filteredEntities.length - 1 ? 'border-b border-gray-200' : ''}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {(entity.hero_image_url || entity.og_image_url) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={entity.hero_image_url || entity.og_image_url || ''}
                              alt=""
                              className="w-12 h-8 object-cover flex-shrink-0"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{entity.label}</div>
                            {entity.subtitle && <div className="text-gray-500 text-xs">{entity.subtitle}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{entity.entity_type}</td>
                      <td className="px-4 py-3">
                        <select
                          value={entity.ingest_status}
                          onChange={(e) => void handleEntityStatusChange(entity.id, e.target.value)}
                          className="text-xs border border-gray-200 px-2 py-1 focus:outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="approved">Approved</option>
                          <option value="live">Live</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => void handleEntityDelete(entity.id)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Verwijder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Dimensies ────────────────────────────────────────────────── */}
      {activeTab === 'dimensies' && (
        <div className="max-w-2xl">
          {dimensions.length > 0 && (
            <div className="border border-gray-200 mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Label', 'Anker laag', 'Anker hoog', 'Volgorde'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dimensions.map((dim, i) => (
                    <tr key={dim.id} className={i < dimensions.length - 1 ? 'border-b border-gray-200' : ''}>
                      <td className="px-4 py-3 font-medium text-gray-900">{dim.label}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{dim.anchor_low}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{dim.anchor_high}</td>
                      <td className="px-4 py-3 text-gray-500">{dim.sort_order}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add dimension form */}
          <div className="bg-gray-50 border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Dimensie toevoegen</h3>
            <form onSubmit={(e) => void handleDimAdd(e)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Label *</label>
                  <input
                    type="text"
                    required
                    value={newDim.label}
                    onChange={(e) => setNewDim((p) => ({
                      ...p,
                      label: e.target.value,
                      slug: p.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    }))}
                    className={inputCls}
                    placeholder="bijv. Line-up"
                  />
                </div>
                <div>
                  <label className={labelCls}>Slug *</label>
                  <input
                    type="text"
                    required
                    value={newDim.slug}
                    onChange={(e) => setNewDim((p) => ({ ...p, slug: e.target.value }))}
                    className={inputCls}
                    placeholder="bijv. lineup"
                  />
                </div>
                <div>
                  <label className={labelCls}>Anker laag *</label>
                  <input
                    type="text"
                    required
                    value={newDim.anchor_low}
                    onChange={(e) => setNewDim((p) => ({ ...p, anchor_low: e.target.value }))}
                    className={inputCls}
                    placeholder="bijv. Veilig en voorspelbaar"
                  />
                </div>
                <div>
                  <label className={labelCls}>Anker hoog *</label>
                  <input
                    type="text"
                    required
                    value={newDim.anchor_high}
                    onChange={(e) => setNewDim((p) => ({ ...p, anchor_high: e.target.value }))}
                    className={inputCls}
                    placeholder="bijv. Verrassend en eigenzinnig"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={dimSaving}
                className="px-4 py-2 bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-50"
              >
                {dimSaving ? 'Toevoegen...' : 'Dimensie toevoegen →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Tab: Responses ───────────────────────────────────────────────── */}
      {activeTab === 'responses' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Entities (live)</p>
              <p className="text-2xl font-bold text-gray-900">
                {entities.filter((e) => e.ingest_status === 'live').length}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fase</p>
              <p className="text-lg font-semibold text-gray-900">{phase}</p>
            </div>
          </div>

          {/* Anomaly section */}
          <div className="border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Afwijkingsvlaggen</h3>
              <button
                onClick={() => void handleCheckAnomalies()}
                disabled={anomalyLoading}
                className="px-3 py-1 text-xs bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
              >
                {anomalyLoading ? 'Controleren...' : 'Controleer afwijkingen'}
              </button>
            </div>

            {anomalyFlags.length === 0 ? (
              <p className="text-gray-400 text-sm">Nog geen vlaggen. Klik op &quot;Controleer afwijkingen&quot; om te scannen.</p>
            ) : (
              <div className="space-y-2">
                {anomalyFlags.map((flag) => (
                  <div key={flag.id} className="flex items-center gap-3 py-2 border-b border-gray-100">
                    <span
                      className={`text-xs font-semibold px-2 py-1 ${
                        flag.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {flag.severity}
                    </span>
                    <span className="text-sm text-gray-700">{flag.flag_type}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(flag.created_at).toLocaleString('nl-NL')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">Totaal: {responseCount} entities geteld</p>
        </div>
      )}

      {/* ── Tab: Publicatie ──────────────────────────────────────────────── */}
      {activeTab === 'publicatie' && (
        <div className="max-w-lg space-y-6">
          <div className="bg-gray-50 border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Huidige status</h3>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-semibold px-3 py-1 ${
                  theme.published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {theme.published ? 'Gepubliceerd' : 'Niet gepubliceerd'}
              </span>
              <span className="text-xs text-gray-500">Fase: {phase}</span>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => void handlePublishToggle()}
              className={`px-4 py-2 text-sm font-medium border transition-colors ${
                theme.published
                  ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  : 'bg-brand text-white border-brand hover:bg-brand-dark'
              }`}
            >
              {theme.published ? 'Depubliceren' : 'Publiceren →'}
            </button>

            <Link
              href={`/pulse/${theme.slug}`}
              target="_blank"
              className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Preview ↗
            </Link>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-red-600 mb-3">Gevaarzone</h3>
            <button
              onClick={() => void handleDelete()}
              className="px-4 py-2 text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50"
            >
              Thema verwijderen
            </button>
            <p className="text-xs text-gray-400 mt-2">Dit verwijdert ook alle entities, dimensies en beoordelingen.</p>
          </div>
        </div>
      )}
    </div>
  )
}
