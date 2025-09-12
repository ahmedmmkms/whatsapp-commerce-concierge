async function getApiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    '/api'
  )
}

async function getOrder(id: string) {
  const base = await getApiBase()
  try {
    const r = await fetch(`${base}/orders/${id}`, { cache: 'no-store' })
    if (!r.ok) return { ok: false }
    return await r.json()
  } catch {
    return { ok: false }
  }
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const data = await getOrder(params.id)
  if (!data?.ok) return <div className="p-6">Order not found</div>
  const o = data.order
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold"><I18nText k="orders.order" fallback="Order" /> {o.id}</h1>
      <div className="border rounded p-4 bg-white space-y-1">
        <div>Status: {o.status}</div>
        <div>Date: {new Date(o.createdAt).toLocaleString()}</div>
        <div>Total: {(o.totalMinor / 100).toFixed(2)} {o.currency}</div>
      </div>
      <div className="border rounded p-4 bg-white">
        <div className="font-medium mb-2"><I18nText k="orders.items" /></div>
        {o.items?.map((it: any) => (
          <div key={it.id} className="flex justify-between text-sm py-1">
            <div>{it.nameSnapshot} × {it.qty}</div>
            <div>{(it.lineTotalMinor / 100).toFixed(2)} {it.currency}</div>
          </div>
        ))}
      </div>
      {o.address && (
        <div className="border rounded p-4 bg-white">
          <div className="font-medium mb-2"><I18nText k="orders.address" /></div>
          <div className="text-sm whitespace-pre-line">{[o.address.name, o.address.phone, o.address.line1, o.address.line2, `${o.address.city ?? ''} ${o.address.region ?? ''}`.trim(), o.address.country, o.address.postalCode].filter(Boolean).join('\n')}</div>
        </div>
      )}
    </div>
  )
}
import { I18nText } from '../../../components/i18n/text'
import { I18nText } from '../../../components/i18n/text'
