import { Injectable } from '@nestjs/common';

type RouteKey = string;

@Injectable()
export class MetricsService {
  private routeStats = new Map<RouteKey, { count: number; durations: number[] }>();

  record(method: string, url: string, status: number, ms: number) {
    const key = this.normalize(method, url, status);
    const s = this.routeStats.get(key) || { count: 0, durations: [] };
    s.count += 1;
    // Keep last 200 samples for p95 approximation
    s.durations.push(ms);
    if (s.durations.length > 200) s.durations.shift();
    this.routeStats.set(key, s);
  }

  snapshot() {
    const entries = Array.from(this.routeStats.entries()).map(([k, v]) => ({
      key: k,
      count: v.count,
      p95: this.p95(v.durations),
      last: v.durations[v.durations.length - 1] || 0,
    }));
    return { routes: entries, generatedAt: new Date().toISOString() };
  }

  private p95(values: number[]) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
    return sorted[idx];
  }

  private normalize(method: string, url: string, status: number) {
    // Collapse query params and IDs for rough aggregation
    const path = url.split('?')[0]
      .replace(/\/[0-9a-fA-F-]{8,}/g, '/:id') // uuid-ish
      .replace(/\/[0-9]{6,}/g, '/:num');
    return `${method.toUpperCase()} ${path} ${status}`;
  }
}

