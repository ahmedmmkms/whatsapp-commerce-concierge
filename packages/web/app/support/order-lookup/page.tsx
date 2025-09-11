"use client";
import { useState } from "react";

type OrderSummary = { id: string; createdAt: string; status: string; totalMinor: number; currency: string };

export default function OrderLookupPage() {
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api";

  async function onLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      let payload: any = {};
      if (orderId) {
        const r = await fetch(`${apiBase}/orders/${encodeURIComponent(orderId)}`);
        payload = await r.json();
      } else if (phone) {
        const r = await fetch(`${apiBase}/orders?phone=${encodeURIComponent(phone)}`);
        payload = await r.json();
      } else {
        setError("Provide order ID or phone (E.164)");
        setLoading(false);
        return;
      }
      setResult(payload);
    } catch (err: any) {
      setError(err?.message ?? "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Support: Order Lookup</h1>
      <form onSubmit={onLookup} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm">Order ID</label>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. uuid" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Phone (E.164)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded p-2" placeholder="+9665..." />
        </div>
        <button type="submit" disabled={loading} className="bg-black text-white rounded px-4 py-2 disabled:opacity-60">
          {loading ? "Looking up..." : "Lookup"}
        </button>
      </form>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {result && (
        <div className="border rounded p-4 bg-white">
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

