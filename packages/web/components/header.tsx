"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useI18n } from './i18n/provider'
import { LangToggle } from './lang-toggle'
import { MiniCart } from './mini-cart'

function CartLink() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const [count, setCount] = useState<number>(0)
  async function refresh() {
    try {
      const r = await fetch(`${apiBase}/cart`, { cache: 'no-store' })
      const payload = await r.json()
      const items = payload?.cart?.items || []
      const totalQty = items.reduce((s: number, it: any) => s + (it.qty || 0), 0)
      setCount(totalQty)
    } catch {}
  }
  useEffect(() => {
    refresh()
    const onUpd = () => refresh()
    window.addEventListener('cart-updated', onUpd as any)
    return () => window.removeEventListener('cart-updated', onUpd as any)
  }, [])
  return (
    <Link className="hover:text-foreground" href="/cart">
      Cart{count > 0 ? <span className="ml-1 inline-flex items-center justify-center rounded-full bg-black text-white text-[10px] leading-none px-2 py-1">{count}</span> : null}
    </Link>
  )
}

export function Header() {
  const { t } = useI18n()
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container-page flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">WhatsApp Concierge</Link>
        <nav className="text-sm text-muted-foreground flex items-center gap-4">
          <Link className="hover:text-foreground" href="/">{t('nav.home')}</Link>
          <Link className="hover:text-foreground" href="/products">{t('nav.products')}</Link>
          <Link className="hover:text-foreground" href="/support/order-lookup">Support</Link>
          <MiniCart />
          <Link className="hover:text-foreground" href="/orders">Orders</Link>
          <LangToggle />
        </nav>
      </div>
    </header>
  )
}
