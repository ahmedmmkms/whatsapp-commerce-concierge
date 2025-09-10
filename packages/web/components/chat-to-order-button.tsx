"use client"
import { useI18n } from './i18n/provider'
import { IconWhatsApp } from './icons'

type Props = {
  productId: string
  name: string
  currency: string
  priceMinor: number
}

export function ChatToOrderButton({ productId, name, currency, priceMinor }: Props) {
  const { t } = useI18n()
  const href = `/handoff/whatsapp?productId=${encodeURIComponent(productId)}&name=${encodeURIComponent(name)}&currency=${encodeURIComponent(currency)}&priceMinor=${encodeURIComponent(priceMinor)}`
  return (
    <a className="btn btn-primary" href={href}><IconWhatsApp className="mr-2" />{t('cta.chatToOrder')}</a>
  )
}
