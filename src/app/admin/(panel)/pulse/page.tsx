'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { PulseTheme } from '@/types/pulse'
import { getPulsePhase } from '@/types/pulse'

type ThemeWithCounts = PulseTheme & {
  entity_count: number
  response_count: number
}

const phaseLabel: Record<string, string> = {
  teaser: 'Teaser',
  presub: 'Suggesties',
  active: 'Actief',
  closed: 'Gesloten',
}
const phaseBg: Record<string, string> = {
  teaser: '#f4f4f4',
  presub: '#fef9c3',
  active: '#dcfce7',
  closed: '#f3f4f6',
}
const phaseColor: Record<string, string> = {
  teaser: '#616162',
  presub: '#854d0e',
  active: '#166534',
  closed: '#9ca3af',
}

export default function PulseAdminPage() {
  const [themes, setThemes] = useState<ThemeWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalResponses, setTotalResponses] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/pulse/themes')
        if (!res.ok) throw new Error('Kon themas niet laden.')
        const json = (await res.json()) as { themes: ThemeWithCounts[] }
        setThemes(json.themes ?? [])
        setTotalResponses(
          (json.themes ?? []).reduce((sum, t) => sum + (t.response_count ?? 0), 0),
        )
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Er ging iets mis.')
      }
      setLoading(false)
    }
    void load()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">De Machine Pulse</h1>
          <p className="text-sm text-gray-500 mt-1">Redactioneel dashboard</p>
        </div>
        <Link
          href="/admin/pulse/themes/new"
          className="inline-flex items-center px-4 py-2 bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          Nieuw thema aanmaken →
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Actieve thema&apos;s</p>
          <p className="text-2xl font-bold text-gray-900">
            {themes.filter((t) => t.published).length}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Totaal thema&apos;s</p>
          <p className="text-2xl font-bold text-gray-900">{themes.length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Totaal beoordelingen</p>
          <p className="text-2xl font-bold text-gray-900">{totalResponses.toLocaleString('nl-NL')}</p>
        </div>
      </div>

      {loading && <p className="text-gray-500">Laden...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && themes.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Nog geen thema&apos;s aangemaakt.</p>
          <Link href="/admin/pulse/themes/new" className="text-brand underline mt-2 inline-block">
            Maak het eerste thema →
          </Link>
        </div>
      )}

      {themes.length > 0 && (
        <div className="border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Thema</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Fase</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Entities</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Reacties</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Sluit</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {themes.map((theme, i) => {
                const phase = getPulsePhase(theme)
                return (
                  <tr
                    key={theme.id}
                    className={i < themes.length - 1 ? 'border-b border-gray-200' : ''}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{theme.title}</div>
                      <div className="text-gray-500 text-xs">{theme.slug}</div>
                      {!theme.published && (
                        <span className="text-xs text-gray-400 italic">niet gepubliceerd</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        style={{
                          background: phaseBg[phase],
                          color: phaseColor[phase],
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '2px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {phaseLabel[phase]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{theme.entity_count}</td>
                    <td className="px-4 py-3 text-gray-700">{theme.response_count.toLocaleString('nl-NL')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {theme.closes_at
                        ? new Date(theme.closes_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 items-center">
                        <Link
                          href={`/admin/pulse/themes/${theme.id}`}
                          className="text-brand text-xs hover:underline"
                        >
                          Beheer
                        </Link>
                        <Link
                          href={`/pulse/${theme.slug}`}
                          target="_blank"
                          className="text-gray-500 text-xs hover:underline"
                        >
                          Bekijk ↗
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
