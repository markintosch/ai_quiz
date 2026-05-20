import { createServiceClient } from '@/lib/supabase/server'
import { DEFAULT_CONTENT, mergeContent, type SummerCourseContent } from './content'
import SummerCourseView from './SummerCourseView'

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
    // No row yet, or Supabase unavailable — fall back to built-in defaults.
    return DEFAULT_CONTENT
  }
}

export default async function SummerCoursePage() {
  const content = await loadContent()
  return <SummerCourseView c={content} />
}
