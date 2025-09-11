"use client"
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'en' | 'ar'

type Dict = Record<string, string>

const en: Dict = {
  'nav.home': 'Home',
  'nav.products': 'Products',
  'hero.subtitle': 'Conversational commerce for AR/EN with elegant web handoff.',
  'cta.browse': 'Browse Products',
  'cta.chatToOrder': 'Chat to Order on WhatsApp',
  'home.apiBase': 'API base',
  'home.features.fast.title': 'Fast',
  'home.features.fast.subtitle': 'P95 ≤ 200ms for core routes',
  'home.features.bilingual.title': 'Bilingual',
  'home.features.bilingual.subtitle': 'Arabic-first with RTL support',
  'home.features.handoff.title': 'Seamless Handoff',
  'home.features.handoff.subtitle': 'WhatsApp deeplinks from product pages',
  'products.title': 'Products',
  'products.search': 'Search',
  'products.go': 'Go',
  'products.category': 'Category',
  'products.all': 'All',
  'products.priceMin': 'Min Price',
  'products.priceMax': 'Max Price',
  'products.view': 'View',
  'products.back': 'Back to Products',
  'products.empty.title': 'No products found',
  'products.empty.subtitle': 'Try adjusting your search or filters.',
  'detail.notFound': 'Not found',
  'handoff.title': 'WhatsApp Handoff',
  'handoff.redirecting': 'Redirecting you to WhatsApp…',
  'handoff.missing': 'Set NEXT_PUBLIC_WA_NUMBER to enable deeplinks.',
  'rtl.on': 'RTL: on',
  'rtl.off': 'RTL: off',
}

const ar: Dict = {
  'nav.home': 'الرئيسية',
  'nav.products': 'المنتجات',
  'hero.subtitle': 'تجارة محادثات بالعربية والإنجليزية مع انتقال أنيق للويب.',
  'cta.browse': 'تصفح المنتجات',
  'cta.chatToOrder': 'الدردشة للطلب عبر واتساب',
  'home.apiBase': 'عنوان واجهة البرمجة',
  'home.features.fast.title': 'سريع',
  'home.features.fast.subtitle': 'زمن P95 ≤ 200ms للمسارات الأساسية',
  'home.features.bilingual.title': 'ثنائي اللغة',
  'home.features.bilingual.subtitle': 'لغة عربية أولاً مع دعم RTL',
  'home.features.handoff.title': 'انتقال سلس',
  'home.features.handoff.subtitle': 'روابط واتساب مباشرة من صفحات المنتج',
  'products.title': 'المنتجات',
  'products.search': 'بحث',
  'products.go': 'اذهب',
  'products.category': 'الفئة',
  'products.all': 'الكل',
  'products.priceMin': 'أقل سعر',
  'products.priceMax': 'أعلى سعر',
  'products.view': 'عرض',
  'products.back': 'عودة إلى المنتجات',
  'products.empty.title': 'لا توجد منتجات',
  'products.empty.subtitle': 'جرّب تعديل البحث أو الفلاتر.',
  'detail.notFound': 'غير موجود',
  'handoff.title': 'الانتقال إلى واتساب',
  'handoff.redirecting': 'يتم توجيهك إلى واتساب…',
  'handoff.missing': 'يرجى ضبط NEXT_PUBLIC_WA_NUMBER لتفعيل الروابط المباشرة.',
  'rtl.on': 'الاتجاه: يمين-يسار',
  'rtl.off': 'الاتجاه: يسار-يمين',
}

function isRTL(lang: Lang) { return lang === 'ar' }

type I18nContextValue = {
  lang: Lang
  isRTL: boolean
  t: (key: string) => string
  setLang: (l: Lang) => void
  toggle: () => void
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function getInitialLang(): Lang {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('lang') as Lang | null
    if (stored === 'en' || stored === 'ar') return stored
  }
  return process.env.NEXT_PUBLIC_RTL === '1' ? 'ar' as Lang : 'en'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang())

  useEffect(() => {
    window.localStorage.setItem('lang', lang)
    const dir = isRTL(lang) ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', dir)
  }, [lang])

  const dict = lang === 'ar' ? ar : en
  const t = (key: string) => dict[key] ?? key
  const setLang = (l: Lang) => setLangState(l)
  const toggle = () => setLangState(prev => prev === 'ar' ? 'en' : 'ar')

  const value = useMemo(() => ({ lang, isRTL: isRTL(lang), t, setLang, toggle }), [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
