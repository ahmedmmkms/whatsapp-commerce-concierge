"use client";
import { useState } from "react";
import { useI18n } from "../../../components/i18n/provider";
import { track } from "../../../components/analytics";

type OrderSummary = { id: string; createdAt: string; status: string; totalMinor: number; currency: string };

export default function OrderLookupPage() {
  const { t } = useI18n()
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api";

  async function onLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setRequestId(null);
    setLoading(true);
    try {
      let payload: any = {};
      if (orderId) {
        const r = await fetch(`${apiBase}/orders/${encodeURIComponent(orderId)}`);
        setRequestId(r.headers.get('x-request-id'));
        payload = await r.json();
        track('support_lookup', { mode: 'by_id', ok: r.ok, orderId, requestId: r.headers.get('x-request-id') || undefined });
      } else if (phone) {
        const r = await fetch(`${apiBase}/orders?phone=${encodeURIComponent(phone)}`);
        setRequestId(r.headers.get('x-request-id'));
        payload = await r.json();
        track('support_lookup', { mode: 'by_phone', ok: r.ok, phone, requestId: r.headers.get('x-request-id') || undefined });
      } else {
        setError("Provide order ID or phone (E.164)");
        setLoading(false);
        return;
      }
      setResult(payload);
    } catch (err: any) {
      setError(err?.message ?? "Lookup failed");
      track('support_lookup', { ok: false, error: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t('support.title')}</h1>
      <form onSubmit={onLookup} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm">{t('support.orderId')}</label>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. uuid" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">{t('support.phone')}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded p-2" placeholder="+9665..." />
        </div>
        <button type="submit" disabled={loading} className="bg-black text-white rounded px-4 py-2 disabled:opacity-60">
          {loading ? t('common.loading') : t('support.lookup')}
        </button>
      </form>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {result && (
        <div className="space-y-3">
          {'orders' in result && Array.isArray(result.orders) && (
            <div className="space-y-2">
              {result.orders.map((o: any) => (
                <div key={o.id} className="border rounded p-3 bg-white">
                  <div className="font-medium">Order {o.id}</div>
                  <div className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleString()} — {o.status}</div>
                  <div className="text-sm">Total: {(o.totalMinor / 100).toFixed(2)} {o.currency}</div>
                  <div className="mt-2"><a className="btn btn-outline btn-sm" href={`/orders/${encodeURIComponent(o.id)}`}>View</a></div>
                </div>
              ))}
              {result.orders.length === 0 && (
                <div className="text-sm text-muted-foreground">{t('support.noOrders')}</div>
              )}
            </div>
          )}
          {'order' in result && result.order && (
            <div className="border rounded p-4 bg-white">
              <div className="font-medium mb-2">Order {result.order.id}</div>
              <div className="text-sm text-muted-foreground">{new Date(result.order.createdAt).toLocaleString()} — {result.order.status}</div>
              <div className="text-sm mb-2">Total: {(result.order.totalMinor / 100).toFixed(2)} {result.order.currency}</div>
              <div className="mt-2"><a className="btn btn-outline btn-sm" href={`/orders/${encodeURIComponent(result.order.id)}`}>View Details</a></div>
            </div>
          )}
          {requestId && (
            <div className="text-xs text-muted-foreground">{t('common.requestId')}: {requestId}</div>
          )}
        </div>
      )}
    </div>
  );
}
