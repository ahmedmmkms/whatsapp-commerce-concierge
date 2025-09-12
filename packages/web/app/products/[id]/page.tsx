import Image from 'next/image'
import { ChatToOrderButton } from '../../../components/chat-to-order-button'
import { BackToProductsButton } from '../../../components/back-to-products-button'
import { AddToCartButton } from '../../../components/add-to-cart-button'
import ProductViewTracker from './tracker'
import { NotFoundText } from '../../../components/not-found-text'

async function getApiBase() {
  // Use an absolute API URL on the server to avoid Invalid URL for '/api/*'
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    '/api'
  )
}

async function getProduct(id: string) {
  const base = await getApiBase()
  try {
    const res = await fetch(`${base}/products/${id}`, { cache: 'no-store' })
    if (!res.ok) return { product: null }
    return await res.json()
  } catch (e) {
    console.error('getProduct failed', e)
    return { product: null }
  }
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const data = await getProduct(params.id)
  const p = data.product
  if (!p) {
    return <div><NotFoundText /></div>
  }
  const img = p.media?.[0]?.url
  return (
    <div>
      <ProductViewTracker id={p.id} name={p.name} priceMinor={p.price} currency={p.currency} />
      <h1 className="prose-title mb-2">{p.name}</h1>
      {img && (
        <div className="mb-3 overflow-hidden rounded-lg border border-border max-w-xl">
          <Image src={img} alt={p.name} width={1200} height={800} className="w-full h-auto" unoptimized />
        </div>
      )}
      <p className="text-lg font-medium">
        {(p.price / 100).toFixed(2)} {p.currency}
      </p>
      {p.description && (<p className="prose-subtle mt-2">{p.description}</p>)}

      <div className="mt-6 flex gap-3">
        <AddToCartButton productId={p.id} />
        <ChatToOrderButton productId={p.id} name={p.name} currency={p.currency} priceMinor={p.price} />
        <BackToProductsButton />
      </div>
    </div>
  )
}

// (BackToProductsButton is a client component imported above)
