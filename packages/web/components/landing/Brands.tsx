"use client"
import { useEffect, useRef } from 'react'
import { I18nText } from '../i18n/text'

const brands = ['Apple','Samsung','Sony','Lenovo','Logitech','Bose','JBL','Microsoft','Nintendo']

export function Brands() {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf: number
    let offset = 0
    const step = () => {
      offset += 0.5
      el.scrollLeft = offset
      if (offset > el.scrollWidth - el.clientWidth) offset = 0
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    const onEnter = () => cancelAnimationFrame(raf)
    const onLeave = () => (raf = requestAnimationFrame(step))
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    return () => { cancelAnimationFrame(raf); el.removeEventListener('mouseenter', onEnter); el.removeEventListener('mouseleave', onLeave) }
  }, [])
  return (
    <section aria-labelledby="brands-title" className="py-8">
      <div className="container-page">
        <h2 id="brands-title" className="prose-title mb-4"><I18nText k="sections.brands.title" fallback="Shop by Brand" /></h2>
        <div ref={ref} className="flex gap-3 overflow-x-auto snap-x" role="list" aria-label="brands">
          {brands.map((b) => (
            <div key={b} role="listitem" className="snap-start min-w-[160px] border border-border rounded-md px-4 py-3 bg-white text-center shadow-sm">
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

