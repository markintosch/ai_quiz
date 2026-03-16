'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { useTransition } from 'react'

interface LanguageSwitcherProps {
  className?: string
  /** 'dark' = white text on dark bg (landing/nav default)
   *  'light' = grey text on light bg (quiz pages) */
  variant?: 'dark' | 'light'
}

export function LanguageSwitcher({ className = '', variant = 'dark' }: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function switchTo(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  const active   = variant === 'dark'
    ? 'text-white bg-white/15'
    : 'text-gray-900 bg-gray-200'
  const inactive = variant === 'dark'
    ? 'text-gray-400 hover:text-gray-200'
    : 'text-gray-400 hover:text-gray-600'
  const divider  = variant === 'dark' ? 'text-gray-600' : 'text-gray-300'

  return (
    <div className={`flex items-center gap-1 text-xs font-bold tracking-wide ${className} ${isPending ? 'opacity-60' : ''}`}>
      <button
        onClick={() => switchTo('en')}
        className={`px-1.5 py-0.5 rounded transition-colors ${locale === 'en' ? active : inactive}`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className={`${divider} select-none`}>|</span>
      <button
        onClick={() => switchTo('nl')}
        className={`px-1.5 py-0.5 rounded transition-colors ${locale === 'nl' ? active : inactive}`}
        aria-label="Wissel naar Nederlands"
      >
        NL
      </button>
      <span className={`${divider} select-none`}>|</span>
      <button
        onClick={() => switchTo('fr')}
        className={`px-1.5 py-0.5 rounded transition-colors ${locale === 'fr' ? active : inactive}`}
        aria-label="Passer au français"
      >
        FR
      </button>
    </div>
  )
}
