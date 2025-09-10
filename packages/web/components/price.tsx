"use client"
import * as React from 'react'

type PriceProps = {
  minor: number
  currency: string
  locale?: string
}

export function Price({ minor, currency, locale }: PriceProps) {
  const major = minor / 100
  const fmt = new Intl.NumberFormat(locale || undefined, { style: 'currency', currency })
  return <span>{fmt.format(major)}</span>
}

