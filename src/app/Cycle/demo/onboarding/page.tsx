// FILE: src/app/Cycle/demo/onboarding/page.tsx
// Auth-free preview of the onboarding flow. Rendered for design review;
// the geocode + submit calls in step 2/3 still hit auth-gated APIs and
// will fail without a real session — that's expected.

import OnboardingClient from '../../onboarding/OnboardingClient'

export const metadata = { title: 'Demo — onboarding' }

export default function DemoOnboardingPage() {
  return <OnboardingClient />
}
