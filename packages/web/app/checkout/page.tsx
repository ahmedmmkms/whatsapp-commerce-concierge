"use client"
import { useState } from 'react'
import { useI18n } from '../../components/i18n/provider'

type Method = 'cod' | 'stripe'

export default function CheckoutPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const { t } = useI18n()
  const [method, setMethod] = useState<Method>('cod')
  const [address, setAddress] = useState({ name: '', phone: '', line1: '', line2: '', city: '', region: '', postalCode: '', country: 'SA' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const r = await fetch(`${apiBase}/checkout/init`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method, address }) })
      const payload = await r.json()
      if (!r.ok || payload.ok === false) {
        throw new Error(payload?.error || 'Checkout failed')
      }
      setResult(payload)
      if (payload.checkoutUrl) {
        window.location.href = payload.checkoutUrl
      }
    } catch (err: any) {
      setError(err?.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t('checkout.title')}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm">{t('checkout.method')}</label>
          <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="w-full border rounded p-2">
            <option value="cod">{t('checkout.method.cod')}</option>
            <option value="stripe">{t('checkout.method.stripe')}</option>
          </select>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{t('checkout.address')}</legend>
          <input placeholder="Name" className="w-full border rounded p-2" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
          <input placeholder="Phone" className="w-full border rounded p-2" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
          <input placeholder="Line 1" required className="w-full border rounded p-2" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
          <input placeholder="Line 2" className="w-full border rounded p-2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="City" required className="border rounded p-2" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <input placeholder="Region" className="border rounded p-2" value={address.region} onChange={(e) => setAddress({ ...address, region: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Postal Code" className="border rounded p-2" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
            <input placeholder="Country (ISO2)" required className="border rounded p-2" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
          </div>
        </fieldset>
        <button type="submit" disabled={loading} className="btn">{loading ? t('checkout.processing') : t('checkout.placeOrder')}</button>
      </form>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {result && result.method === 'cod' && (
        <div className="border rounded p-4 bg-white">
          <div>{t('checkout.orderCreated')}: <strong>{result.orderId}</strong></div>
          <div>Total: {(result.totalMinor / 100).toFixed(2)} {result.currency}</div>
          <div className="mt-2"><a className="btn btn-outline" href={`/orders/${encodeURIComponent(result.orderId)}`}>{t('checkout.viewOrder')}</a></div>
        </div>
      )}
    </div>
  )
}
