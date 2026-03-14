// FILE: src/app/admin/layout.tsx
import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton'

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/respondents', label: 'Respondents' },
  { href: '/admin/companies', label: 'Companies' },
  { href: '/admin/cohorts', label: 'Cohorts' },
  { href: '/admin/benchmark', label: 'Benchmark' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-brand flex flex-col">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <p className="text-brand-accent font-bold text-sm tracking-wide leading-tight">
            Brand PWRD Media
          </p>
          <p className="text-gray-400 text-xs mt-0.5">Admin</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-brand-light rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-white overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
