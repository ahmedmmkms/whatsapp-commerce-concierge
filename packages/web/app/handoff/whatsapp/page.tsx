"use client"
import { useEffect } from 'react'
import { useI18n } from '../../../components/i18n/provider'

function buildMessage(params: URLSearchParams) {
  const name = params.get('name') || ''
  const productId = params.get('productId') || ''
  const currency = params.get('currency') || ''
  const priceMinor = params.get('priceMinor')
  const price = priceMinor ? (Number(priceMinor) / 100).toFixed(2) : ''
  const lang = typeof window !== 'undefined' && document?.documentElement?.dir === 'rtl' ? 'ar' : 'en'
  const lines = [
    lang === 'ar' ? 'مرحبًا، أود الطلب:' : 'Hello, I would like to order:',
    name ? `${lang === 'ar' ? 'المنتج' : 'Product'}: ${name}` : '',
    productId ? `${lang === 'ar' ? 'المعرف' : 'ID'}: ${productId}` : '',
    price && currency ? `${lang === 'ar' ? 'السعر' : 'Price'}: ${price} ${currency}` : '',
    '',
    (lang === 'ar' ? 'أُرسلت من موقع الويب' : 'Sent from the website'),
  ].filter(Boolean)
  return lines.join('\n')
}

export default function WhatsAppHandoff() {
  const { t } = useI18n()
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER
    const msg = buildMessage(params)
    if (waNumber) {
      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
      window.location.replace(url)
    }
  }, [])

  const hasNumber = !!process.env.NEXT_PUBLIC_WA_NUMBER
  return (
    <div>
      <h1 className="prose-title mb-2">WhatsApp Handoff</h1>
      {!hasNumber ? (
        <p className="prose-subtle">Set NEXT_PUBLIC_WA_NUMBER to enable deeplinks.</p>
      ) : (
        <p className="prose-subtle">{t('cta.chatToOrder')}…</p>
      )}
    </div>
  )
}
