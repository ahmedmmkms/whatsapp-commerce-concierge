async function getApiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    '/api'
  )
}

async function getReturn(id: string) {
  const base = await getApiBase()
  try {
    const r = await fetch(`${base}/returns/${id}`, { cache: 'no-store' })
    if (!r.ok) return { ok: false }
    return await r.json()
  } catch { return { ok: false } }
}

export default async function ReturnDetailPage({ params }: { params: { id: string } }) {
  const data = await getReturn(params.id)
  if (!data?.ok) return <div className="p-6">Return not found</div>
  const ret = data.return
  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold"><I18nText k="returns.detail.title" /> {ret.id}</h1>
      <div className="border rounded p-4 bg-white space-y-1">
        <div>Order: {ret.orderId}</div>
        <div>Status: {ret.status}</div>
        <div>RMA: {ret.rmaCode}</div>
      </div>
      {ret.items?.length ? (
        <div className="border rounded p-4 bg-white">
          <div className="font-medium mb-2">Items</div>
          {ret.items.map((it: any) => (
            <div key={it.id} className="text-sm">{it.sku} × {it.qty}</div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
import { I18nText } from '../../../components/i18n/text'
