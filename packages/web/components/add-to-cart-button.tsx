"use client"
import { useState } from 'react'

export function AddToCartButton({ productId, qty = 1 }: { productId: string; qty?: number }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  async function add() {
    setLoading(true)
    try {
      await fetch(`${apiBase}/cart/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, qty }) })
      setAdded(true)
      // notify listeners (e.g., header cart badge)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cart-updated'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button className="btn" onClick={add} disabled={loading} aria-live="polite">
      {loading ? 'Adding…' : added ? 'Added!' : 'Add to Cart'}
    </button>
  )
}

