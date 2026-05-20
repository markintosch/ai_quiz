// FILE: src/app/sannah/admin/login/page.tsx
// Sannah login: eenvoudige form, post naar /api/sannah/auth, redirect naar /sannah/admin.

import LoginClient from './LoginClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title:  'Sannah — inloggen',
  robots: { index: false, follow: false },
}

export default function SannahLoginPage() {
  return <LoginClient />
}
