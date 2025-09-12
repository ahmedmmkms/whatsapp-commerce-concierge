"use client"
import Image from 'next/image'
import Link from 'next/link'
import { AddToCartButton } from '../add-to-cart-button'
import { I18nText } from '../i18n/text'

export function ProductCard({ p }: { p: any }) {
  const img = p.media?.[0]?.url as string | undefined
  return (
    <div className="card">
      <div className="card-body">
        {img && (
          <div className="mb-3 overflow-hidden rounded-md border border-border aspect-[4/3]">
            <Image src={img} alt={p.name} width={600} height={450} className="w-full h-full object-cover" unoptimized />
          </div>
        )}
        <div className="card-title">{p.name}</div>
        <div className="card-subtitle mt-1">{p.brand || ''}</div>
        <div className="mt-2 font-semibold">{(p.price / 100).toFixed(2)} {p.currency}</div>
        <div className="mt-3 flex gap-2">
          <AddToCartButton productId={p.id} />
          <Link className="btn btn-outline" href={`/products/${p.id}`}><I18nText k="product.view" fallback="View" /></Link>
        </div>
      </div>
    </div>
  )}

