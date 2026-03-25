import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['en', 'nl', 'fr'],
  defaultLocale: 'nl',
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
