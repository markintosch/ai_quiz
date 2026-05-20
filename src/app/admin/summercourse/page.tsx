import { createServiceClient } from '@/lib/supabase/server'
import { DEFAULT_CONTENT, mergeContent, type SummerCourseContent } from '@/app/summercourse/content'
import SummerCourseEditor from './Editor'

export const dynamic = 'force-dynamic'

const PRODUCT_KEY = 'summer_course'
const LOCALE = 'nl'

async function loadContent(): Promise<SummerCourseContent> {
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('site_content')
      .select('content')
      .eq('locale', LOCALE)
      .eq('product_key', PRODUCT_KEY)
      .single() as { data: { content: Record<string, unknown> } | null }
    return mergeContent(DEFAULT_CONTENT, data?.content)
  } catch {
    return DEFAULT_CONTENT
  }
}

export default async function AdminSummerCoursePage() {
  const initial = await loadContent()
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">Summer Course · pagina-inhoud</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bewerk alle tekst van{' '}
          <a href="/summercourse" target="_blank" className="text-brand-accent underline">markdekock.com/summercourse</a>.
          Wijzigingen zijn na opslaan direct live.
        </p>
      </div>
      <SummerCourseEditor initial={initial} />
    </div>
  )
}
