import PageWithSideImages from '@/components/sannah/PageWithSideImages'
import { getPage, pageBody } from '@/lib/sannah/server'

export const dynamic = 'force-dynamic'

export default async function OverEnPage() {
  const page = await getPage('over_mij')
  const body = pageBody(page, 'en')
  const images = page?.images ?? []

  return <PageWithSideImages title="About" body={body} images={images} emptyLabel="Coming soon." />
}
