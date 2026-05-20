// FILE: src/components/sannah/LogoutButton.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SannahLogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function logout() {
    setBusy(true)
    try {
      await fetch('/api/sannah/auth', { method: 'DELETE' })
      router.push('/sannah/admin/login')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      style={{
        background: 'transparent',
        border: '1px solid var(--sannah-border)',
        color: 'var(--sannah-text-muted)',
        padding: '6px 14px',
        borderRadius: 999,
        cursor: busy ? 'wait' : 'pointer',
        fontSize: 12,
        letterSpacing: '0.04em',
      }}
    >
      {busy ? 'Bezig…' : 'Uitloggen'}
    </button>
  )
}
