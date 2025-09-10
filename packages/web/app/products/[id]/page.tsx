async function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
}

async function getProduct(id: string) {
  const base = await getApiBase()
  const res = await fetch(`${base}/products/${id}`, { cache: 'no-store' })
  return res.json()
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const data = await getProduct(params.id)
  const p = data.product
  if (!p) {
    return <main style={{ padding: 24 }}><p>Not found</p></main>
  }
  const img = p.media?.[0]?.url
  return (
    <main style={{ padding: 24 }}>
      <h1>{p.name}</h1>
      {img && (<img src={img} alt={p.name} style={{ maxWidth: '400px', display: 'block', marginBottom: 12 }} />)}
      <p>{(p.price / 100).toFixed(2)} {p.currency}</p>
      {p.description && (<p>{p.description}</p>)}
    </main>
  )
}

