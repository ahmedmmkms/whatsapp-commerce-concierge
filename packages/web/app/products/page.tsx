import Link from 'next/link'

async function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
}

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const base = await getApiBase()
  const qp = new URLSearchParams()
  if (typeof searchParams.q === 'string') qp.set('q', searchParams.q)
  if (typeof searchParams.category === 'string') qp.set('category', searchParams.category)
  qp.set('page', '1')
  qp.set('pageSize', '20')
  const res = await fetch(`${base}/products?${qp.toString()}`, { cache: 'no-store' })
  return res.json()
}

export default async function ProductsPage({ searchParams }: { searchParams: any }) {
  const data = await getProducts(searchParams)
  const items = data.items || []
  return (
    <main style={{ padding: 24 }}>
      <h1>Products</h1>
      <form>
        <input name="q" placeholder="Search" defaultValue={searchParams.q || ''} />
        <button type="submit">Go</button>
      </form>
      <ul>
        {items.map((p: any) => (
          <li key={p.id} style={{ margin: '8px 0' }}>
            <Link href={`/products/${p.id}`}>{p.name}</Link>{' '}
            <small>{(p.price / 100).toFixed(2)} {p.currency}</small>
          </li>
        ))}
      </ul>
    </main>
  )
}

