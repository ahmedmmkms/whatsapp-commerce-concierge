"use client"
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('theme')
    const isDark = stored ? stored === 'dark' : document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', isDark)
    setDark(isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { window.localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
  }

  return (
    <button className="btn btn-outline h-8 px-3" aria-label="Toggle theme" onClick={toggle}>
      {dark ? '🌙' : '☀️'}
      <span className="ml-2 text-xs">{dark ? 'Dark' : 'Light'}</span>
    </button>
  )
}

