"use client"
import { useEffect, useState } from 'react'
import { useI18n } from '../../components/i18n/provider'

type CartItem = {
  id: string
  nameSnapshot: string
  qty: number
  priceSnapshotMinor: number
  lineTotalMinor: number
  currency: string
}
type Cart = {
  id: string
  items: CartItem[]
  currency: string
  subtotalMinor?: number
  taxMinor?: number
  shippingMinor?: number
  totalMinor?: number
}

export default function CartPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api"
  const { t } = useI18n()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [estimate, setEstimate] = useState<{ shippingMinor: number; currency: string; freeThresholdMinor: number } | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const r = await fetch(`${apiBase}/cart`)
      const data = await r.json()
      setCart(data.cart)
    } catch (e: any) {
      setError(e?.message || 'Failed to load cart')
    } finally {
      setLoading(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-updated'))
      }
    }
  }

  useEffect(() => { refresh() }, [])

  async function updateQty(itemId: string, qty: number) {
    await fetch(`${apiBase}/cart/items/${encodeURIComponent(itemId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ qty }) })
    await refresh()
  }
  async function removeItem(itemId: string) {
    await fetch(`${apiBase}/cart/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' })
    await refresh()
  }
  async function getEstimate() {
    setEstimating(true)
    try {
      const r = await fetch(`${apiBase}/cart/estimate-shipping`)
      setEstimate(await r.json())
    } finally { setEstimating(false) }
  }

  if (loading) return <div>{t('common.loading')}</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!cart) return <div>{t('cart.title')}</div>

  const currency = cart.currency || 'USD'
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t('cart.title')}</h1>

      {!cart.items?.length && <div>{t('cart.empty')}</div>}

      {cart.items?.length ? (
        <div className="space-y-3">
          {cart.items.map((it) => (
            <div key={it.id} className="flex items-center justify-between border rounded p-3 bg-white">
              <div>
                <div className="font-medium">{it.nameSnapshot}</div>
                <div className="text-sm text-muted-foreground">{(it.priceSnapshotMinor / 100).toFixed(2)} {it.currency} × {it.qty} = {(it.lineTotalMinor / 100).toFixed(2)} {it.currency}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-outline h-8" onClick={() => updateQty(it.id, Math.max(0, it.qty - 1))}>-</button>
                <span className="w-8 text-center">{it.qty}</span>
                <button className="btn btn-outline h-8" onClick={() => updateQty(it.id, it.qty + 1)}>+</button>
                <button className="btn btn-outline h-8" onClick={() => removeItem(it.id)}>{t('cart.remove')}</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="border rounded p-4 bg-white">
        <div>{t('cart.subtotal')}: {(cart.subtotalMinor || 0) / 100} {currency}</div>
        <div>{t('cart.shipping')}: {(cart.shippingMinor || 0) / 100} {currency}</div>
        <div>{t('cart.total')}: <strong>{(cart.totalMinor || 0) / 100} {currency}</strong></div>
      </div>

      <div className="flex gap-3">
        <button className="btn" onClick={getEstimate} disabled={estimating}>{estimating ? t('common.loading') : t('cart.estimate')}</button>
        <a className="btn btn-outline" href="/checkout">{t('cart.checkout')}</a>
      </div>

      {estimate && (
        <div className="text-sm text-muted-foreground">Shipping: {(estimate.shippingMinor / 100).toFixed(2)} {estimate.currency} (free over {(estimate.freeThresholdMinor / 100).toFixed(2)} {estimate.currency})</div>
      )}
    </div>
  )
}
