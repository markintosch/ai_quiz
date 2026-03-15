import { redirect } from 'next/navigation'

// Root page: redirect to the default locale.
// next-intl middleware handles this for most requests,
// but this ensures /  always works even if middleware misses it.
export default function RootPage() {
  redirect('/en')
}
