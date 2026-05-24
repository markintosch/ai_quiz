// FILE: src/app/admin/layout.tsx
import LogoutButton from '@/components/admin/LogoutButton'
import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
