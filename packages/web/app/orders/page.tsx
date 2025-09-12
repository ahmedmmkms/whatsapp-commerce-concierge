"use client"
import { useState } from 'react'
import { useI18n } from '../../components/i18n/provider'

export default function OrdersByPhonePage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const { t } = useI18n()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])

  async function onLookup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setOrders([])
    try {
      const r = await fetch(`${apiBase}/orders?phone=${encodeURIComponent(phone)}`)
      const payload = await r.json()
      if (!r.ok) throw new Error(payload?.error || 'Lookup failed')
      setOrders(payload.orders || [])
    } catch (err: any) {
      setError(err?.message || 'Lookup failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t('orders.title')}</h1>
      <form onSubmit={onLookup} className="flex gap-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded p-2" placeholder={t('orders.lookup.placeholder')} />
        <button className="btn" disabled={loading}>{loading ? t('common.loading') : t('orders.lookup.cta')}</button>
      </form>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="border rounded p-3 bg-white">
            <div className="font-medium">Order {o.id}</div>
            <div className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleString()} — {o.status}</div>
            <div className="text-sm">Total: {(o.totalMinor / 100).toFixed(2)} {o.currency}</div>
            <div className="mt-2"><a className="btn btn-outline btn-sm" href={`/orders/${encodeURIComponent(o.id)}`}>{t('orders.view')}</a></div>
          </div>
        ))}
      </div>
    </div>
  )
}
