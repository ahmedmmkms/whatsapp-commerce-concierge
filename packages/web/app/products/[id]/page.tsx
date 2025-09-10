import Image from 'next/image'
import { ChatToOrderButton } from '../../../components/chat-to-order-button'
import { BackToProductsButton } from '../../../components/back-to-products-button'

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
    return <div><p className="prose-subtle">Not found</p></div>
  }
  const img = p.media?.[0]?.url
  return (
    <div>
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
        <ChatToOrderButton productId={p.id} name={p.name} currency={p.currency} priceMinor={p.price} />
        <BackToProductsButton />
      </div>
    </div>
  )
}

// (BackToProductsButton is a client component imported above)
