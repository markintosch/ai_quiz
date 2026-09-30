// FILE: src/app/admin/page.tsx
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'

export default async function AdminRoot() {
  await requireAdmin()

  redirect('/admin/dashboard')
}
