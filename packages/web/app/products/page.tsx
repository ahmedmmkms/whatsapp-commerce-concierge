import Link from 'next/link'
import Image from 'next/image'
import { Card, CardBody, CardTitle, CardSubtitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Price } from '../../components/price'
import { IconSearch } from '../../components/icons'
import { useI18n } from '../../components/i18n/provider'

async function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
}

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const base = await getApiBase()
  const qp = new URLSearchParams()
  if (typeof searchParams.q === 'string') qp.set('q', searchParams.q)
  if (typeof searchParams.category === 'string') qp.set('category', searchParams.category)
  if (typeof searchParams.priceMin === 'string') qp.set('priceMin', searchParams.priceMin)
  if (typeof searchParams.priceMax === 'string') qp.set('priceMax', searchParams.priceMax)
  qp.set('page', '1')
  qp.set('pageSize', '20')
  const res = await fetch(`${base}/products?${qp.toString()}`, { cache: 'no-store' })
  return res.json()
}

async function getCategories() {
  const base = await getApiBase()
  try {
    const res = await fetch(`${base}/categories`, { cache: 'no-store' })
    return res.json()
  } catch {
    return { items: [] }
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: any }) {
  const [data, cats] = await Promise.all([getProducts(searchParams), getCategories()])
  const items = data.items || []
  const categories = cats.items || []
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  const priceMin = typeof searchParams.priceMin === 'string' ? searchParams.priceMin : ''
  const priceMax = typeof searchParams.priceMax === 'string' ? searchParams.priceMax : ''
  return (
    // Client hook usage for localized labels via subcomponent
    // @ts-expect-error Server Component using client t via subcomponent
    <ProductsClient
      items={items}
      categories={categories}
      q={q}
      category={category}
      priceMin={priceMin}
      priceMax={priceMax}
    />
  )
}

// Client subcomponent for labels and interactions
function ProductsClient({ items, categories, q, category, priceMin, priceMax }: any) {
  const { t } = useI18n()
  return (
    <div>
      <h1 className="prose-title mb-4">{t('products.title')}</h1>
      <form className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
        <div className="md:col-span-2 flex items-center gap-2">
          <div className="relative w-full">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              placeholder={t('products.search')}
              defaultValue={q}
              className="w-full h-9 rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button type="submit" className="h-9">{t('products.go')}</Button>
        </div>
        <select
          name="category"
          defaultValue={category}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">{t('products.all')}</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input type="number" name="priceMin" placeholder={t('products.priceMin')} defaultValue={priceMin} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" />
          <input type="number" name="priceMax" placeholder={t('products.priceMax')} defaultValue={priceMax} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" />
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p: any) => {
          const img = p.media?.[0]?.url as string | undefined
          return (
            <Card key={p.id}>
              <CardBody>
                {img ? (
                  <div className="mb-3 overflow-hidden rounded-md border border-border">
                    <Image src={img} alt={p.name} width={600} height={400} className="w-full h-40 object-cover" unoptimized />
                  </div>
                ) : null}
                <CardTitle>
                  <Link href={`/products/${p.id}`} className="hover:underline">{p.name}</Link>
                </CardTitle>
                <CardSubtitle className="mt-1">
                  <Price minor={p.price} currency={p.currency} />
                </CardSubtitle>
                <div className="mt-3">
                  <Link className="btn btn-outline" href={`/products/${p.id}`}>{t('products.view')}</Link>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
