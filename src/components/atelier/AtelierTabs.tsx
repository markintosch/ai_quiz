// FILE: src/components/atelier/AtelierTabs.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Persistent top tab bar for /atelier/*. Active tab is detected from the
// pathname so deep links light up the right tab without prop-drilling.

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  // Note: Werkbank's match excludes /atelier/sessies because both start with
  // "/atelier/session" — the trailing slash on /atelier/session/ disambiguates.
  { href: '/atelier',           label: 'Werkbank',    match: (p: string) => p === '/atelier' || p === '/atelier/new' || p.startsWith('/atelier/session/') },
  { href: '/atelier/sessies',   label: 'Sessies',     match: (p: string) => p.startsWith('/atelier/sessies') },
  { href: '/atelier/merken',    label: 'Merken',      match: (p: string) => p.startsWith('/atelier/merken') },
  { href: '/atelier/icps',      label: 'ICP-groepen', match: (p: string) => p.startsWith('/atelier/icps') },
  { href: '/atelier/inzichten', label: 'Inzichten',   match: (p: string) => p.startsWith('/atelier/inzichten') },
] as const

export default function AtelierTabs() {
  const pathname = usePathname() || '/atelier'

  return (
    <nav className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto h-12 -mx-1 px-1">
          {TABS.map(tab => {
            const active = tab.match(pathname)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  'inline-flex items-center px-3 h-10 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ' +
                  (active
                    ? 'text-brand-dark bg-stone-100'
                    : 'text-slate-500 hover:text-brand-dark hover:bg-stone-50')
                }
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
