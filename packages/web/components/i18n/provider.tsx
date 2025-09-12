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

// Overlay dictionaries for newly added pages/components without touching existing keys
const extraEn: Dict = {
  'nav.support': 'Support',
  'nav.cart': 'Cart',
  'nav.orders': 'Orders',
  'support.title': 'Support: Order Lookup',
  'support.orderId': 'Order ID',
  'support.phone': 'Phone (E.164)',
  'support.lookup': 'Lookup',
  'support.noOrders': 'No orders found for this phone.',
  'support.view': 'View',
  'common.loading': 'Loading…',
  'common.error': 'Something went wrong',
  'common.requestId': 'Request ID',
  'cart.title': 'Cart',
  'cart.empty': 'Your cart is empty.',
  'cart.subtotal': 'Subtotal',
  'cart.shipping': 'Shipping',
  'cart.total': 'Total',
  'cart.estimate': 'Estimate Shipping',
  'cart.checkout': 'Go to Checkout',
  'cart.remove': 'Remove',
  'cart.qty': 'Qty',
  'checkout.title': 'Checkout',
  'checkout.method': 'Payment Method',
  'checkout.address': 'Address',
  'checkout.placeOrder': 'Place Order',
  'checkout.processing': 'Processing…',
  'checkout.orderCreated': 'Order created',
  'checkout.viewOrder': 'View Order',
  'checkout.method.cod': 'Cash on Delivery',
  'checkout.method.stripe': 'Card (Stripe)',
  'orders.title': 'Orders by Phone',
  'orders.lookup.cta': 'Lookup',
  'orders.lookup.placeholder': 'Phone (E.164)',
  'orders.view': 'View',
  'orders.notFound': 'Order not found',
  'orders.items': 'Items',
  'orders.address': 'Shipping Address',
  'returns.start.title': 'Start a Return',
  'returns.start.orderId': 'Order ID',
  'returns.start.reason': 'Reason',
  'returns.start.notes': 'Notes (optional)',
  'returns.start.submit': 'Submit',
  'returns.detail.title': 'Return',
  'returns.list.title': 'Returns by Order',
  'admin.templates.title': 'Templates (Admin)',
  'admin.templates.token': 'Admin Token',
  'admin.templates.refresh': 'Refresh',
  'admin.templates.save': 'Save',
  'admin.templates.active': 'Active',
  'admin.compliance.title': 'Compliance (Admin)',
  'admin.compliance.status': 'Status',
  'admin.compliance.export': 'Export',
  'admin.compliance.delete': 'Request Delete (Destructive)',
  'admin.compliance.phone': 'Phone (E.164)',
  'admin.waPreview.title': 'WhatsApp Preview',
  'admin.waPreview.placeholder': "Type message (e.g., 'browse', 'status <orderId>')",
  'admin.waPreview.lang': 'Lang',
  'admin.waPreview.send': 'Send',
  'nav.deals': 'Deals',
  'nav.new': 'New',
  'hero.title': 'Top Tech. Sharp Prices. Fast Delivery.',
  'hero.subtitle': 'Shop trusted brands with fast shipping and easy returns.',
  'hero.ctaPrimary': 'Shop Deals',
  'hero.ctaSecondary': 'Build Your Cart',
  'hero.badges.fast': 'Fast delivery',
  'hero.badges.secure': 'Secure checkout',
  'hero.badges.returns': 'Free returns',
  'search.placeholder': 'Search products, brands…',
  'sections.categories.title': 'Top Categories',
  'sections.deals.title': 'Deals of the Day',
  'sections.best.title': 'Best-Sellers',
  'sections.new.title': 'New Arrivals',
  'sections.brands.title': 'Shop by Brand',
  'sections.testimonials.title': 'What customers say',
  'sections.why.title': 'Why buy from us?',
  'product.addToCart': 'Add to Cart',
  'product.view': 'View',
  'product.inStock': 'In Stock',
  'product.outOfStock': 'Out of Stock',
  'newsletter.title': 'Stay in the loop',
  'newsletter.cta': 'Subscribe',
  'newsletter.placeholder': 'Enter your email',
  'newsletter.success': 'Thanks! You are subscribed.',
  'footer.rights': 'All rights reserved.',
  'footer.links.shipping': 'Shipping',
  'footer.links.returns': 'Returns',
  'footer.links.warranty': 'Warranty',
  'footer.links.contact': 'Contact',
}

const extraAr: Dict = {
  'nav.support': 'الدعم',
  'nav.cart': 'السلة',
  'nav.orders': 'الطلبات',
  'support.title': 'الدعم: البحث عن الطلب',
  'support.orderId': 'رقم الطلب',
  'support.phone': 'الهاتف (E.164)',
  'support.lookup': 'بحث',
  'support.noOrders': 'لا توجد طلبات لهذا الرقم.',
  'support.view': 'عرض',
  'common.loading': 'جاري التحميل…',
  'common.error': 'حدث خطأ ما',
  'common.requestId': 'معرّف الطلب',
  'cart.title': 'السلة',
  'cart.empty': 'سلتك فارغة.',
  'cart.subtotal': 'المجموع الفرعي',
  'cart.shipping': 'الشحن',
  'cart.total': 'الإجمالي',
  'cart.estimate': 'تقدير الشحن',
  'cart.checkout': 'الانتقال للدفع',
  'cart.remove': 'إزالة',
  'cart.qty': 'الكمية',
  'checkout.title': 'الدفع',
  'checkout.method': 'طريقة الدفع',
  'checkout.address': 'العنوان',
  'checkout.placeOrder': 'إتمام الطلب',
  'checkout.processing': 'جارٍ المعالجة…',
  'checkout.orderCreated': 'تم إنشاء الطلب',
  'checkout.viewOrder': 'عرض الطلب',
  'checkout.method.cod': 'الدفع عند الاستلام',
  'checkout.method.stripe': 'بطاقة (Stripe)',
  'orders.title': 'الطلبات حسب الرقم',
  'orders.lookup.cta': 'بحث',
  'orders.lookup.placeholder': 'الهاتف (E.164)',
  'orders.view': 'عرض',
  'orders.notFound': 'الطلب غير موجود',
  'orders.items': 'العناصر',
  'orders.address': 'عنوان الشحن',
  'returns.start.title': 'بدء إرجاع',
  'returns.start.orderId': 'رقم الطلب',
  'returns.start.reason': 'السبب',
  'returns.start.notes': 'ملاحظات (اختياري)',
  'returns.start.submit': 'إرسال',
  'returns.detail.title': 'طلب إرجاع',
  'returns.list.title': 'الإرجاعات حسب الطلب',
  'admin.templates.title': 'القوالب (إدارة)',
  'admin.templates.token': 'رمز المدير',
  'admin.templates.refresh': 'تحديث',
  'admin.templates.save': 'حفظ',
  'admin.templates.active': 'نشط',
  'admin.compliance.title': 'الامتثال (إدارة)',
  'admin.compliance.status': 'الحالة',
  'admin.compliance.export': 'تصدير',
  'admin.compliance.delete': 'طلب حذف (إجراء خطير)',
  'admin.compliance.phone': 'الهاتف (E.164)',
  'admin.waPreview.title': 'معاينة واتساب',
  'admin.waPreview.placeholder': "اكتب رسالة (مثال: 'browse' أو 'status <orderId>')",
  'admin.waPreview.lang': 'اللغة',
  'admin.waPreview.send': 'إرسال',
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

  const dict = lang === 'ar' ? { ...ar, ...extraAr } : { ...en, ...extraEn }
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
