"use client"
import { useEffect, useState } from 'react'

type Template = { id: string, key: string, locale: string, channel: string, body: string, isActive: boolean }

export default function AdminTemplatesPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const [token, setToken] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`${apiBase}/cms/templates`)
      const payload = await r.json()
      setTemplates(payload.templates || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load templates')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function save(t: Template) {
    const r = await fetch(`${apiBase}/cms/templates/${encodeURIComponent(t.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ body: t.body, isActive: t.isActive, updatedBy: 'admin-ui' }) })
    if (!r.ok) alert('Save failed')
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Templates (Admin)</h1>
      <div className="flex items-center gap-2">
        <input value={token} onChange={(e) => setToken(e.target.value)} type="password" placeholder="Admin Token" className="w-full border rounded p-2" />
        <button className="btn btn-outline" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="space-y-4">
        {templates.map((t) => (
          <div key={t.id} className="border rounded p-4 bg-white">
            <div className="font-medium">{t.key} / {t.locale} / {t.channel}</div>
            <textarea className="w-full border rounded p-2 mt-2 min-h-[100px]" value={t.body} onChange={(e) => setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, body: e.target.value } : x))} />
            <div className="mt-2 flex gap-2">
              <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={t.isActive} onChange={(e) => setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, isActive: e.target.checked } : x))} /> Active</label>
              <button className="btn btn-sm" onClick={() => save(t)}>Save</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

