'use client'

// FILE: src/components/admin/AdminNav.tsx
// Grouped, collapsible admin nav with a fuzzy-search at the top.
// Collapse state persists in localStorage.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface NavItem {
  href:  string
  label: string
}

interface NavGroup {
  key:   string
  label: string
  items: NavItem[]
}

const GROUPS: NavGroup[] = [
  {
    key:   'quiz',
    label: 'AI Maturity Quiz',
    items: [
      { href: '/admin/dashboard',   label: 'Dashboard' },
      { href: '/admin/respondents', label: 'Respondents' },
      { href: '/admin/companies',   label: 'Companies' },
      { href: '/admin/cohorts',     label: 'Cohorts' },
      { href: '/admin/benchmark',   label: 'Benchmark' },
      { href: '/admin/stats',       label: 'Statistics' },
    ],
  },
  {
    key:   'ai_benchmark',
    label: 'AI Benchmark',
    items: [
      { href: '/admin/ai_benchmark',          label: 'Overzicht' },
      { href: '/admin/ai_benchmark/funnel',   label: 'Funnel' },
      { href: '/admin/ai_benchmark/writeins', label: 'Write-ins' },
    ],
  },
  {
    key:   'compass',
    label: 'Compass producten',
    items: [
      { href: '/admin/peri-compass',            label: '🧭 Peri-Compass' },
      { href: '/admin/cyber-compass',           label: '🛡 Cyber Compass · HCSS' },
      { href: '/admin/ai-leiderschap',          label: '🎯 AI Leiderschap' },
      { href: '/admin/ai-leiderschap/waitlist', label: '↳ Voorinschrijvingen' },
    ],
  },
  {
    key:   'clients',
    label: 'Klanten',
    items: [
      { href: '/admin/hcss', label: '🛡️ HCSS' },
    ],
  },
  {
    key:   'atelier',
    label: 'Atelier',
    items: [
      { href: '/admin/atelier',         label: 'Ops' },
      { href: '/admin/atelier/icps',    label: 'ICP knowledge base' },
      { href: '/admin/atelier/sources', label: 'Sources registry' },
    ],
  },
  {
    key:   'blog',
    label: 'Blog',
    items: [
      { href: '/admin/blog',             label: '📝 Posts' },
      { href: '/admin/blog/subscribers', label: 'Abonnees' },
      { href: '/admin/blog/comments',    label: 'Reacties' },
    ],
  },
  {
    key:   'commerce',
    label: 'Commerce & cursussen',
    items: [
      { href: '/admin/summercourse', label: '☀️ Summer Course' },
      { href: '/admin/shop',         label: '🛍 Shop' },
      { href: '/admin/games',        label: '🎮 Games' },
      { href: '/admin/interests',    label: 'Interests' },
    ],
  },
  {
    key:   'sites',
    label: 'Sites & portfolios',
    items: [
      { href: '/admin/sannah',       label: 'Sannah portfolio CMS' },
      { href: '/admin/sannahremco',  label: 'Sannah & Remco' },
      { href: '/admin/pulse',        label: 'Pulse' },
    ],
  },
  {
    key:   'global',
    label: 'Global',
    items: [
      { href: '/admin/content',  label: 'Homepage copy (CMS)' },
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/privacy',  label: 'Privacy & Data' },
    ],
  },
]

const STORAGE_KEY = 'admin-nav-collapsed-v1'

function readCollapsed(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function fuzzyMatch(haystack: string, needle: string): boolean {
  if (!needle) return true
  const h = haystack.toLowerCase()
  const n = needle.toLowerCase().trim()
  if (!n) return true
  // Simple substring match — good enough for short admin labels
  return h.includes(n)
}

export default function AdminNav() {
  const pathname = usePathname()
  const [query, setQuery]         = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [hydrated, setHydrated]   = useState(false)

  // Hydrate collapse state from localStorage after mount.
  useEffect(() => {
    setCollapsed(readCollapsed())
    setHydrated(true)
  }, [])

  function toggle(key: string) {
    setCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* */ }
      return next
    })
  }

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return GROUPS
    return GROUPS
      .map(g => ({
        ...g,
        items: g.items.filter(it => fuzzyMatch(it.label, query) || fuzzyMatch(g.label, query)),
      }))
      .filter(g => g.items.length > 0)
  }, [query])

  const isSearching = query.trim().length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Zoek… (alle 27 pagina's)"
          className="w-full px-3 py-2 text-sm bg-white/10 text-white placeholder-gray-400 border border-white/10 rounded-lg focus:outline-none focus:bg-white/15 focus:border-white/20"
        />
      </div>

      {/* Groups */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-1">
        {filteredGroups.map(group => {
          // While searching, force-expand. Otherwise use stored state.
          const expanded = isSearching || !collapsed[group.key]
          return (
            <div key={group.key}>
              <button
                type="button"
                onClick={() => !isSearching && toggle(group.key)}
                className="w-full flex items-center justify-between px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors"
                aria-expanded={expanded}
              >
                <span>{group.label}</span>
                {!isSearching && (
                  <span
                    aria-hidden
                    className="text-[10px] text-gray-500 transition-transform"
                    style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                  >
                    ▾
                  </span>
                )}
              </button>
              {expanded && (
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const active = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={
                          'block px-3 py-1.5 text-sm rounded-lg transition-colors ' +
                          (active
                            ? 'bg-brand-light text-white font-medium'
                            : 'text-gray-300 hover:text-white hover:bg-brand-light/60')
                        }
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {filteredGroups.length === 0 && (
          <p className="text-sm text-gray-400 px-3 py-4">
            Geen pagina gevonden voor "{query}"
          </p>
        )}
      </nav>

      {/* Hydration guard: render minimal until client-state loaded so we don't
          flash an open-then-collapsed state. */}
      {!hydrated && null}
    </div>
  )
}
