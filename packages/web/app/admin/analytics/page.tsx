"use client"
import { useEffect, useMemo, useRef, useState } from 'react'

type EventRecord = { event: string; ts: number; [k: string]: any }

function useDataLayerFeed() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const originalPushRef = useRef<((...args: any[]) => any) | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const dl: any[] = (window as any).dataLayer || []
    ;(window as any).dataLayer = dl
    // hook into push
    if (!originalPushRef.current) {
      originalPushRef.current = dl.push.bind(dl)
      dl.push = (rec: any) => {
        try {
          if (rec && typeof rec === 'object') {
            setEvents((prev) => [{ ...(rec as any) }, ...prev].slice(0, 200))
          }
        } catch {}
        return originalPushRef.current!(rec)
      }
    }
    // load existing
    const existing = (dl as any[]).filter((x) => x && typeof x === 'object') as EventRecord[]
    if (existing.length) setEvents((prev) => [...existing.reverse(), ...prev].slice(0, 200))
  }, [])
  return events
}

export default function AnalyticsDashboard() {
  const events = useDataLayerFeed()
  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const e of events) t[e.event] = (t[e.event] || 0) + 1
    return t
  }, [events])
  const support = events.filter((e) => e.event === 'support_lookup')
  const preview = events.filter((e) => e.event === 'wa_preview')

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Analytics (client dataLayer)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border rounded p-4 bg-white"><div className="text-sm text-muted-foreground">support_lookup</div><div className="text-2xl font-semibold">{totals['support_lookup'] || 0}</div></div>
        <div className="border rounded p-4 bg-white"><div className="text-sm text-muted-foreground">wa_preview</div><div className="text-2xl font-semibold">{totals['wa_preview'] || 0}</div></div>
        <div className="border rounded p-4 bg-white"><div className="text-sm text-muted-foreground">events (last)</div><div className="text-2xl font-semibold">{events.length}</div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4 bg-white">
          <div className="font-medium mb-2">Support Lookups</div>
          <div className="text-xs space-y-2 max-h-80 overflow-auto">
            {support.map((e, i) => (
              <div key={i} className="border rounded p-2">
                <div className="font-mono">{new Date(e.ts || Date.now()).toLocaleString()} — {String(e.ok)}</div>
                <pre className="whitespace-pre-wrap">{JSON.stringify(e, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
        <div className="border rounded p-4 bg-white">
          <div className="font-medium mb-2">WA Preview</div>
          <div className="text-xs space-y-2 max-h-80 overflow-auto">
            {preview.map((e, i) => (
              <div key={i} className="border rounded p-2">
                <div className="font-mono">{new Date(e.ts || Date.now()).toLocaleString()} — {String(e.ok)}</div>
                <pre className="whitespace-pre-wrap">{JSON.stringify(e, null, 2)}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border rounded p-4 bg-white">
        <div className="font-medium mb-2">All Events (latest first)</div>
        <div className="text-xs space-y-2 max-h-[600px] overflow-auto">
          {events.map((e, i) => (
            <div key={i} className="border rounded p-2"><pre className="whitespace-pre-wrap">{JSON.stringify(e, null, 2)}</pre></div>
          ))}
        </div>
      </div>
    </div>
  )
}

