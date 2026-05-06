// FILE: src/app/Cycle/demo/checkin/page.tsx
// Visual preview of the alcohol step in the daily check-in. No auth, no
// submission — just the step rendered standalone so the design can be
// reviewed.

import AlcoholStepDemo from './AlcoholStepDemo'

export const metadata = { title: 'Demo — alcohol stap' }

export default function DemoCheckinPage() {
  return <AlcoholStepDemo />
}
