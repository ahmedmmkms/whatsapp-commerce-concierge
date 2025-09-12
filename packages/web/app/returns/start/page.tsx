"use client"
import { useState } from 'react'

export default function StartReturnPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const r = await fetch(`${apiBase}/returns`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, reason, notes }) })
      const payload = await r.json()
      if (!r.ok || payload.ok === false) throw new Error(payload?.error || 'Failed')
      setResult(payload)
    } catch (err: any) {
      setError(err?.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Start a Return</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <textarea className="w-full border rounded p-2" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button className="btn" disabled={loading}>{loading ? 'Submitting…' : 'Submit'}</button>
      </form>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {result && (
        <div className="border rounded p-4 bg-white">
          <div>Return created: {result.id}</div>
          <div>RMA: <strong>{result.rmaCode}</strong></div>
          <div className="mt-2"><a className="btn btn-outline btn-sm" href={`/returns/${encodeURIComponent(result.id)}`}>View Status</a></div>
        </div>
      )}
    </div>
  )
}

