'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_NL = [
  { href: '/sannah',         label: 'Werk' },
  { href: '/sannah/over',    label: 'Over' },
  { href: '/sannah/cv',      label: 'CV' },
  { href: '/sannah/contact', label: 'Contact' },
]
const NAV_EN = [
  { href: '/sannah/en',         label: 'Work' },
  { href: '/sannah/en/over',    label: 'About' },
  { href: '/sannah/en/cv',      label: 'CV' },
  { href: '/sannah/en/contact', label: 'Contact' },
]

export default function SannahNav() {
  const pathname = usePathname() ?? '/sannah'
  const isEn = pathname.startsWith('/sannah/en')
  const nav = isEn ? NAV_EN : NAV_NL

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'saturate(180%) blur(8px)',
      borderBottom: '1px solid #ececec',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '14px 24px',
        display: 'flex', alignItems: 'baseline', gap: 28, flexWrap: 'wrap',
      }}>
        <Link href={isEn ? '/sannah/en' : '/sannah'} style={{
          fontSize: 14, fontWeight: 600, color: '#1a1a1a',
          textDecoration: 'none', letterSpacing: '0.02em',
        }}>
          Sannah De&nbsp;Zwart
        </Link>

        <div style={{ display: 'flex', gap: 22, marginLeft: 'auto', alignItems: 'baseline' }}>
          {nav.map(n => {
            const isActive = pathname === n.href || (n.href !== '/sannah' && n.href !== '/sannah/en' && pathname.startsWith(n.href))
            return (
              <Link key={n.href} href={n.href} style={{
                fontSize: 13, color: '#1a1a1a',
                textDecoration: 'none',
                opacity: isActive ? 1 : 0.65,
                fontWeight: isActive ? 500 : 400,
              }}>
                {n.label}
              </Link>
            )
          })}
          <span style={{ color: '#d0d0d0', fontSize: 12 }}>·</span>
          <Link href={isEn ? '/sannah' : '/sannah/en'} style={{
            fontSize: 12, color: '#1a1a1a',
            textDecoration: 'none', opacity: 0.6,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {isEn ? 'NL' : 'EN'}
          </Link>
        </div>
      </div>
    </nav>
  )
}
