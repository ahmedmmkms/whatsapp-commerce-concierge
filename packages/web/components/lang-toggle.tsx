"use client"
import { useI18n } from './i18n/provider'

export function LangToggle() {
  const { lang, toggle, t } = useI18n()
  return (
    <button className="btn btn-outline h-8 px-3" onClick={toggle} aria-label="Toggle language">
      {lang.toUpperCase()} · <span className="ml-1">{lang === 'ar' ? t('rtl.on') : t('rtl.off')}</span>
    </button>
  )
}

