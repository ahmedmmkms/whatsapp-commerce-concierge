"use client"
import { useI18n } from './i18n/provider'
import { IconArrowLeft } from './icons'

export function BackToProductsButton() {
  const { t } = useI18n()
  return (
    <a className="btn btn-outline" href="/products"><IconArrowLeft className="mr-2 inline" />{t('products.back')}</a>
  )
}

