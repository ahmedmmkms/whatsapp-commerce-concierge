"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { Card, CardBody, CardTitle, CardSubtitle } from './ui/card'
import { Price } from './price'
import { IconSearch } from './icons'
import { useI18n } from './i18n/provider'
import { useTrackOnMount } from './analytics'

type Props = {
  items: any[]
  categories: any[]
  q: string
  category: string
  priceMin: string
  priceMax: string
}

export default function ProductsClient({ items, categories, q, category, priceMin, priceMax }: Props) {
  const { t } = useI18n()
  useTrackOnMount('view_list', { q, category, count: items.length })
  return (
    <div>
      <h1 className="prose-title mb-4">{t('products.title')}</h1>
      <form className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
        <div className="md:col-span-2 flex items-center gap-2">
          <div className="relative w-full">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              placeholder={t('products.search')}
              defaultValue={q}
              aria-label={t('products.search')}
              className="w-full h-9 rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button type="submit" className="h-9">{t('products.go')}</Button>
        </div>
        <select
          name="category"
          defaultValue={category}
          aria-label={t('products.category')}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">{t('products.all')}</option>
          {categories.map((c: any) => (
            <option key={c.id || c.slug} value={c.slug || c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input type="number" name="minPrice" placeholder={t('products.priceMin')} defaultValue={priceMin} aria-label={t('products.priceMin')} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" />
          <input type="number" name="maxPrice" placeholder={t('products.priceMax')} defaultValue={priceMax} aria-label={t('products.priceMax')} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" />
        </div>
      </form>
      {items.length === 0 && (
        <div className="card mb-6">
          <div className="card-body">
            <h3 className="card-title">{t('products.empty.title')}</h3>
            <p className="card-subtitle mt-1">{t('products.empty.subtitle')}</p>
            <div className="mt-3">
              <a className="btn btn-outline" href="/products">{t('products.back')}</a>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p: any) => {
          const img = p.media?.[0]?.url as string | undefined
          return (
            <Card key={p.id}>
              <CardBody>
                {img ? (
                  <div className="mb-3 overflow-hidden rounded-md border border-border">
                    <Image src={img} alt={p.name} width={600} height={400} className="w-full h-40 object-cover" unoptimized />
                  </div>
                ) : null}
                <CardTitle>
                  <Link href={`/products/${p.id}`} className="hover:underline">{p.name}</Link>
                </CardTitle>
                <CardSubtitle className="mt-1">
                  <Price minor={p.price} currency={p.currency} />
                </CardSubtitle>
                <div className="mt-3">
                  <Link className="btn btn-outline" href={`/products/${p.id}`}>{t('products.view')}</Link>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
