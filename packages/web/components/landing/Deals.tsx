import { I18nText } from '../i18n/text'
import { Suspense } from 'react'
import { ProductsDeck } from './ProductsDeck'

export function DealsSection() {
  return (
    <section aria-labelledby="deals-title" className="py-8">
      <div className="container-page">
        <div className="flex items-end justify-between mb-4">
          <h2 id="deals-title" className="prose-title">
            <I18nText k="sections.deals.title" fallback="Deals of the Day" />
          </h2>
          <div className="text-sm text-muted-foreground" aria-live="polite">
            <span>⏳</span> 08:12:09
          </div>
        </div>
        <Suspense>
          <ProductsDeck query="" />
        </Suspense>
      </div>
    </section>
  )
}

