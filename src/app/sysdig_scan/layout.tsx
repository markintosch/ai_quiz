import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '555 Benchmark Self-Assessment | Sysdig',
  description: 'Measure your cloud threat response readiness against the Sysdig 555 Benchmark. Get your score in 5 minutes.',
  robots: { index: false, follow: false },
}

export default function SysdigScanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
