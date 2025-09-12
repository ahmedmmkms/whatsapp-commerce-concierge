"use client"
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type CartItem = { id: string; nameSnapshot: string; qty: number; lineTotalMinor: number; currency: string }

export function MiniCart() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [currency, setCurrency] = useState('USD')
  const menuRef = useRef<HTMLDivElement | null>(null)

  async function refresh() {
    try {
      const r = await fetch(`${apiBase}/cart`, { cache: 'no-store' })
      const payload = await r.json()
      const its = payload?.cart?.items || []
      setItems(its)
      setCurrency(payload?.cart?.currency || 'USD')
    } catch {}
  }

  useEffect(() => {
    refresh()
    const onUpd = () => refresh()
    window.addEventListener('cart-updated', onUpd as any)
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('cart-updated', onUpd as any)
      document.removeEventListener('click', onClick)
    }
  }, [])

  const count = items.reduce((s, it) => s + (it.qty || 0), 0)
  const subtotalMinor = items.reduce((s, it) => s + (it.lineTotalMinor || 0), 0)

  return (
    <div className="relative" ref={menuRef}>
      <button className="hover:text-foreground" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu">
        Cart{count > 0 ? <span className="ml-1 inline-flex items-center justify-center rounded-full bg-black text-white text-[10px] leading-none px-2 py-1">{count}</span> : null}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-72 rounded-md border border-border bg-white shadow-lg z-50">
          <div className="p-3">
            <div className="font-medium mb-2">Cart</div>
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground">Your cart is empty.</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <div className="pr-2 truncate">{it.nameSnapshot} × {it.qty}</div>
                    <div>{(it.lineTotalMinor / 100).toFixed(2)} {currency}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">Subtotal: {(subtotalMinor / 100).toFixed(2)} {currency}</div>
              <Link href="/cart" className="btn btn-outline btn-sm">View Cart</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

