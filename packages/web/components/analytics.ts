"use client"
import { useEffect } from 'react'

declare global {
  interface Window { dataLayer?: any[] }
}

export function track(event: string, payload?: Record<string, any>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ts: Date.now(), ...payload })
}

export function useTrackOnMount(event: string, payload?: Record<string, any>) {
  useEffect(() => { track(event, payload) }, [])
}

