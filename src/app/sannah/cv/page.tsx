import PageWithSideImages from '@/components/sannah/PageWithSideImages'
import { getPage, pageBody } from '@/lib/sannah/server'

export const dynamic = 'force-dynamic'

export default async function CvPage() {
  const page = await getPage('cv')
  const body = pageBody(page, 'nl')
  const images = page?.images ?? []
  return <PageWithSideImages title="CV" body={body} images={images} emptyLabel="CV volgt." />
}
