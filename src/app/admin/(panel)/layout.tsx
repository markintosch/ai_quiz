// FILE: src/app/admin/(panel)/layout.tsx
// Every admin page except /admin/login lives in this route group, so this
// server-side check guards all of them. It must not depend on the proxy
// alone: a proxy that silently stops running would expose the whole panel.
import { redirect } from 'next/navigation'
import { isAuthorised } from '@/lib/admin/auth'
import LogoutButton from '@/components/admin/LogoutButton'
import AdminNav from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAuthorised())) redirect('/admin/login')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-brand flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-brand-accent font-bold text-sm tracking-wide leading-tight">
            Brand PWRD Media
          </p>
          <p className="text-gray-300 text-xs mt-0.5">Admin</p>
        </div>

        {/* Grouped, searchable navigation */}
        <div className="flex-1 overflow-hidden">
          <AdminNav />
        </div>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-white/10">
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
