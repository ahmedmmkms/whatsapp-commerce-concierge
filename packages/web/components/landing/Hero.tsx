"use client"
import Image from 'next/image'
import Link from 'next/link'
import { I18nText } from '../i18n/text'

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-gradient-to-b from-background to-secondary py-10 sm:py-14 rounded-xl">
      <div className="container-page grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <h1 id="hero-title" className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            <I18nText k="hero.title" fallback="Top Tech. Sharp Prices. Fast Delivery." />
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-prose">
            <I18nText k="hero.subtitle" fallback="Shop trusted brands with fast shipping and easy returns." />
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/products?sort=newest" className="btn btn-primary" aria-label="Shop deals">
              <I18nText k="hero.ctaPrimary" fallback="Shop Deals" />
            </Link>
            <Link href="/cart" className="btn btn-outline" aria-label="Build your cart">
              <I18nText k="hero.ctaSecondary" fallback="Build Your Cart" />
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground" aria-label="trust-badges">
            <li className="inline-flex items-center gap-2">⚡ <I18nText k="hero.badges.fast" fallback="Fast delivery" /></li>
            <li className="inline-flex items-center gap-2">🔒 <I18nText k="hero.badges.secure" fallback="Secure checkout" /></li>
            <li className="inline-flex items-center gap-2">↩️ <I18nText k="hero.badges.returns" fallback="Free returns" /></li>
          </ul>
        </div>
        <div className="relative h-64 sm:h-80 lg:h-[420px]">
          <Image
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1280&auto=format&fit=crop"
            alt="Promotional image of electronics" width={1280} height={720}
            className="absolute inset-0 w-full h-full object-cover rounded-xl border border-border"
            priority
          />
        </div>
      </div>
    </section>
  )
}

