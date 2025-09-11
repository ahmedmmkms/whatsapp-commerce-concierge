"use client"
import { useEffect } from 'react'
import { track } from '../../../components/analytics'

export default function ProductViewTracker({ id, name, priceMinor, currency }: { id: string, name: string, priceMinor: number, currency: string }) {
  useEffect(() => {
    track('view_product', { productId: id, name, priceMinor, currency })
  }, [id, name, priceMinor, currency])
  return null
}

