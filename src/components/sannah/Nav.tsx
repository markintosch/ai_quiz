'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SannahThemeToggle from './ThemeToggle'

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
      background: 'var(--sannah-nav-bg)',
      backdropFilter: 'saturate(180%) blur(8px)',
      borderBottom: '1px solid var(--sannah-border)',
      transition: 'background-color 0.25s, border-color 0.25s',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
      }}>
        <Link href={isEn ? '/sannah/en' : '/sannah'} style={{
          fontSize: 14, fontWeight: 600, color: 'var(--sannah-text)',
          textDecoration: 'none', letterSpacing: '0.02em',
        }}>
          Sannah de&nbsp;Zwart
        </Link>

        <div style={{ display: 'flex', gap: 22, marginLeft: 'auto', alignItems: 'center' }}>
          {nav.map(n => {
            const isActive = pathname === n.href || (n.href !== '/sannah' && n.href !== '/sannah/en' && pathname.startsWith(n.href))
            return (
              <Link key={n.href} href={n.href} style={{
                fontSize: 13, color: 'var(--sannah-text)',
                textDecoration: 'none',
                opacity: isActive ? 1 : 0.65,
                fontWeight: isActive ? 500 : 400,
              }}>
                {n.label}
              </Link>
            )
          })}
          <span style={{ color: 'var(--sannah-border)', fontSize: 12 }}>·</span>
          <Link href={isEn ? '/sannah' : '/sannah/en'} style={{
            fontSize: 12, color: 'var(--sannah-text)',
            textDecoration: 'none', opacity: 0.6,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {isEn ? 'NL' : 'EN'}
          </Link>
          <SannahThemeToggle />
        </div>
      </div>
    </nav>
  )
}
