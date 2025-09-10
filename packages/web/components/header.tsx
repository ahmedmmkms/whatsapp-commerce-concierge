"use client"
import Link from 'next/link'
import { useI18n } from './i18n/provider'
import { LangToggle } from './lang-toggle'

export function Header() {
  const { t } = useI18n()
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container-page flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">WhatsApp Concierge</Link>
        <nav className="text-sm text-muted-foreground flex items-center gap-4">
          <Link className="hover:text-foreground" href="/">{t('nav.home')}</Link>
          <Link className="hover:text-foreground" href="/products">{t('nav.products')}</Link>
          <LangToggle />
        </nav>
      </div>
    </header>
  )
}

