// Metadata is generated per-URL in src/app/nordschleife/page.tsx so that
// share/challenge URLs (?from=&time=&rank=) get a personalised preview.
//
// The layout wraps every Nordschleife page (landing, play, results, buy,
// claim) in a single LocaleProvider so language choice persists across the
// flow without needing route-level locale segments.

import { NordschleifeLocaleProvider } from '@/components/nordschleife/LocaleProvider'

export default function NordschleifeLayout({ children }: { children: React.ReactNode }) {
  return <NordschleifeLocaleProvider>{children}</NordschleifeLocaleProvider>
}
