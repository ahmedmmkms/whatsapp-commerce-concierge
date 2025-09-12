"use client"
import { useState } from 'react'
import { useI18n } from '../../../components/i18n/provider'
import { track } from '../../../components/analytics'

type Msg = { type: string; text?: string }

export default function WaPreviewPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const { t } = useI18n()
  const guardToken = process.env.NEXT_PUBLIC_ADMIN_PREVIEW_TOKEN || process.env.NEXT_PUBLIC_ADMIN_TOKEN
  const [text, setText] = useState('browse')
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Msg[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const unlocked = !guardToken || code === guardToken

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessages(null)
    setError(null)
    try {
      const r = await fetch(`${apiBase}/whatsapp/preview?lang=${lang}&text=${encodeURIComponent(text)}`, { method: 'POST' })
      const payload = await r.json()
      if (!r.ok) throw new Error(payload?.error || 'Preview failed')
      setMessages(payload.messages || [])
      track('wa_preview', { ok: true, lang, text, count: (payload.messages || []).length })
    } catch (err: any) {
      setError(err?.message || 'Preview failed')
      track('wa_preview', { ok: false, lang, text, error: err?.message || String(err) })
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t('admin.waPreview.title')}</h1>
      {guardToken && !unlocked && (
        <div className="flex gap-2">
          <input type="password" value={code} onChange={(e) => setCode(e.target.value)} className="w-full border rounded p-2" placeholder="Admin Code" />
          <button className="btn btn-outline" onClick={() => void 0}>Unlock</button>
        </div>
      )}
      {(!guardToken || unlocked) && (
      <form onSubmit={onSend} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded p-2" placeholder={t('admin.waPreview.placeholder')} />
        <select value={lang} onChange={(e) => setLang(e.target.value as any)} className="border rounded p-2" aria-label={t('admin.waPreview.lang')}>
          <option value="en">EN</option>
          <option value="ar">AR</option>
        </select>
        <button className="btn" disabled={loading}>{loading ? t('common.loading') : t('admin.waPreview.send')}</button>
      </form>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {messages && (
        <div className="border rounded p-4 bg-white text-sm space-y-2">
          {messages.map((m, i) => (
            <div key={i} className="border rounded p-2"><pre className="whitespace-pre-wrap">{JSON.stringify(m, null, 2)}</pre></div>
          ))}
        </div>
      )}
      )}
    </div>
  )
}
