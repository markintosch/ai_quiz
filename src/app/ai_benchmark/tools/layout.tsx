import type { Metadata } from 'next'

// PREVIEW — not publicly linked anywhere yet, not in sitemap, noindex.
// Safe to share the URL with reviewers; search engines stay out.
export const metadata: Metadata = {
  title:  'AI tools — community-voted · AI-benchmark',
  robots: { index: false, follow: false },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
