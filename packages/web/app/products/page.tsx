import ProductsClient from '../../components/products-client'

async function getApiBase() {
  // Use an absolute API URL on the server to avoid Invalid URL for '/api/*'
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    '/api'
  )
}

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const base = await getApiBase()
  const qp = new URLSearchParams()
  const qRaw = typeof searchParams.q === 'string' ? searchParams.q.trim() : ''
  const catRaw = typeof searchParams.category === 'string' ? searchParams.category.trim() : ''
  const minRaw = typeof searchParams.minPrice === 'string' ? searchParams.minPrice.trim() : ''
  const maxRaw = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice.trim() : ''
  if (qRaw) qp.set('q', qRaw)
  if (catRaw) qp.set('category', catRaw)
  if (minRaw) {
    const v = Number(minRaw)
    if (Number.isFinite(v)) qp.set('minPrice', String(Math.round(v * 100)))
  }
  if (maxRaw) {
    const v = Number(maxRaw)
    if (Number.isFinite(v)) qp.set('maxPrice', String(Math.round(v * 100)))
  }
  qp.set('page', '1')
  qp.set('pageSize', '20')
  try {
    const res = await fetch(`${base}/products?${qp.toString()}`, { cache: 'no-store' })
    if (!res.ok) return { items: [], total: 0 }
    return await res.json()
  } catch (e) {
    console.error('getProducts failed', e)
    return { items: [], total: 0 }
  }
}

async function getCategories() {
  const base = await getApiBase()
  try {
    const res = await fetch(`${base}/categories`, { cache: 'no-store' })
    if (!res.ok) return { items: [] }
    return await res.json()
  } catch {
    return { items: [] }
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: any }) {
  const [data, cats] = await Promise.all([getProducts(searchParams), getCategories()])
  const items = data.items || []
  const categories = cats.categories || cats.items || []
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  const priceMin = typeof searchParams.minPrice === 'string' ? searchParams.minPrice : ''
  const priceMax = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : ''
  return (
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
