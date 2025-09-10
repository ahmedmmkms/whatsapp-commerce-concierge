import Image from 'next/image'

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
        {/* Client i18n label */}
        {/* @ts-expect-error Server Component passing props to Client Component */}
        <(await import('../../../components/chat-to-order-button')).ChatToOrderButton
          productId={p.id}
          name={p.name}
          currency={p.currency}
          priceMinor={p.price}
        />
        {/* @ts-expect-error Server Component using client i18n for label */}
        <BackToProductsButton />
      </div>
    </div>
  )
}

// Client-only label for back link
function BackToProductsButton() {
  // @ts-expect-error dynamic import in server component
  return <(async () => {
    const { useI18n } = await import('../../../components/i18n/provider')
    const { IconArrowLeft } = await import('../../../components/icons')
    const Comp = () => {
      const { t } = useI18n()
      return <a className="btn btn-outline" href="/products"><IconArrowLeft className="mr-2 inline" />{t('products.back')}</a>
    }
    return <Comp />
  }) />
}
