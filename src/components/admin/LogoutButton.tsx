// FILE: src/components/admin/LogoutButton.tsx
'use client'

export default function LogoutButton() {
  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    window.location.href = '/admin/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-brand-light rounded transition-colors"
    >
      Sign out
    </button>
  )
}
