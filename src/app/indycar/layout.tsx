// Metadata is generated per-URL in src/app/indycar/page.tsx so that
// share/challenge URLs (?from=&time=&rank=) get a personalised preview.
//
// The layout wraps every IndyCar page (landing, play, results, buy,
// claim) in a single LocaleProvider so language choice persists across the
// flow without needing route-level locale segments.

import { IndycarLocaleProvider } from '@/components/indycar/LocaleProvider'

export default function IndycarLayout({ children }: { children: React.ReactNode }) {
  return <IndycarLocaleProvider>{children}</IndycarLocaleProvider>
}
