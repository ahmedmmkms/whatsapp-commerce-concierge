"use client"
import { useI18n } from './provider'

export function I18nText({ k }: { k: string }) {
  const { t } = useI18n()
  return <>{t(k)}</>
}

