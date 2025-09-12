"use client"
import { useI18n } from './provider'

export function I18nText({ k, fallback }: { k: string; fallback?: string }) {
  const { t } = useI18n()
  const v = t(k)
  return <>{v === k && fallback ? fallback : v}</>
}
