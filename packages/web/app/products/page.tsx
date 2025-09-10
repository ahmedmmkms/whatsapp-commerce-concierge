import ProductsClient from '../../components/products-client'

async function getApiBase() {
  if (process.env.NEXT_PUBLIC_API_URL) return '/api'
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
  const categories = cats.items || []
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  const priceMin = typeof searchParams.priceMin === 'string' ? searchParams.priceMin : ''
  const priceMax = typeof searchParams.priceMax === 'string' ? searchParams.priceMax : ''
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
