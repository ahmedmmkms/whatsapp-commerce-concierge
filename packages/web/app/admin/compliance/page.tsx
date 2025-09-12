"use client"
import { useState } from 'react'
import { useI18n } from '../../../components/i18n/provider'

export default function AdminCompliancePage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  const { t } = useI18n()
  const [token, setToken] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<any | null>(null)
  const [exportData, setExportData] = useState<any | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function loadStatus() {
    setMessage(null)
    const r = await fetch(`${apiBase}/compliance/pdpl/status`)
    setStatus(await r.json())
  }
  async function doExport() {
    setMessage(null)
    const r = await fetch(`${apiBase}/compliance/pdpl/export`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ phone }) })
    setExportData(await r.json())
  }
  async function doDelete() {
    setMessage(null)
    const r = await fetch(`${apiBase}/compliance/pdpl/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ phone }) })
    const payload = await r.json()
    if (payload.ok) setMessage(`Delete requested; audit ${payload.auditId}`)
    else setMessage(payload.error || 'Delete failed')
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t('admin.compliance.title')}</h1>
      <div className="flex gap-2">
        <input value={token} onChange={(e) => setToken(e.target.value)} type="password" placeholder={t('admin.templates.token')} className="w-full border rounded p-2" />
        <button className="btn btn-outline" onClick={loadStatus}>{t('admin.compliance.status')}</button>
      </div>
      {status && (
        <div className="border rounded p-4 bg-white text-sm"><pre>{JSON.stringify(status, null, 2)}</pre></div>
      )}
      <div className="space-y-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded p-2" placeholder={t('admin.compliance.phone')} />
        <div className="flex gap-2">
          <button className="btn" onClick={doExport}>{t('admin.compliance.export')}</button>
          <button className="btn btn-outline" onClick={doDelete}>{t('admin.compliance.delete')}</button>
        </div>
      </div>
      {message && <div className="text-sm">{message}</div>}
      {exportData && (
        <div className="border rounded p-4 bg-white text-xs"><pre className="whitespace-pre-wrap">{JSON.stringify(exportData, null, 2)}</pre></div>
      )}
    </div>
  )
}
