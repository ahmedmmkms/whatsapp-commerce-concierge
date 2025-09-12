"use client"
import { useState } from 'react'

export default function ReturnsByOrderPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])

  async function onLookup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setItems([])
    try {
      const r = await fetch(`${apiBase}/returns?orderId=${encodeURIComponent(orderId)}`)
      const payload = await r.json()
      if (!r.ok || payload.ok === false) throw new Error(payload?.error || 'Lookup failed')
      setItems(payload.returns || [])
    } catch (err: any) {
      setError(err?.message || 'Lookup failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Returns by Order</h1>
      <form onSubmit={onLookup} className="flex gap-2">
        <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full border rounded p-2" placeholder="Order ID" />
        <button className="btn" disabled={loading}>{loading ? 'Looking…' : 'Lookup'}</button>
      </form>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="space-y-3">
        {items.map((x) => (
          <div key={x.id} className="border rounded p-3 bg-white">
            <div className="font-medium">Return {x.id}</div>
            <div className="text-sm text-muted-foreground">Status: {x.status}</div>
            <div className="text-sm">RMA: {x.rmaCode}</div>
            <div className="mt-2"><a className="btn btn-outline btn-sm" href={`/returns/${encodeURIComponent(x.id)}`}>View</a></div>
          </div>
        ))}
      </div>
    </div>
  )
}

