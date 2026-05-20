import { createServiceClient } from '@/lib/supabase/server'
import { LANDING, type Lang } from '@/lib/cyber-compass/i18n'
import HcssTestimonialsEditor, { type LocaleData } from './Editor'

export const dynamic = 'force-dynamic'

async function loadLocale(lang: Lang): Promise<LocaleData> {
  const fallback: LocaleData = {
    heading: LANDING[lang].testimonialsHeading,
    items: LANDING[lang].testimonials,
  }
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('site_content')
      .select('content')
      .eq('locale', lang)
      .eq('product_key', 'hcss')
      .single() as { data: { content: { testimonialsHeading?: string; testimonials?: { quote: string; role: string }[] } } | null }
    const c = data?.content
    return {
      heading: c?.testimonialsHeading ?? fallback.heading,
      items: (c?.testimonials && c.testimonials.length > 0) ? c.testimonials : fallback.items,
    }
  } catch {
    return fallback
  }
}

export default async function AdminHcssPage() {
  const [nl, en] = await Promise.all([loadLocale('nl'), loadLocale('en')])
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">HCSS · testimonials</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bewerk de testimonials op{' '}
          <a href="/HCSS" target="_blank" className="text-brand-accent underline">markdekock.com/HCSS</a>.
          Gebruik rollen, geen namen. Wijzigingen zijn na opslaan direct live.
        </p>
      </div>
      <HcssTestimonialsEditor initial={{ nl, en }} />
    </div>
  )
}
