import { ProductCard } from './ProductCard'

async function getApiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    '/api'
  )
}

async function fetchProducts() {
  const base = await getApiBase()
  try {
    const r = await fetch(`${base}/products?page=1&pageSize=8`, { cache: 'no-store' })
    if (!r.ok) return { items: [] }
    return await r.json()
  } catch {
    return { items: [] }
  }
}

export async function ProductsDeck({ query }: { query?: string }) {
  const data = await fetchProducts()
  const items = data.items || []
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((p: any) => (<ProductCard key={p.id} p={p} />))}
    </div>
  )
}

