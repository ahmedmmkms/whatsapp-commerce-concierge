"use client"
import { useI18n } from './i18n/provider'

export function NotFoundText() {
  const { t } = useI18n()
  return <p className="prose-subtle">{t('detail.notFound')}</p>
}

