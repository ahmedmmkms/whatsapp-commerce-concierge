"use client"
import { useI18n } from './i18n/provider'

export function HomeHero({ apiBase }: { apiBase: string }) {
  const { t } = useI18n()
  return (
    <section className="rounded-lg border border-border bg-card p-8 mb-8">
      <h1 className="prose-title">WhatsApp Commerce Concierge</h1>
      <p className="prose-subtle mt-2">{t('hero.subtitle')}</p>
      <div className="mt-4 text-sm text-muted-foreground">{t('home.apiBase')}: {apiBase}</div>
      <div className="mt-6"><a className="btn btn-primary" href="/products">{t('cta.browse')}</a></div>
    </section>
  )
}
