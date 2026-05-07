import PageWithSideImages from '@/components/sannah/PageWithSideImages'
import { getPage, pageBody } from '@/lib/sannah/server'

export const dynamic = 'force-dynamic'

export default async function OverMijPage() {
  const page = await getPage('over_mij')
  const body = pageBody(page, 'nl')
  const images = page?.images ?? []

  return <PageWithSideImages title="Over" body={body} images={images} emptyLabel="Tekst volgt." />
}
